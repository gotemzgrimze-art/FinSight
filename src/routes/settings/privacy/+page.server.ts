import { fail } from '@sveltejs/kit';
import { hasDatabase } from '$lib/server/db';
import { requireAuthenticatedUser } from '$lib/server/form';
import { deleteFinancialDataForUser, getFinancialModelForUser } from '$lib/server/repositories/financialRepository';

export const load = async (event) => {
	const user = requireAuthenticatedUser(event);
	const model = hasDatabase ? await getFinancialModelForUser(user.id) : null;
	return {
		hasDatabase,
		storedData: ['Profile', 'Financial accounts', 'Income sources', 'Expenses', 'Debts', 'Goals', 'Transactions', 'Purchase checks', 'Audit events'],
		exportJson: model ? JSON.stringify(model, null, 2) : ''
	};
};

export const actions = {
	deleteFinancialData: async (event) => {
		const user = requireAuthenticatedUser(event);
		if (!hasDatabase) return fail(503, { error: 'DATABASE_URL is not configured.' });
		await deleteFinancialDataForUser(user.id);
		return { message: 'Financial data deleted. Account authentication remains active.' };
	}
};
