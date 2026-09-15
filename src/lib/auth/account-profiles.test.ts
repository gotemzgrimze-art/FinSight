import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const db = new PGlite();
const first = '11111111-1111-4111-8111-111111111111';
const second = '22222222-2222-4222-8222-222222222222';
const metadata = (username: string, extra = {}) => JSON.stringify({ username, terms_accepted: true, terms_version: '2026-09-15', ...extra });
const insert = (id: string, data: string) => db.query('insert into auth.users (id, raw_user_meta_data) values ($1, $2::jsonb)', [id, data]);

beforeAll(async () => {
	await db.exec(`
		create role anon;
		create role authenticated;
		create schema auth;
		create table auth.users (id uuid primary key, raw_user_meta_data jsonb);
		create function auth.uid() returns uuid language sql stable as
		$$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
		grant usage on schema auth to authenticated;
		grant execute on function auth.uid() to authenticated;
	`);
	await db.exec(readFileSync('supabase/migrations/202609150001_account_profiles.sql', 'utf8'));
}, 120_000);
afterAll(() => db.close());

describe('account profile migration in PostgreSQL', () => {
	it('normalizes the username and records acceptance without credentials', async () => {
		await insert(first, metadata(' Mixed_Name '));
		const { rows } = await db.query('select * from public.account_profiles');
		expect(rows).toEqual([expect.objectContaining({ id: first, username: 'mixed_name', terms_version: '2026-09-15', terms_accepted_at: expect.any(Date) })]);
		expect(Object.keys(rows[0] as object).sort()).toEqual(['created_at', 'id', 'terms_accepted_at', 'terms_version', 'username']);
	});
	it('rolls back auth creation for a case-insensitive duplicate', async () => {
		await expect(insert(second, metadata('MIXED_NAME'))).rejects.toThrow(/unique/i);
		expect((await db.query('select id from auth.users where id = $1', [second])).rows).toEqual([]);
	});
	it.each([{ terms_accepted: false }, { terms_version: 'old-version' }, { terms_accepted: null }])('rejects missing/current terms acceptance %j', async (extra) => {
		await expect(insert(second, metadata('new_name', extra))).rejects.toThrow(/Terms acceptance/);
	});
	it('rejects invalid usernames even when the app validation is bypassed', async () => {
		await expect(insert(second, metadata('two words'))).rejects.toThrow(/normalized_username/);
	});
	it('keeps username claims unique across competing inserts', async () => {
		const results = await Promise.allSettled([
			insert('33333333-3333-4333-8333-333333333333', metadata(' Race_Name ')),
			insert('44444444-4444-4444-8444-444444444444', metadata('RACE_NAME'))
		]);
		expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
		expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);
	});
	it('permits only own-row reads and rejects client writes', async () => {
		await db.exec(`set role authenticated; set request.jwt.claim.sub = '${first}';`);
		try {
			expect((await db.query('select id from public.account_profiles')).rows).toEqual([{ id: first }]);
			await expect(db.query("update public.account_profiles set username = 'stolen'")).rejects.toThrow(/permission denied/);
			await expect(db.query('delete from public.account_profiles')).rejects.toThrow(/permission denied/);
			await expect(db.query("insert into public.account_profiles (id, username, terms_version) values ($1, 'other', '2026-09-15')", [second])).rejects.toThrow(/permission denied/);
		} finally { await db.exec('reset role;'); }
		await db.exec('set role anon;');
		try { await expect(db.query('select * from public.account_profiles')).rejects.toThrow(/permission denied/); }
		finally { await db.exec('reset role;'); }
	});
	it('deletes the profile when the auth account is deleted', async () => {
		await db.query('delete from auth.users where id = $1', [first]);
		expect((await db.query('select * from public.account_profiles where id = $1', [first])).rows).toEqual([]);
	});
});
