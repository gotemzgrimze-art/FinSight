import type {
	Debt,
	FinancialProfile,
	Goal,
	GoalDelay,
	ProfileCompleteness,
	ProductOption,
	PurchaseAssessment,
	PurchaseAssessmentOptions,
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

export const calculateGoalDelayMonths = (
	purchaseCost: string | number,
	monthlyGoalContribution: string | number
): { months: number | null; weeks: number | null; label: string } => {
	const cost =
		typeof purchaseCost === 'number' ? purchaseCost : parseMoney(purchaseCost, 'purchase price');
	if (!Number.isFinite(cost)) throw new Error('purchase price must be a valid money amount');
	if (cost <= 0) throw new Error('purchase price must be greater than 0');

	const contribution =
		typeof monthlyGoalContribution === 'number'
			? monthlyGoalContribution
			: optionalMoney(monthlyGoalContribution, 'monthly contribution');

	if (!Number.isFinite(contribution)) throw new Error('monthly contribution must be a valid money amount');
	if (contribution < 0) throw new Error('monthly contribution cannot be negative');
	if (contribution === 0) return { months: null, weeks: null, label: 'No active contribution' };

	const months = cost / contribution;
	const weeks = months * 4.345;
	const roundedMonths = Number(months.toFixed(1));
	const roundedWeeks = Math.round(weeks);
	const monthUnit = roundedMonths === 1 ? 'month' : 'months';
	const weekUnit = roundedWeeks === 1 ? 'week' : 'weeks';
	const label = months < 1 ? `${roundedWeeks} ${weekUnit}` : `${roundedMonths} ${monthUnit}`;

	return {
		months: roundedMonths,
		weeks: roundedWeeks,
		label
	};
};

export const calculateGoalDelaysForPurchase = (
	purchaseCost: string | number,
	goals: Goal[]
): GoalDelay[] =>
	goals.map((goal) => {
		const delay = calculateGoalDelayMonths(purchaseCost, goal.monthlyContribution);
		return {
			goalId: goal.id,
			goalName: goal.name,
			...delay
		};
	});

export const calculateAllowanceRemaining = (limitAmount: string, spentAmount: string): number =>
	Math.max(optionalMoney(limitAmount, 'allowance limit') - optionalMoney(spentAmount, 'allowance spent'), 0);

export const calculateAllowanceUsagePercent = (limitAmount: string, spentAmount: string): number => {
	const limit = optionalMoney(limitAmount, 'allowance limit');
	if (limit <= 0) throw new Error('allowance limit must be greater than 0');
	return Math.min((optionalMoney(spentAmount, 'allowance spent') / limit) * 100, 100);
};

export const calculateSafeDailyAllowanceSpend = (remainingAmount: string | number, daysLeft: number): number => {
	if (daysLeft <= 0) throw new Error('days left must be greater than 0');
	const remaining =
		typeof remainingAmount === 'number'
			? remainingAmount
			: optionalMoney(remainingAmount, 'allowance remaining');
	if (!Number.isFinite(remaining)) throw new Error('allowance remaining must be a valid money amount');
	return Math.max(remaining / daysLeft, 0);
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

const positiveOption = (value: number, fallback: number, fieldName: string): number => {
	const resolved = value ?? fallback;
	if (!Number.isFinite(resolved) || resolved <= 0) throw new Error(`${fieldName} must be greater than 0`);
	return resolved;
};

const summarizeGoalDelay = (goalDelays: GoalDelay[], fallback = 'No active goal delay'): string => {
	const activeDelay = goalDelays.find((delay) => delay.months !== null);
	if (!activeDelay) return goalDelays[0]?.label ?? fallback;
	return `${activeDelay.goalName}: ${activeDelay.label}`;
};

const hasValidMoneyInput = (value: string, fieldName: string): boolean => {
	try {
		parseMoney(value, fieldName);
		return true;
	} catch {
		return false;
	}
};

const hasValidPositiveMoneyInput = (value: string, fieldName: string): boolean => {
	try {
		return parseMoney(value, fieldName) > 0;
	} catch {
		return false;
	}
};

export const getProfileCompleteness = (profile: FinancialProfile): ProfileCompleteness => {
	const missing: string[] = [];

	if (!hasValidPositiveMoneyInput(profile.annualSalary, 'annual income')) missing.push('income');
	if (!hasValidMoneyInput(profile.bankBalance, 'bank balance')) missing.push('bank balance');
	if (!hasValidMoneyInput(profile.monthlyExpenses, 'monthly expenses')) missing.push('expenses');
	if (!hasValidPositiveMoneyInput(profile.workHoursPerMonth, 'work hours')) missing.push('work hours');
	if (profile.goals.length === 0 && profile.allowances.length === 0 && profile.debts.length === 0) {
		missing.push('goals, allowances, or debts');
	}

	if (missing.length === 0) {
		return {
			status: 'complete',
			label: 'Complete',
			missing,
			isComplete: true
		};
	}

	const firstMissing = missing[0];
	const status =
		firstMissing === 'income'
			? 'needs-income'
			: firstMissing === 'bank balance'
				? 'needs-bank-balance'
			: firstMissing === 'expenses'
				? 'needs-expenses'
				: firstMissing === 'work hours'
					? 'needs-work-hours'
					: 'needs-planning-items';

	const label =
		status === 'needs-income'
			? 'Needs income'
			: status === 'needs-bank-balance'
				? 'Needs bank balance'
			: status === 'needs-expenses'
				? 'Needs expenses'
				: status === 'needs-work-hours'
					? 'Needs work hours'
					: 'Needs goals/allowances/debts';

	return { status, label, missing, isComplete: false };
};

export const calculateAffordabilityVerdict = (
	profile: FinancialProfile,
	purchase: PurchaseInput,
	product: ProductOption,
	options: PurchaseAssessmentOptions = {}
): PurchaseAssessment => {
	const waitDays = positiveOption(options.waitDays ?? 45, 45, 'wait days');
	const cheaperAlternativePercentage = positiveOption(
		options.cheaperAlternativePercentage ?? 0.72,
		0.72,
		'cheaper alternative percentage'
	);
	if (cheaperAlternativePercentage > 1) {
		throw new Error('cheaper alternative percentage cannot exceed 100%');
	}
	const investmentYears = positiveOption(options.investmentYears ?? 15, 15, 'investment years');
	const includeInvestmentOpportunityCost = options.includeInvestmentOpportunityCost ?? true;
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
	const hourlyIncome = calculateHourlyIncome(profile.annualSalary, profile.workHoursPerMonth);
	const annualReturnRate = includeInvestmentOpportunityCost
		? parsePercentage(profile.investmentReturnRate, 'investment return rate') / 100
		: 0;
	const futureValue = calculateFutureValue(cost, annualReturnRate, investmentYears);
	const cheaperCost = cost * cheaperAlternativePercentage;
	const waitSavings = Math.max(
		calculateSafeDailySpend(profile.annualSalary, profile.monthlyExpenses, profile.debts, profile.goals) * waitDays,
		0
	);
	const goalDelays = calculateGoalDelaysForPurchase(cost, profile.goals);
	const goalDelaySummary = summarizeGoalDelay(goalDelays, 'No goals');
	const debtTarget = profile.debts.find((debt) => optionalMoney(debt.balance, `${debt.name} balance`) > 0);
	const alternatives: PurchaseAssessment['alternatives'] = [
		{
			option: 'Buy now',
			result: `${formatMoney(balanceAfter)} left after cash impact`,
			timeCost: `${workHours.toFixed(1)} hrs`,
			goalDelay: goalDelaySummary,
			verdict,
			tone
		},
		{
			option: `Wait ${waitDays} days`,
			result: `${formatMoney(balanceAfter + waitSavings)} projected left`,
			timeCost: `${Math.max(workHours - waitSavings / Math.max(hourlyIncome, 1), 0).toFixed(1)} hrs`,
			goalDelay:
				waitSavings >= cost
					? 'No delay if fully saved first'
					: summarizeGoalDelay(
							calculateGoalDelaysForPurchase(Math.max(cost - waitSavings, 0.01), profile.goals),
							'No goals'
						),
			verdict: waitSavings >= cost * 0.25 ? 'Better' : 'Still tight',
			tone: waitSavings >= cost * 0.25 ? 'safe' : 'caution'
		},
		{
			option: 'Buy cheaper version',
			result: `${formatMoney(balance - cheaperCost)} left after cash impact`,
			timeCost: `${(cheaperCost / Math.max(hourlyIncome, 1)).toFixed(1)} hrs`,
			goalDelay: summarizeGoalDelay(calculateGoalDelaysForPurchase(cheaperCost, profile.goals), 'No goals'),
			verdict: `${Math.round(cheaperAlternativePercentage * 100)}% cost`,
			tone: 'safe'
		}
	];

	if (includeInvestmentOpportunityCost) {
		alternatives.push({
			option: 'Invest instead',
			result: `${formatMoney(futureValue)} in ${investmentYears} years`,
			timeCost: '0.0 hrs',
			goalDelay: 'No purchase delay',
			verdict: `${formatMoney(futureValue - cost)} potential gain`,
			tone: 'safe'
		});
	}

	if (debtTarget) {
		alternatives.push({
			option: 'Pay debt instead',
			result: `${formatMoney(Math.min(cost, optionalMoney(debtTarget.balance, `${debtTarget.name} balance`)))} toward ${debtTarget.name}`,
			timeCost: `${workHours.toFixed(1)} hrs redirected`,
			goalDelay: 'No purchase delay',
			verdict: 'Reduces obligations',
			tone: 'safe'
		});
	}

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
		alternatives,
		goalDelays,
		waitDays,
		cheaperAlternativePercentage,
		investmentYears,
		principal: cost,
		futureAmount: futureValue,
		futureValue: formatMoney(futureValue),
		opportunityGain: formatMoney(futureValue - cost)
	};
};
