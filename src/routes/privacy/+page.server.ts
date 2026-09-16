import { redirect } from '@sveltejs/kit';
import { authConfig } from '$lib/server/auth-config';
export const load = () => {
	const { privacyUrl } = authConfig();
	if (privacyUrl !== '/privacy') redirect(302, privacyUrl);
};
