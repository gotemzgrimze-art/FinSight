import { fail } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '');
		if (!email) return fail(400, { error: 'Enter your email address.' });
		await auth.api.requestPasswordReset({
			body: { email, redirectTo: '/reset-password' },
			headers: request.headers
		});
		return { message: 'If an account exists, a reset link has been sent. In development, check the server console.' };
	}
};
