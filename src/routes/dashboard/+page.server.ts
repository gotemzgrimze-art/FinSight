import { demoFinancialModel } from '$lib/demoMode';
import { forecastCashFlow, monthlyCommittedExpenses, monthlyDebtPayments, monthlyDiscretionaryIncome, totalLiquidCash, upcomingObligations, emergencyRunwayMonths } from '$lib/finance/cashFlow';
import { calculateGoalProgressPercent } from '$lib/finance/purchaseEngine';
import { formatMoney } from '$lib/money';
import { hasDatabase } from '$lib/server/db';
import { requireAuthenticatedUser } from '$lib/server/form';
import { getFinancialModelForUser } from '$lib/server/repositories/financialRepository';

export const load = async (event) => {
	const user = requireAuthenticatedUser(event);
	const model = hasDatabase ? await getFinancialModelForUser(user.id) : null;
	const source = model ?? { ...demoFinancialModel, profile: { ...demoFinancialModel.profile, userId: user.id } };
	const currency = source.profile.preferredCurrency;
	const cash = totalLiquidCash(source);
	const expenses = monthlyCommittedExpenses(source.expenses, currency);
	const debtPayments = monthlyDebtPayments(source.debts, currency);
	const discretionary = monthlyDiscretionaryIncome(source);
	const obligations = { ...cash, amountMinor: expenses.amountMinor + debtPayments.amountMinor };
	const projections = forecastCashFlow(source);

	return {
		isDemoData: !model,
		overview: {
			availableCash: formatMoney(cash, { maximumFractionDigits: 0 }),
			monthlyNetIncome: formatMoney(source.incomeSources.reduce((total, income) => ({ ...total, amountMinor: total.amountMinor + income.amount.amountMinor }), { amountMinor: 0, currency }), { maximumFractionDigits: 0 }),
			monthlyCommittedExpenses: formatMoney(expenses, { maximumFractionDigits: 0 }),
			monthlyDebtPayments: formatMoney(debtPayments, { maximumFractionDigits: 0 }),
			estimatedDiscretionaryCash: formatMoney(discretionary, { maximumFractionDigits: 0 }),
			emergencyRunway: emergencyRunwayMonths(cash, obligations).toFixed(1),
			totalDebt: formatMoney(source.debts.reduce((total, debt) => ({ ...total, amountMinor: total.amountMinor + debt.balance.amountMinor }), { amountMinor: 0, currency }), { maximumFractionDigits: 0 }),
			goalProgress: `${calculateGoalProgressPercent(source.goals).toFixed(0)}%`,
			upcoming7Days: formatMoney(upcomingObligations(source, 7), { maximumFractionDigits: 0 }),
			upcoming30Days: formatMoney(upcomingObligations(source, 30), { maximumFractionDigits: 0 })
		},
		projections: projections.map((projection) => ({
			days: projection.days,
			current: formatMoney(projection.currentBalance, { maximumFractionDigits: 0 })
		}))
	};
};
