import { redirect } from '@sveltejs/kit';
import { authConfig } from '$lib/server/auth-config';
export const load = () => {
	const { termsUrl } = authConfig();
	if (termsUrl !== '/terms') redirect(302, termsUrl);
};
