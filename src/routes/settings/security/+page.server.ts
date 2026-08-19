import { fail } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { requireAuthenticatedUser } from '$lib/server/form';

export const load = async (event) => {
	const user = requireAuthenticatedUser(event);
	let sessions: Array<{ id: string; expiresAt: Date; userAgent?: string | null; ipAddress?: string | null }> = [];
	try {
		sessions = await auth.api.listSessions({ headers: event.request.headers });
	} catch {
		sessions = [];
	}
	return { account: { email: user.email, emailVerified: user.emailVerified }, sessions };
};

export const actions = {
	changePassword: async (event) => {
		requireAuthenticatedUser(event);
		const formData = await event.request.formData();
		const currentPassword = String(formData.get('currentPassword') ?? '');
		const newPassword = String(formData.get('newPassword') ?? '');
		if (newPassword.length < 12) return fail(400, { error: 'New password must be at least 12 characters.' });
		await auth.api.changePassword({
			body: { currentPassword, newPassword, revokeOtherSessions: true },
			headers: event.request.headers
		});
		return { message: 'Password changed and other sessions revoked.' };
	},
	logoutAll: async (event) => {
		requireAuthenticatedUser(event);
		await auth.api.revokeSessions({ headers: event.request.headers });
		return { message: 'Other sessions revoked.' };
	}
};
