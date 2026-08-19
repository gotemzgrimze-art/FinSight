import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { analytics } from '$lib/server/analytics';

export const load = async ({ locals, url, request }) => {
	const token = url.searchParams.get('token');
	if (token) {
		try {
			await auth.api.verifyEmail({
				query: { token, callbackURL: '/onboarding' },
				headers: request.headers
			});
			await analytics.track(locals.user?.id ?? null, 'email_verified');
			throw redirect(303, '/onboarding');
		} catch {
			return { email: url.searchParams.get('email'), verified: false, error: 'Verification link is invalid or expired.' };
		}
	}
	return { email: url.searchParams.get('email'), verified: Boolean(locals.user?.emailVerified), error: '' };
};

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '');
		if (!email) return { error: 'Enter your email address.' };
		await auth.api.sendVerificationEmail({
			body: { email, callbackURL: '/onboarding' },
			headers: request.headers
		});
		return { message: 'Verification email requested. In development, check the server console.' };
	}
};
