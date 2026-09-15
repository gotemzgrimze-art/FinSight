import { authAction } from '$lib/server/auth-actions';
import type { Actions } from './$types';

export const actions: Actions = { default: authAction('reset-password') };

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	let authenticated = false;
	try {
		const result = await locals.supabase?.auth.getUser();
		authenticated = Boolean(result && !result.error && result.data.user);
	} catch { /* Request a fresh recovery link. */ }
	if (!authenticated) redirect(303, '/forgot-password');
};
