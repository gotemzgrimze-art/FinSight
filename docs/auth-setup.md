# Authentication setup

The app remains SvelteKit + TypeScript. Authentication uses server-side Supabase
Auth with HTTP-only cookies and progressively enhanced SvelteKit forms. The public
planner still works without signing in. Accounts do not sync or decrypt the existing
device-local financial profile, and signing out does not erase that local storage.

## 1. Environment and runtime

Use Node.js 22 or newer (24 recommended), then `pnpm install --frozen-lockfile`.
Copy `.env.example` to `.env` and set these values in your hosting environment too:

- `PUBLIC_SUPABASE_URL`: your Supabase project URL.
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the publishable key from the project Connect
  dialog. Do **not** use a service-role or secret key.
- Legal settings described in section 4.

Never commit `.env`. All `PUBLIC_` settings are public information. Supabase service
credentials are not needed anywhere in this application.

## 2. Database and Auth settings

Run `supabase/migrations/202609150001_account_profiles.sql` once in your project's
Supabase SQL Editor (or apply it with your normal Supabase migration workflow).
Apply it before accepting any signups.

The trigger atomically creates an account profile as part of an `auth.users` insert.
The unique constraint and normalization reject duplicate usernames, including
simultaneous requests. Failed profile creation rolls back the auth user insert.
The table stores only user ID, username, Terms version/acceptance timestamp and
creation timestamp. Passwords and password hashes stay in Supabase Auth. Clients
can only read their own profile; they cannot insert, update or delete profile rows.

In Supabase Authentication:

1. Enable the Email provider and **Confirm email**. Keep confirmation enabled to
   avoid exposing registered emails through provider behavior.
2. Set minimum password length to **8** as well as the app-side validation.
3. Set Site URL to your production HTTPS origin. Add exact redirect URLs:
   `https://YOUR-DOMAIN/auth/confirm` and, for development,
   `http://localhost:5173/auth/confirm`. Include `127.0.0.1` only if used locally.
4. Configure transactional SMTP, sender identity and sensible Supabase Auth rate
   limits. Built-in provider email delivery is limited; verify delivery before launch.
5. Do not enable OAuth, anonymous signup or other providers without extending the
   username and acceptance flow: this migration requires both on every new auth user.

This migration targets the app's new, dedicated Supabase project. Existing users in
another project are not automatically backfilled. Never apply it to a shared project
without reviewing other applications' signup requirements.

## 3. Email templates (required)

These server-side flows use token hashes, **not** the default fragment-based links.
In Supabase Authentication → Email Templates, replace the action links with:

**Confirm signup**

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=signup">Confirm your FinSight account</a>
```

**Reset password**

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery">Reset your FinSight password</a>
```

The app supplies `/auth/confirm` as `RedirectTo`. The endpoint accepts only signup
or recovery tokens, verifies them with Supabase, and uses fixed internal destinations.
Expired, reused or invalid links display a generic error. No token or raw provider
error is rendered in a page. Exclude callback query strings and all auth POST bodies
from infrastructure/access logs; confirmation URLs and passwords are secrets.

## 4. Legal pages

Editable drafts live at `src/routes/terms/+page.svelte` and
`src/routes/privacy/+page.svelte`. They describe the actual current planner,
Supabase accounts, essential cookies, device-local data, demonstration subscriptions,
and account recovery. Istanbul, Türkiye and `gotemzgrimze@gmail.com` are prefilled
from the owner's instructions. They are drafts, not a guarantee of legal compliance.

Before publishing:

- Set `PUBLIC_LEGAL_ENTITY` to the operator's full legal person/company name.
- Set `PUBLIC_LEGAL_ADDRESS` to the appropriate business/contact postal address.
- Confirm `PUBLIC_LEGAL_JURISDICTION` and `PUBLIC_LEGAL_CONTACT_EMAIL`.
- Set `PUBLIC_LEGAL_DEPLOYMENT_DETAILS` to the actual hosting and email providers,
  Supabase region, processing countries, applicable transfer safeguards, log retention
  periods and backup deletion windows. Match these statements to provider settings
  and your real deletion/support procedures.
- Have qualified counsel review these drafts for your operation and target users,
  including KVKK international transfers and any required Turkish-language notice.
  The draft assumes accounts are for adults 18+; review this before serving minors.
- After finalizing the text and operational details, set
  `PUBLIC_LEGAL_PUBLISHED=true`. Until then signup is disabled, on client and server.

Optional `PUBLIC_TERMS_URL` and `PUBLIC_PRIVACY_URL` override the included pages with
published HTTPS pages; the local routes redirect to them. Keep the recorded Terms
version aligned with the documents you publish. The current version is `2026-09-15`.
When changing it, update `TERMS_VERSION` in validation.ts and add a migration replacing
the trigger's accepted version. Preserve prior versions; handling reacceptance by
existing users is outside this initial account-creation flow.

Legal reference material used for these drafts:

- [KVKK Law No. 6698, including amended Article 9 and Articles 10–11](https://www.kvkk.gov.tr/Icerik/6649/Personal-Data-Protection-Law)
- [KVKK obligation to inform](https://www.kvkk.gov.tr/Icerik/6641/Obligation-to-inform)
- [ICO transparency guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/right-to-be-informed/)
- [FTC privacy commitments](https://www.ftc.gov/business-guidance/privacy-security/consumer-privacy)

## Behavior and verification

- `/login`: generic failed login message, exactly `Invalid email or password.`
- `/signup`: trims/lowercases email and username; requires 3–30 ASCII letters,
  digits or underscores for usernames, an 8-character password, matching confirmation
  and explicit, initially unchecked Terms acceptance. Password whitespace is preserved.
- Signup uses the same response for provider success, duplicate email, username
  conflicts and provider failures. This deliberately does not offer public username
  availability lookup. The message suggests trying another username if no mail arrives.
- `/forgot-password`: identical visible outcome for known/unknown emails and errors.
- `/forgot-email`: safe recovery guidance without revealing an email by username.
- `/reset-password`: verifies the user server-side before updating a password.
- `/logout`: POST only; clears the current session, retaining device-local planner data.
- Account deletion: handle verified requests through the published contact address;
  deleting the user in Supabase Auth cascades to the account profile. Self-service
  account deletion and username changes are not implemented.

Run:

```sh
pnpm run check
pnpm test
pnpm run build
pnpm exec playwright install chromium
pnpm run test:e2e
```

Tests cover validation, secret-free action results, provider-error masking, confirmation
destinations, reset authorization, and the actual SQL migration in PGlite/PostgreSQL
(normalization, duplicate rollback, RLS, denied writes and deletion). PGlite serializes
queries; the competing-insert test verifies the constraint, not production multi-session
load. Browser tests use fake configuration, never real accounts, and cover desktop/mobile,
password toggles, unchecked consent, error focus, loading, links and no-JavaScript validation.

After configuration, manually verify a new signup and delivered confirmation email,
an existing-email signup, two simultaneous case-variant username claims, confirmed
login, reset email delivery, expired/reused links, sign-out and session persistence.
These require a real configured Supabase project and cannot be proven by local mocks.

Implementation follows [Supabase's SvelteKit guide](https://supabase.com/docs/guides/getting-started/tutorials/with-sveltekit).
