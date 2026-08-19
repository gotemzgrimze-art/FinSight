import { bankProvider } from '$lib/server/bank/providers';
import { requireAuthenticatedUser } from '$lib/server/form';

export const load = async (event) => {
	requireAuthenticatedUser(event);
	return {};
};

export const actions = {
	connect: async (event) => {
		const user = requireAuthenticatedUser(event);
		const session = await bankProvider.createLinkSession(user.id);
		return { session, message: 'Mock link session created. No real bank was connected.' };
	}
};
