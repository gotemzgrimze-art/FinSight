import {
	emergencyRunwayMonths,
	forecastCashFlow,
	monthlyCommittedExpenses,
	monthlyDebtPayments,
	monthlyDiscretionaryIncome,
	totalLiquidCash,
	upcomingObligations
} from '$lib/finance/cashFlow';
import { addMoney, formatMoney, multiplyMoney, subtractMoney, type Money } from '$lib/money';
import type { FinancialGoal, FinancialModel, ImpactLevel, ReasonCode } from '$lib/financial-domain';

export const decisionEngineVersion = '2026.08.19-v2';

export type PurchaseImpactInput = {
	name: string;
	amount: Money;
	category: string;
	now?: Date;
};

export type PurchaseImpactResult = {
	engineVersion: string;
	impactLevel: ImpactLevel;
	confidence: 'low' | 'medium' | 'high';
	reasonCodes: ReasonCode[];
	summary: string;
	mainFactors: string[];
	alternatives: Array<{
		label: string;
		impact: ImpactLevel;
		description: string;
	}>;
	metrics: {
		liquidCash: Money;
		cashRemainingAfterPurchase: Money;
		monthlyDiscretionaryIncome: Money;
		monthlyCommittedExpenses: Money;
		monthlyDebtPayments: Money;
		totalDebt: Money;
		purchasePercentOfLiquidCash: number;
		purchasePercentOfDiscretionaryIncome: number;
		emergencyRunwayBeforeMonths: number;
		emergencyRunwayAfterMonths: number;
		upcoming7Days: Money;
		upcoming30Days: Money;
		goalProgressPercent: number;
		estimatedRecoveryDays: number | null;
	};
	projections: ReturnType<typeof forecastCashFlow>;
	auditPayload: {
		engineVersion: string;
		inputs: PurchaseImpactInput;
		result: Pick<PurchaseImpactResult, 'impactLevel' | 'confidence' | 'reasonCodes' | 'summary'>;
		timestamp: string;
	};
};

export const calculateGoalProgressPercent = (goals: FinancialGoal[]): number => {
	if (goals.length === 0) return 0;
	const weighted = goals.map((goal) => {
		if (goal.targetAmount.amountMinor <= 0) return 0;
		return Math.min(goal.currentAmount.amountMinor / goal.targetAmount.amountMinor, 1) * 100;
	});
	return weighted.reduce((total, value) => total + value, 0) / goals.length;
};

export const calculateDebtInterestAvoided = (amount: Money, annualPercentageRateBasisPoints: number, months = 12): Money => {
	const annualRate = annualPercentageRateBasisPoints / 10_000;
	return multiplyMoney(amount, annualRate * (months / 12));
};

export const evaluatePurchaseImpact = (
	model: FinancialModel,
	input: PurchaseImpactInput
): PurchaseImpactResult => {
	const cash = totalLiquidCash(model);
	const discretionary = monthlyDiscretionaryIncome(model);
	const committed = monthlyCommittedExpenses(model.expenses, model.profile.preferredCurrency);
	const debtPayments = monthlyDebtPayments(model.debts, model.profile.preferredCurrency);
	const monthlyObligations = addMoney(committed, debtPayments);
	const totalDebt = model.debts.reduce((total, debt) => addMoney(total, debt.balance), { ...input.amount, amountMinor: 0 });
	const cashAfter = subtractMoney(cash, input.amount);
	const runwayBefore = emergencyRunwayMonths(cash, monthlyObligations);
	const runwayAfter = emergencyRunwayMonths(cashAfter, monthlyObligations);
	const upcoming7Days = upcomingObligations(model, 7, input.now);
	const upcoming30Days = upcomingObligations(model, 30, input.now);
	const purchasePercentOfLiquidCash = cash.amountMinor > 0 ? input.amount.amountMinor / cash.amountMinor : 1;
	const purchasePercentOfDiscretionaryIncome =
		discretionary.amountMinor > 0 ? input.amount.amountMinor / discretionary.amountMinor : 1;
	const estimatedRecoveryDays =
		discretionary.amountMinor > 0 ? Math.ceil((input.amount.amountMinor / discretionary.amountMinor) * 30) : null;
	const goalProgressPercent = calculateGoalProgressPercent(model.goals);
	const highestAprDebt = [...model.debts].sort((a, b) => b.aprBasisPoints - a.aprBasisPoints)[0];
	const reasonCodes: ReasonCode[] = [];

	if (cashAfter.amountMinor < 0) reasonCodes.push('NEGATIVE_CASH_AFTER_PURCHASE');
	if (purchasePercentOfLiquidCash >= 0.3) reasonCodes.push('HIGH_PERCENT_LIQUID_CASH');
	if (purchasePercentOfDiscretionaryIncome >= 0.75) reasonCodes.push('HIGH_PERCENT_DISCRETIONARY');
	if (upcoming30Days.amountMinor > discretionary.amountMinor && discretionary.amountMinor > 0) reasonCodes.push('UPCOMING_BILLS_HIGH');
	if (highestAprDebt && highestAprDebt.aprBasisPoints >= 1500) reasonCodes.push('HIGH_INTEREST_DEBT');
	if (model.goals.length > 0 && estimatedRecoveryDays && estimatedRecoveryDays >= 21) reasonCodes.push('GOAL_DELAY');
	if (model.incomeSources.some((income) => income.stability !== 'stable')) reasonCodes.push('INCOME_VOLATILITY');
	if (runwayAfter < model.profile.emergencyFundMonths) reasonCodes.push('EMERGENCY_TARGET_BREACHED');
	if (runwayAfter < 1) reasonCodes.push('EMERGENCY_RUNWAY_LOW');

	const score = reasonCodes.reduce((total, reason) => total + reasonWeight[reason], 0);
	const impactLevel: ImpactLevel =
		score >= 14 ? 'VERY_HIGH_IMPACT' : score >= 11 ? 'HIGH_IMPACT' : score >= 3 ? 'MODERATE_IMPACT' : 'LOW_IMPACT';
	const confidence = model.accounts.length > 0 && model.incomeSources.length > 0 && model.expenses.length > 0 ? 'high' : 'medium';

	const mainFactors = [
		`Purchase uses ${(purchasePercentOfLiquidCash * 100).toFixed(1)}% of liquid cash.`,
		`Emergency runway changes from ${runwayBefore.toFixed(1)} months to ${runwayAfter.toFixed(1)} months.`,
		`${formatMoney(upcoming30Days, { maximumFractionDigits: 0 })} in recurring obligations are due within 30 days.`
	];

	if (highestAprDebt && highestAprDebt.aprBasisPoints >= 1500) {
		mainFactors.push(`${highestAprDebt.name} carries ${(highestAprDebt.aprBasisPoints / 100).toFixed(2)}% APR.`);
	}

	const interestAvoided = highestAprDebt ? calculateDebtInterestAvoided(input.amount, highestAprDebt.aprBasisPoints) : null;
	const waitThirtyDaysCash = addMoney(cashAfter, discretionary.amountMinor > 0 ? discretionary : { ...discretionary, amountMinor: 0 });
	const cheaperAmount = multiplyMoney(input.amount, 0.6);

	const result = {
		engineVersion: decisionEngineVersion,
		impactLevel,
		confidence,
		reasonCodes,
		summary: `${impactLevel.replaceAll('_', ' ')} based on available financial information.`,
		mainFactors,
		alternatives: [
			{
				label: 'Wait 30 days',
				impact: waitThirtyDaysCash.amountMinor >= cash.amountMinor * 0.8 ? 'LOW_IMPACT' : 'MODERATE_IMPACT',
				description: `Estimated cash after waiting: ${formatMoney(waitThirtyDaysCash, { maximumFractionDigits: 0 })}.`
			},
			{
				label: `Spend ${formatMoney(cheaperAmount, { maximumFractionDigits: 0 })} instead`,
				impact: cheaperAmount.amountMinor / Math.max(cash.amountMinor, 1) >= 0.3 ? 'MODERATE_IMPACT' : 'LOW_IMPACT',
				description: `Lower purchase amount leaves ${formatMoney(subtractMoney(cash, cheaperAmount), { maximumFractionDigits: 0 })} liquid cash.`
			},
			{
				label: 'Pay debt instead',
				impact: 'LOW_IMPACT',
				description: interestAvoided
					? `Potential 12-month interest avoided: ${formatMoney(interestAvoided, { maximumFractionDigits: 0 })}.`
					: 'No active debt with APR data is available.'
			}
		],
		metrics: {
			liquidCash: cash,
			cashRemainingAfterPurchase: cashAfter,
			monthlyDiscretionaryIncome: discretionary,
			monthlyCommittedExpenses: committed,
			monthlyDebtPayments: debtPayments,
			totalDebt,
			purchasePercentOfLiquidCash,
			purchasePercentOfDiscretionaryIncome,
			emergencyRunwayBeforeMonths: runwayBefore,
			emergencyRunwayAfterMonths: runwayAfter,
			upcoming7Days,
			upcoming30Days,
			goalProgressPercent,
			estimatedRecoveryDays
		},
		projections: forecastCashFlow(model, input.amount),
		auditPayload: {
			engineVersion: decisionEngineVersion,
			inputs: input,
			result: {
				impactLevel,
				confidence,
				reasonCodes,
				summary: `${impactLevel.replaceAll('_', ' ')} based on available financial information.`
			},
			timestamp: (input.now ?? new Date()).toISOString()
		}
	} satisfies PurchaseImpactResult;

	return result;
};

const reasonWeight: Record<ReasonCode, number> = {
	EMERGENCY_RUNWAY_LOW: 4,
	HIGH_PERCENT_LIQUID_CASH: 3,
	HIGH_PERCENT_DISCRETIONARY: 3,
	UPCOMING_BILLS_HIGH: 2,
	HIGH_INTEREST_DEBT: 1,
	GOAL_DELAY: 1,
	INCOME_VOLATILITY: 1,
	NEGATIVE_CASH_AFTER_PURCHASE: 5,
	EMERGENCY_TARGET_BREACHED: 3
};
