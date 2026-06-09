import type {
	Debt,
	FinancialProfile,
	Goal,
	ProductOption,
	PurchaseAssessment,
	PurchaseInput,
	StatusTone
} from '$lib/models';

const moneyPattern = /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/;

export const parseMoney = (value: string, fieldName = 'money'): number => {
	const normalized = value.trim();

	if (!normalized) {
		throw new Error(`${fieldName} is required`);
	}

	if (normalized.startsWith('-')) {
		throw new Error(`${fieldName} cannot be negative`);
	}

	if (!moneyPattern.test(normalized)) {
		throw new Error(`${fieldName} must be a valid money amount`);
	}

	const parsed = Number(normalized.replaceAll(',', ''));

	if (!Number.isFinite(parsed)) {
		throw new Error(`${fieldName} must be a valid money amount`);
	}

	return parsed;
};

export const optionalMoney = (value: string, fieldName: string): number => {
	if (!value.trim()) return 0;
	return parseMoney(value, fieldName);
};

export const parsePercentage = (value: string, fieldName = 'percentage'): number => {
	const normalized = value.trim();

	if (!normalized) return 0;
	if (normalized.startsWith('-')) throw new Error(`${fieldName} cannot be negative`);

	const parsed = Number(normalized.replace('%', ''));

	if (!Number.isFinite(parsed)) throw new Error(`${fieldName} must be a valid percentage`);

	return parsed;
};

export const formatMoney = (value: number): string =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	}).format(Number.isFinite(value) ? value : 0);

export const calculateMonthlyIncome = (annualSalary: string): number => {
	const salary = optionalMoney(annualSalary, 'annual income');
	return salary / 12;
};

export const calculateMonthlyDebtPayment = (debts: Debt[]): number =>
	debts.reduce((total, debt) => total + optionalMoney(debt.minimumPayment, `${debt.name} payment`), 0);

export const calculateMonthlyLeftover = (
	annualSalary: string,
	monthlyExpenses: string,
	debts: Debt[] = []
): number =>
	calculateMonthlyIncome(annualSalary) -
	optionalMoney(monthlyExpenses, 'monthly expenses') -
	calculateMonthlyDebtPayment(debts);

export const calculateDebtRatio = (annualSalary: string, debts: Debt[]): number => {
	const income = calculateMonthlyIncome(annualSalary);
	return income > 0 ? (calculateMonthlyDebtPayment(debts) / income) * 100 : 0;
};

export const calculateRunwayMonths = (bankBalance: string, monthlyExpenses: string, debts: Debt[] = []): number => {
	const monthlyBurn = optionalMoney(monthlyExpenses, 'monthly expenses') + calculateMonthlyDebtPayment(debts);
	return monthlyBurn > 0 ? optionalMoney(bankBalance, 'bank balance') / monthlyBurn : 0;
};

export const calculateGoalProgress = (goal: Goal): number => {
	const target = optionalMoney(goal.targetAmount, `${goal.name} target`);
	if (target <= 0) throw new Error('savings goal must be greater than 0');
	const current = optionalMoney(goal.currentAmount, `${goal.name} current amount`);
	return Math.min((current / target) * 100, 100);
};

export const calculateAfterPurchaseBalance = (bankBalance: string, purchaseCost: string): number =>
	optionalMoney(bankBalance, 'bank balance') - parseMoney(purchaseCost, 'purchase price');

export const calculateHourlyIncome = (annualSalary: string, workHoursPerMonth: string): number => {
	const hours = optionalMoney(workHoursPerMonth, 'work hours per month');
	if (hours <= 0) throw new Error('work hours per month must be greater than 0');
	return calculateMonthlyIncome(annualSalary) / hours;
};

export const calculatePurchaseWorkHours = (
	purchaseCost: string,
	annualSalary: string,
	workHoursPerMonth: string
): number => {
	const price = parseMoney(purchaseCost, 'purchase price');
	if (price <= 0) throw new Error('purchase price must be greater than 0');

	const hourlyIncome = calculateHourlyIncome(annualSalary, workHoursPerMonth);
	return hourlyIncome > 0 ? price / hourlyIncome : 0;
};

export const calculateFutureValue = (
	principal: number,
	annualReturnRate: number,
	years: number
): number => {
	if (principal < 0) throw new Error('principal cannot be negative');
	if (annualReturnRate < 0) throw new Error('annual return rate cannot be negative');
	if (years < 0) throw new Error('years cannot be negative');
	return principal * (1 + annualReturnRate) ** years;
};

export const calculateSafeDailySpend = (
	annualSalary: string,
	monthlyExpenses: string,
	debts: Debt[],
	goals: Goal[],
	daysRemaining = 30
): number => {
	if (daysRemaining <= 0) throw new Error('days remaining must be greater than 0');

	const goalContributions = goals.reduce((total, goal) => {
		const contribution = optionalMoney(goal.monthlyContribution, `${goal.name} monthly contribution`);
		if (contribution < 0) throw new Error('monthly contribution cannot be negative');
		return total + contribution;
	}, 0);

	const leftover = calculateMonthlyLeftover(annualSalary, monthlyExpenses, debts) - goalContributions;
	return Math.max(leftover / daysRemaining, 0);
};

export const calculateDebtPayoffMonths = (debt: Debt): number => {
	const balance = optionalMoney(debt.balance, `${debt.name} balance`);
	const payment = optionalMoney(debt.minimumPayment, `${debt.name} payment`);
	const monthlyRate = parsePercentage(debt.annualInterestRate, `${debt.name} interest rate`) / 100 / 12;

	if (balance <= 0) return 0;
	if (payment <= 0) return Number.POSITIVE_INFINITY;
	if (monthlyRate === 0) return Math.ceil(balance / payment);
	if (payment <= balance * monthlyRate) return Number.POSITIVE_INFINITY;

	return Math.ceil(Math.log(payment / (payment - balance * monthlyRate)) / Math.log(1 + monthlyRate));
};

const categoryLabel = (necessity: number): string =>
	necessity >= 8 ? 'Necessary' : necessity >= 5 ? 'Useful' : 'Optional';

export const calculateAffordabilityVerdict = (
	profile: FinancialProfile,
	purchase: PurchaseInput,
	product: ProductOption,
	years = 15
): PurchaseAssessment => {
	const itemName = purchase.name.trim() || 'this purchase';
	const cost = parseMoney(purchase.cost, 'purchase price');
	if (cost <= 0) throw new Error('purchase price must be greater than 0');

	const balance = optionalMoney(profile.bankBalance, 'bank balance');
	const balanceAfter = calculateAfterPurchaseBalance(profile.bankBalance, purchase.cost);
	const monthlyLeftover = calculateMonthlyLeftover(profile.annualSalary, profile.monthlyExpenses, profile.debts);
	const costShare = monthlyLeftover > 0 ? cost / monthlyLeftover : 2;
	const cashShare = balance > 0 ? cost / balance : 1;
	const highNecessity = product.necessity >= 8;
	const mediumNecessity = product.necessity >= 5;
	const shouldAvoid = balanceAfter < 0 || costShare > 1.1 || (cashShare > 0.45 && !highNecessity);
	const shouldWait =
		!shouldAvoid && (costShare > 0.45 || cashShare > 0.25 || (!mediumNecessity && costShare > 0.2));
	const tone: StatusTone = shouldAvoid ? 'danger' : shouldWait ? 'caution' : 'safe';
	const verdict = shouldAvoid ? 'Do not buy yet' : shouldWait ? 'Wait or find cheaper' : 'Buy is reasonable';
	const workHours = calculatePurchaseWorkHours(purchase.cost, profile.annualSalary, profile.workHoursPerMonth);
	const annualReturnRate = parsePercentage(profile.investmentReturnRate, 'investment return rate') / 100;
	const futureValue = calculateFutureValue(cost, annualReturnRate, years);
	const cheaperCost = cost * 0.72;
	const waitSavings = Math.max(calculateSafeDailySpend(profile.annualSalary, profile.monthlyExpenses, profile.debts, profile.goals) * 45, 0);

	return {
		verdict,
		tone,
		necessity: categoryLabel(product.necessity),
		impact: `${itemName} would leave ${formatMoney(balanceAfter)} in your bank balance.`,
		balanceAfter: formatMoney(balanceAfter),
		workCost: `${workHours.toFixed(1)} hrs`,
		pros: [
			`${product.name} category: ${product.lifespan}.`,
			highNecessity ? 'This category supports a core need.' : 'This can be delayed if cash is tight.',
			costShare <= 0.25 ? 'It uses a manageable share of monthly leftover cash.' : 'A lower-cost option would reduce pressure.'
		],
		cons: [
			product.risk,
			`It costs about ${workHours.toFixed(1)} work hours.`,
			balanceAfter < 0
				? 'It would put the bank balance below zero.'
				: costShare > 0.45
					? 'It takes a large share of monthly leftover cash.'
					: 'It reduces cash available for goals, debt, and emergencies.'
		],
		alternatives: [
			{
				option: 'Buy today',
				result: `${formatMoney(balanceAfter)} left`,
				timeCost: `${workHours.toFixed(1)} hrs`,
				verdict,
				tone
			},
			{
				option: 'Wait 45 days',
				result: `${formatMoney(balanceAfter + waitSavings)} projected left`,
				timeCost: `${Math.max(workHours - waitSavings / Math.max(calculateHourlyIncome(profile.annualSalary, profile.workHoursPerMonth), 1), 0).toFixed(1)} hrs`,
				verdict: waitSavings >= cost * 0.25 ? 'Better' : 'Still tight',
				tone: waitSavings >= cost * 0.25 ? 'safe' : 'caution'
			},
			{
				option: 'Buy cheaper',
				result: `${formatMoney(balance - cheaperCost)} left`,
				timeCost: `${(cheaperCost / Math.max(calculateHourlyIncome(profile.annualSalary, profile.workHoursPerMonth), 1)).toFixed(1)} hrs`,
				verdict: 'Lower impact',
				tone: 'safe'
			},
			{
				option: 'Skip it',
				result: `${formatMoney(cost)} preserved`,
				timeCost: '0.0 hrs',
				verdict: 'Future win',
				tone: 'safe'
			}
		],
		principal: cost,
		futureAmount: futureValue,
		futureValue: formatMoney(futureValue),
		opportunityGain: formatMoney(futureValue - cost)
	};
};
