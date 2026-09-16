import { authConfig } from '$lib/server/auth-config';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	let account: { email: string | undefined } | null = null;
	if (locals.supabase) {
		try {
			const { data, error } = await locals.supabase.auth.getUser();
			if (!error && data.user) account = { email: data.user.email };
		} catch { /* Keep public pages available during an auth outage. */ }
	}
	return { account, auth: authConfig() };
};
