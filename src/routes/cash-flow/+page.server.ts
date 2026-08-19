import { demoFinancialModel } from '$lib/demoMode';
import { forecastCashFlow } from '$lib/finance/cashFlow';
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
		projections: forecastCashFlow(source).map((projection) => ({
			days: projection.days,
			current: formatMoney(projection.currentBalance, { maximumFractionDigits: 0 }),
			afterPurchase: formatMoney(projection.afterPurchaseBalance, { maximumFractionDigits: 0 })
		}))
	};
};
