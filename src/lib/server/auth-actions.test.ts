import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { authAction } from './auth-actions';
import { LOGIN_ERROR, RESET_MESSAGE, SIGNUP_MESSAGE } from '../auth/validation';
import { GET as confirm } from '../../routes/auth/confirm/+server';

vi.mock('./auth-config', () => ({ authConfig: () => ({ signupEnabled: true }) }));

const auth = {
	signUp: vi.fn(), signInWithPassword: vi.fn(), resetPasswordForEmail: vi.fn(),
	getUser: vi.fn(), updateUser: vi.fn(), verifyOtp: vi.fn()
};
const event = (overrides: Record<string, string> = {}) => {
	const body = new FormData();
	for (const [key, value] of Object.entries({ email: ' PERSON@example.com ', username: ' Person ', password: 'secret123', confirmPassword: 'secret123', terms: 'on', ...overrides })) body.set(key, value);
	return { request: new Request('https://finsight.test/signup', { method: 'POST', body }), locals: { supabase: { auth } }, url: new URL('https://finsight.test/signup') } as unknown as RequestEvent<Record<string, never>, '/auth/confirm'>;
};
beforeEach(() => vi.resetAllMocks());

describe('server authentication boundary', () => {
	it('rejects missing terms before contacting the provider and never returns passwords', async () => {
		const result = await authAction('signup')(event({ terms: '' }));
		expect(result).toMatchObject({ status: 400, data: { errors: { terms: expect.any(String) } } });
		expect(auth.signUp).not.toHaveBeenCalled();
		expect(JSON.stringify(result)).not.toContain('secret123');
	});
	it('passes only username and terms metadata to Supabase', async () => {
		auth.signUp.mockResolvedValue({ data: {}, error: null });
		await authAction('signup')(event());
		expect(auth.signUp).toHaveBeenCalledWith({ email: 'person@example.com', password: 'secret123', options: {
			data: { username: 'person', terms_accepted: true, terms_version: '2026-09-15' },
			emailRedirectTo: 'https://finsight.test/auth/confirm'
		} });
	});
	it.each(['already_registered', 'username_unique', 'rate_limited', 'email_unconfirmed'])('does not reveal signup provider error %s', async (code) => {
		auth.signUp.mockResolvedValue({ error: { code, message: 'Private provider detail' } });
		expect(await authAction('signup')(event())).toEqual({ success: true, message: SIGNUP_MESSAGE });
	});
	it('returns the same signup response for success and transport failure', async () => {
		auth.signUp.mockResolvedValueOnce({ error: null }).mockRejectedValueOnce(new Error('private detail'));
		expect(await authAction('signup')(event())).toEqual(await authAction('signup')(event()));
	});
	it.each(['missing_user', 'invalid_password', 'email_unconfirmed', 'rate_limited'])('uses the exact login message for %s', async (code) => {
		auth.signInWithPassword.mockResolvedValue({ error: { code, message: 'Private detail' } });
		expect(await authAction('login')(event())).toMatchObject({ status: 400, data: { message: LOGIN_ERROR } });
	});
	it('uses the same login error for a transport failure', async () => {
		auth.signInWithPassword.mockRejectedValue(new Error('private detail'));
		expect(await authAction('login')(event())).toMatchObject({ data: { message: LOGIN_ERROR } });
	});
	it('redirects a successful login to the app', async () => {
		auth.signInWithPassword.mockResolvedValue({ error: null });
		await expect(authAction('login')(event())).rejects.toMatchObject({ status: 303, location: '/' });
	});
	it('does not enumerate email addresses through recovery', async () => {
		for (const error of [null, { message: 'User does not exist' }, { message: 'Rate limit' }]) {
			auth.resetPasswordForEmail.mockResolvedValue({ error });
			expect(await authAction('forgot-password')(event())).toEqual({ success: true, message: RESET_MESSAGE });
		}
		auth.resetPasswordForEmail.mockRejectedValue(new Error('network'));
		expect(await authAction('forgot-password')(event())).toEqual({ success: true, message: RESET_MESSAGE });
	});
	it('requires a verified user before updating a password', async () => {
		auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Invalid JWT' } });
		expect(await authAction('reset-password')(event())).toMatchObject({ status: 401 });
		expect(auth.updateUser).not.toHaveBeenCalled();
	});
	it('updates passwords only through Supabase Auth', async () => {
		auth.getUser.mockResolvedValue({ data: { user: { id: 'test-id' } }, error: null });
		auth.updateUser.mockResolvedValue({ error: null });
		expect(await authAction('reset-password')(event())).toMatchObject({ success: true });
		expect(auth.updateUser).toHaveBeenCalledWith({ password: 'secret123' });
	});
	it('fails gracefully when Supabase is not configured', async () => {
		const request = event();
		request.locals.supabase = null;
		expect(await authAction('signup')(request)).toMatchObject({ status: 503 });
	});
});

describe('confirmation links', () => {
	it.each(['signup', 'recovery'])('verifies %s and allows only a fixed internal destination', async (type) => {
		const request = event();
		request.url = new URL(`https://finsight.test/auth/confirm?token_hash=test-hash&type=${type}&next=https://attacker.example`);
		auth.verifyOtp.mockResolvedValue({ error: null });
		await expect(confirm(request)).rejects.toMatchObject({ status: 303, location: type === 'signup' ? '/' : '/reset-password' });
		expect(auth.verifyOtp).toHaveBeenCalledWith({ token_hash: 'test-hash', type });
	});
	it.each(['magiclink', 'email_change', ''])('rejects unsupported token type %s without provider calls', async (type) => {
		const request = event();
		request.url = new URL(`https://finsight.test/auth/confirm?token_hash=test-hash&type=${type}`);
		await expect(confirm(request)).rejects.toMatchObject({ location: '/login?confirmation=failed' });
		expect(auth.verifyOtp).not.toHaveBeenCalled();
	});
	it('handles expired tokens without exposing errors', async () => {
		const request = event();
		request.url = new URL('https://finsight.test/auth/confirm?token_hash=test&type=recovery');
		auth.verifyOtp.mockResolvedValue({ error: { message: 'private detail' } });
		await expect(confirm(request)).rejects.toMatchObject({ location: '/login?confirmation=failed' });
	});
});
