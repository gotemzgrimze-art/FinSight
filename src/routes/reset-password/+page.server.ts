import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const load = ({ url }) => ({ token: url.searchParams.get('token') ?? '' });

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const token = String(formData.get('token') ?? '');
		const newPassword = String(formData.get('newPassword') ?? '');
		const confirmPassword = String(formData.get('confirmPassword') ?? '');
		if (!token) return fail(400, { error: 'Reset token is missing.' });
		if (newPassword.length < 12) return fail(400, { error: 'Password must be at least 12 characters.' });
		if (newPassword !== confirmPassword) return fail(400, { error: 'Passwords must match.' });
		await auth.api.resetPassword({ body: { token, newPassword } });
		throw redirect(303, '/login');
	}
};
