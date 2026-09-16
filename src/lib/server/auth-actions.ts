import { fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { authConfig } from './auth-config';
import { LOGIN_ERROR, RESET_MESSAGE, SIGNUP_MESSAGE, TERMS_VERSION, validateAuth, type AuthMode } from '$lib/auth/validation';

export function authAction(mode: AuthMode) {
	return async ({ request, locals, url }: RequestEvent) => {
		const { email, username, password, errors } = validateAuth(mode, await request.formData());
		const values = { email, username };
		if (Object.keys(errors).length) return fail(400, { errors, values });
		const config = authConfig();
		if (!locals.supabase || (mode === 'signup' && !config.signupEnabled)) {
			return fail(503, { message: 'Account services are not available yet. Please try again later.', values });
		}
		const auth = locals.supabase.auth;
		if (mode === 'signup') {
			try {
				await auth.signUp({ email, password, options: {
					data: { username, terms_accepted: true, terms_version: TERMS_VERSION, privacy_accepted: true, privacy_version: TERMS_VERSION },
					emailRedirectTo: `${url.origin}/auth/confirm`
				} });
			} catch { /* Same response for duplicates, provider errors and transport failures. */ }
			return { success: true, message: SIGNUP_MESSAGE };
		}
		if (mode === 'forgot-password') {
			try { await auth.resetPasswordForEmail(email, { redirectTo: `${url.origin}/auth/confirm` }); }
			catch { /* Do not reveal whether an email is registered. */ }
			return { success: true, message: RESET_MESSAGE };
		}
		if (mode === 'login') {
			try {
				const { error } = await auth.signInWithPassword({ email, password });
				if (error) return fail(400, { message: LOGIN_ERROR, values });
			} catch { return fail(400, { message: LOGIN_ERROR, values }); }
		} else {
			try {
				const { data, error } = await auth.getUser();
				if (error || !data.user) return fail(401, { message: 'Open a new password reset link to continue.' });
				const result = await auth.updateUser({ password });
				if (result.error) return fail(400, { message: 'Unable to update your password. Try a different password or request a new reset link.' });
			} catch { return fail(400, { message: 'Unable to update your password. Please try again.' }); }
			return { success: true, message: 'Your password has been updated. You can return to FinSight.' };
		}
		redirect(303, '/');
	};
}
