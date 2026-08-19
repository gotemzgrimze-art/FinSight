import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { loginValidationSchema } from '$lib/server/validation/auth';

export const load = ({ locals, url }) => {
	if (locals.user) throw redirect(303, '/dashboard');
	return { redirectTo: url.searchParams.get('redirectTo') ?? '/dashboard' };
};

export const actions = {
	default: async ({ request, url }) => {
		const formData = await request.formData();
		const redirectTo = String(formData.get('redirectTo') ?? url.searchParams.get('redirectTo') ?? '/dashboard');
		const parsed = loginValidationSchema.safeParse({
			email: String(formData.get('email') ?? ''),
			password: String(formData.get('password') ?? ''),
			rememberMe: formData.get('rememberMe') !== null
		});
		if (!parsed.success) return fail(400, { error: parsed.error.issues[0]?.message ?? 'Could not log in' });

		try {
			await auth.api.signInEmail({
				body: {
					email: parsed.data.email,
					password: parsed.data.password,
					rememberMe: parsed.data.rememberMe,
					callbackURL: redirectTo
				}
			});
		} catch (error) {
			return fail(400, { error: error instanceof Error ? error.message : 'Invalid email or password' });
		}

		throw redirect(303, redirectTo);
	}
};
