import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	try { await locals.supabase?.auth.signOut({ scope: 'local' }); }
	catch { /* Clear the local session even when the provider is unreachable. */ }
	for (const cookie of cookies.getAll()) {
		if (cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')) cookies.delete(cookie.name, { path: '/' });
	}
	redirect(303, '/login');
};
