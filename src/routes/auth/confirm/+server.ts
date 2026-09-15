import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type');
	let verified = false;
	if (locals.supabase && token_hash && (type === 'signup' || type === 'recovery')) {
		try {
			const { error } = await locals.supabase.auth.verifyOtp({ token_hash, type });
			verified = !error;
		} catch { /* Only a generic link failure is shown. */ }
	}
	redirect(303, verified ? (type === 'recovery' ? '/reset-password' : '/') : '/login?confirmation=failed');
};
