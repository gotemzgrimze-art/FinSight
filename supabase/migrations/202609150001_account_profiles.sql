begin;

create table public.account_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  terms_accepted_at timestamptz not null default now(),
  terms_version text not null,
  privacy_accepted_at timestamptz,
  privacy_version text,
  created_at timestamptz not null default now(),
  constraint normalized_username check (
    username = lower(btrim(username)) and username ~ '^[a-z0-9_]{3,30}$'
  )
);

create table public.user_agreements (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null check (document_type in ('terms', 'privacy')),
  document_version text not null,
  accepted_at timestamptz not null default now()
);
alter table public.user_agreements enable row level security;
revoke all on public.user_agreements from anon, authenticated;
grant select on public.user_agreements to authenticated;
create policy "Read own agreements" on public.user_agreements for select to authenticated using ((select auth.uid()) = user_id);

alter table public.account_profiles enable row level security;
revoke all on public.account_profiles from anon, authenticated;
grant select on public.account_profiles to authenticated;
create policy "Read own account profile" on public.account_profiles
  for select to authenticated using ((select auth.uid()) = id);

-- Runs in the same transaction as auth.users insertion. A competing username
-- claim fails the entire signup, leaving no account without a profile.
-- No password, password hash, or email is copied into application tables.
create function public.create_account_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(new.raw_user_meta_data ->> 'terms_accepted', '') <> 'true'
    or coalesce(new.raw_user_meta_data ->> 'terms_version', '') <> '2026-09-15'
    or coalesce(new.raw_user_meta_data ->> 'privacy_accepted', '') <> 'true'
    or coalesce(new.raw_user_meta_data ->> 'privacy_version', '') <> '2026-09-15' then
    raise exception 'Terms acceptance is required';
  end if;
  insert into public.account_profiles (id, username, terms_version, privacy_version, privacy_accepted_at)
  values (
    new.id,
    lower(btrim(new.raw_user_meta_data ->> 'username')),
    new.raw_user_meta_data ->> 'terms_version',
    new.raw_user_meta_data ->> 'privacy_version',
    now()
  );
  insert into public.user_agreements (user_id, document_type, document_version)
    values (new.id, 'terms', new.raw_user_meta_data ->> 'terms_version');
  insert into public.user_agreements (user_id, document_type, document_version)
    values (new.id, 'privacy', new.raw_user_meta_data ->> 'privacy_version');
  return new;
end;
$$;

revoke all on function public.create_account_profile() from public, anon, authenticated;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_account_profile();

commit;
