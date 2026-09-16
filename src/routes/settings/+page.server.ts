import { fail, redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/server/require-user';
import { getAdminClient } from '$lib/server/admin';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async (event) => { const user = await requireUser(event); const { data: profile } = await event.locals.supabase!.from('account_profiles').select('username,terms_version,terms_accepted_at,privacy_version,privacy_accepted_at').eq('id', user.id).maybeSingle(); return { user: { email: user.email, createdAt: user.created_at }, profile }; };
export const actions: Actions = {
	changeEmail: async (event) => {
		await requireUser(event);
		const email = String((await event.request.formData()).get('email') ?? '').trim().toLowerCase();
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(400, { message: 'Enter a valid email address.' });
		try { const { error } = await event.locals.supabase!.auth.updateUser({ email }); if (error) throw error; }
		catch { return fail(400, { message: 'We could not start that email change. Please try again.' }); }
		return { message: 'Check your email to confirm the address change.' };
	},
	delete: async (event) => {
		const user = await requireUser(event);
		if ((await event.request.formData()).get('confirm') !== 'DELETE') return fail(400, { message: 'Type DELETE to confirm account deletion.' });
		const admin = getAdminClient(); if (!admin) return fail(503, { message: 'Account deletion is not configured yet.' });
		const { error } = await admin.auth.admin.deleteUser(user.id);
		if (error) return fail(500, { message: 'We could not delete your account. Please contact support.' });
		await event.locals.supabase?.auth.signOut({ scope: 'local' }); redirect(303, '/login?deleted=1');
	}
};
