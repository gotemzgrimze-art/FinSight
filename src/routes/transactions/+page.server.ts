import { demoFinancialModel } from '$lib/demoMode';
import { formatMoney } from '$lib/money';
import { hasDatabase } from '$lib/server/db';
import { requireAuthenticatedUser } from '$lib/server/form';
import { getFinancialModelForUser } from '$lib/server/repositories/financialRepository';

export const load = async (event) => {
	const user = requireAuthenticatedUser(event);
	const model = hasDatabase ? await getFinancialModelForUser(user.id) : null;
	const source = model ?? { ...demoFinancialModel, profile: { ...demoFinancialModel.profile, userId: user.id } };
	return {
		isDemoData: !model,
		transactions: (source.transactions ?? []).map((transaction) => ({
			id: transaction.id,
			date: transaction.transactionDate,
			merchant: transaction.merchant ?? transaction.description,
			description: transaction.description,
			category: transaction.category,
			amount: formatMoney(transaction.amount)
		}))
	};
};
