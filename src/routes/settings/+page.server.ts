import { requireAuthenticatedUser } from '$lib/server/form';

export const load = (event) => {
	const user = requireAuthenticatedUser(event);
	return { account: { email: user.email, emailVerified: user.emailVerified, name: user.name } };
};
