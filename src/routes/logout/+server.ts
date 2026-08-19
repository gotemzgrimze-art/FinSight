import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const POST = async ({ request }) => {
	await auth.api.signOut({
		body: { callbackURL: '/', disableRedirect: true },
		headers: request.headers
	});
	throw redirect(303, '/');
};
