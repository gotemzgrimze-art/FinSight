import { addMoney, subtractMoney, type Money, type SupportedCurrency, zeroMoney } from '$lib/money';
import type { DebtRecord, Expense, FinancialModel, Frequency, IncomeSource } from '$lib/financial-domain';

export type CashFlowProjection = {
	days: 30 | 60 | 90;
	currentBalance: Money;
	afterPurchaseBalance: Money;
};

const periodsPerMonth: Record<Frequency, number> = {
	weekly: 52 / 12,
	biweekly: 26 / 12,
	semimonthly: 2,
	monthly: 1,
	annual: 1 / 12,
	one_time: 0
};

export const normalizeMerchant = (value: string): string =>
	value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '')
		.replace(/\s+/g, ' ')
		.replace(/\b(inc|llc|ltd|store|market)\b/g, '')
		.trim();

export const monthlyAmount = (amount: Money, frequency: Frequency): Money => ({
	...amount,
	amountMinor: Math.round(amount.amountMinor * periodsPerMonth[frequency])
});

export const totalLiquidCash = (model: Pick<FinancialModel, 'profile' | 'accounts'>): Money =>
	model.accounts
		.filter((account) => account.accountType === 'checking' || account.accountType === 'savings')
		.reduce(
			(total, account) => addMoney(total, account.availableBalance ?? account.balance),
			zeroMoney(model.profile.preferredCurrency)
		);

export const monthlyNetIncome = (
	incomeSources: IncomeSource[],
	currency: SupportedCurrency
): Money =>
	incomeSources.reduce((total, income) => addMoney(total, monthlyAmount(income.amount, income.frequency)), zeroMoney(currency));

export const monthlyCommittedExpenses = (expenses: Expense[], currency: SupportedCurrency): Money =>
	expenses.reduce((total, expense) => addMoney(total, monthlyAmount(expense.amount, expense.frequency)), zeroMoney(currency));

export const monthlyDebtPayments = (debts: DebtRecord[], currency: SupportedCurrency): Money =>
	debts.reduce((total, debt) => addMoney(total, debt.minimumPayment), zeroMoney(currency));

export const monthlyDiscretionaryIncome = (model: FinancialModel): Money =>
	subtractMoney(
		subtractMoney(monthlyNetIncome(model.incomeSources, model.profile.preferredCurrency), monthlyCommittedExpenses(model.expenses, model.profile.preferredCurrency)),
		monthlyDebtPayments(model.debts, model.profile.preferredCurrency)
	);

export const emergencyRunwayMonths = (cash: Money, monthlyObligations: Money): number =>
	monthlyObligations.amountMinor > 0 ? cash.amountMinor / monthlyObligations.amountMinor : 0;

export const upcomingObligations = (
	model: Pick<FinancialModel, 'profile' | 'expenses' | 'debts'>,
	days: number,
	now = new Date()
): Money => {
	const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	const end = start + days * 24 * 60 * 60 * 1000;
	const currency = model.profile.preferredCurrency;
	const expensesDue = model.expenses.filter((expense) => isDateWithin(expense.nextDueDate, start, end));
	const debtsDue = model.debts.filter((debt) => isDateWithin(debt.paymentDueDate, start, end));
	return addMoney(
		expensesDue.reduce((total, expense) => addMoney(total, expense.amount), zeroMoney(currency)),
		debtsDue.reduce((total, debt) => addMoney(total, debt.minimumPayment), zeroMoney(currency))
	);
};

export const forecastCashFlow = (model: FinancialModel, purchase?: Money): CashFlowProjection[] => {
	const cash = totalLiquidCash(model);
	const monthlyIncome = monthlyNetIncome(model.incomeSources, model.profile.preferredCurrency);
	const monthlyCommitted = addMoney(
		monthlyCommittedExpenses(model.expenses, model.profile.preferredCurrency),
		monthlyDebtPayments(model.debts, model.profile.preferredCurrency)
	);

	return ([30, 60, 90] as const).map((days) => {
		const months = days / 30;
		const net = monthlyIncome.amountMinor * months - monthlyCommitted.amountMinor * months;
		const currentBalance = { ...cash, amountMinor: Math.round(cash.amountMinor + net) };
		const afterPurchaseBalance = purchase ? subtractMoney(currentBalance, purchase) : currentBalance;
		return { days, currentBalance, afterPurchaseBalance };
	});
};

const isDateWithin = (dateValue: string | null | undefined, startInclusive: number, endExclusive: number): boolean => {
	if (!dateValue) return false;
	const date = new Date(`${dateValue}T00:00:00.000Z`).getTime();
	return Number.isFinite(date) && date >= startInclusive && date < endExclusive;
};
