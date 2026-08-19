import { fail } from '@sveltejs/kit';
import { demoFinancialModel } from '$lib/demoMode';
import { evaluatePurchaseImpact } from '$lib/finance/purchaseEngine';
import { formatMoney, parseMoneyToMinor } from '$lib/money';
import { analytics } from '$lib/server/analytics';
import { hasDatabase } from '$lib/server/db';
import { requireAuthenticatedUser } from '$lib/server/form';
import { getFinancialModelForUser, savePurchaseCheckForUser } from '$lib/server/repositories/financialRepository';

export const load = async (event) => {
	requireAuthenticatedUser(event);
	return {};
};

export const actions = {
	default: async (event) => {
		const user = requireAuthenticatedUser(event);
		const formData = await event.request.formData();
		const amount = String(formData.get('amount') ?? '');
		const category = String(formData.get('category') ?? 'Other');
		const name = String(formData.get('name') ?? 'Purchase');
		try {
			const model = hasDatabase ? await getFinancialModelForUser(user.id) : null;
			const source = model ?? { ...demoFinancialModel, profile: { ...demoFinancialModel.profile, userId: user.id } };
			const purchaseAmount = parseMoneyToMinor(amount, source.profile.preferredCurrency, 'purchase amount');
			const result = evaluatePurchaseImpact(source, { name, amount: purchaseAmount, category });
			if (model && hasDatabase) {
				await savePurchaseCheckForUser(user.id, {
					requestedAmount: purchaseAmount,
					category,
					engineVersion: result.engineVersion,
					impactLevel: result.impactLevel,
					confidence: result.confidence,
					explanationJson: result.auditPayload
				});
			}
			await analytics.track(user.id, 'purchase_check_created', {
				category,
				engineVersion: result.engineVersion,
				impactLevel: result.impactLevel
			});
			return {
				isDemoData: !model,
				result: {
					...result,
					display: {
						liquidCash: formatMoney(result.metrics.liquidCash, { maximumFractionDigits: 0 }),
						cashAfter: formatMoney(result.metrics.cashRemainingAfterPurchase, { maximumFractionDigits: 0 }),
						discretionary: formatMoney(result.metrics.monthlyDiscretionaryIncome, { maximumFractionDigits: 0 }),
						upcoming30: formatMoney(result.metrics.upcoming30Days, { maximumFractionDigits: 0 })
					}
				}
			};
		} catch (error) {
			return fail(400, { error: error instanceof Error ? error.message : 'Could not evaluate purchase' });
		}
	}
};
