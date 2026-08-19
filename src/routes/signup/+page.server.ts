import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { analytics } from '$lib/server/analytics';
import { readCheckbox } from '$lib/server/form';
import { signupValidationSchema } from '$lib/server/validation/auth';

export const load = ({ locals }) => {
	if (locals.user) throw redirect(303, '/dashboard');
	return {};
};

export const actions = {
	default: async ({ request }) => {
		await analytics.track(null, 'signup_started');
		const formData = await request.formData();
		const values = {
			firstName: String(formData.get('firstName') ?? ''),
			lastName: String(formData.get('lastName') ?? ''),
			email: String(formData.get('email') ?? ''),
			password: String(formData.get('password') ?? ''),
			confirmPassword: String(formData.get('confirmPassword') ?? ''),
			acceptTerms: readCheckbox(formData, 'acceptTerms'),
			acceptPrivacy: readCheckbox(formData, 'acceptPrivacy')
		};
		const parsed = signupValidationSchema.safeParse(values);
		if (!parsed.success) {
			return fail(400, { error: parsed.error.issues[0]?.message ?? 'Could not create account', values });
		}

		try {
			await auth.api.signUpEmail({
				body: {
					name: `${parsed.data.firstName} ${parsed.data.lastName}`,
					email: parsed.data.email,
					password: parsed.data.password,
					callbackURL: '/onboarding'
				}
			});
			await analytics.track(null, 'signup_completed');
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : 'Could not create account',
				values
			});
		}

		throw redirect(303, `/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
	}
};
