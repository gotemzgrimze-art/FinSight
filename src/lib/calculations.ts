import type {
	Debt,
	AssetAccount,
	FinancialProfile,
	Goal,
	GoalDelay,
	MoneyInsight,
	ProfileCompleteness,
	ProductOption,
	PurchaseAssessment,
	PurchaseAssessmentOptions,
	PurchaseInput,
	RecurringItem,
	StatusTone,
	Transaction
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
	const label = months < 1 ? `${roundedWeeks} weeks` : `${roundedMonths} months`;

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
	if (limit <= 0) return 0;
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

export const calculateDebtBalance = (debts: Debt[]): number =>
	debts.reduce((total, debt) => total + optionalMoney(debt.balance, `${debt.name} balance`), 0);

export const calculateAssetTotal = (assets: AssetAccount[]): number =>
	assets.reduce((total, asset) => total + optionalMoney(asset.balance, `${asset.name} balance`), 0);

export const calculateNetWorth = (assets: AssetAccount[], debts: Debt[]): number =>
	calculateAssetTotal(assets) - calculateDebtBalance(debts);

export const calculateRecurringMonthlyTotal = (items: RecurringItem[]): number =>
	items.reduce((total, item) => total + optionalMoney(item.amount, `${item.name} amount`), 0);

export const calculateRecurringReviewTotal = (items: RecurringItem[]): number =>
	items
		.filter((item) => item.status === 'review' || item.status === 'cancel')
		.reduce((total, item) => total + optionalMoney(item.amount, `${item.name} amount`), 0);

export const getUpcomingRecurringItems = (items: RecurringItem[], today = new Date()): RecurringItem[] => {
	const currentDay = today.getDate();

	return [...items]
		.filter((item) => item.status !== 'cancel')
		.sort((left, right) => {
			const leftDay = Math.max(1, Math.min(31, Math.round(optionalMoney(left.dueDay, `${left.name} due day`))));
			const rightDay = Math.max(1, Math.min(31, Math.round(optionalMoney(right.dueDay, `${right.name} due day`))));
			const leftDistance = leftDay >= currentDay ? leftDay - currentDay : leftDay + 31 - currentDay;
			const rightDistance = rightDay >= currentDay ? rightDay - currentDay : rightDay + 31 - currentDay;
			return leftDistance - rightDistance;
		})
		.slice(0, 4);
};

export const calculateTransactionSummary = (transactions: Transaction[]) => {
	const categories = new Map<string, number>();
	let income = 0;
	let expenses = 0;
	let essentialExpenses = 0;
	let discretionaryExpenses = 0;

	for (const transaction of transactions) {
		const amount = optionalMoney(transaction.amount, `${transaction.merchant} amount`);

		if (transaction.type === 'income') {
			income += amount;
			continue;
		}

		expenses += amount;
		if (transaction.essential) essentialExpenses += amount;
		else discretionaryExpenses += amount;
		categories.set(transaction.category, (categories.get(transaction.category) ?? 0) + amount);
	}

	return {
		income,
		expenses,
		essentialExpenses,
		discretionaryExpenses,
		net: income - expenses,
		topCategories: [...categories.entries()]
			.map(([category, amount]) => ({ category, amount }))
			.sort((left, right) => right.amount - left.amount)
			.slice(0, 5)
	};
};

export const calculateGoalContributionTotal = (goals: Goal[]): number =>
	goals.reduce((total, goal) => total + optionalMoney(goal.monthlyContribution, `${goal.name} monthly contribution`), 0);

export const calculateMonthlyPlan = (profile: FinancialProfile) => {
	const monthlyIncome = calculateMonthlyIncome(profile.annualSalary);
	const expenses = optionalMoney(profile.monthlyExpenses, 'monthly expenses');
	const debtPayments = calculateMonthlyDebtPayment(profile.debts);
	const goalContributions = calculateGoalContributionTotal(profile.goals);
	const recurringTotal = calculateRecurringMonthlyTotal(profile.recurringItems);
	const leftover = monthlyIncome - expenses - debtPayments - goalContributions;
	const fixedPressure = expenses + debtPayments + goalContributions;
	const fixedRatio = monthlyIncome > 0 ? (fixedPressure / monthlyIncome) * 100 : 0;

	return {
		monthlyIncome,
		expenses,
		debtPayments,
		goalContributions,
		recurringTotal,
		leftover,
		fixedPressure,
		fixedRatio
	};
};

export const generateMoneyInsights = (profile: FinancialProfile): MoneyInsight[] => {
	const insights: MoneyInsight[] = [];
	const plan = calculateMonthlyPlan(profile);
	const safeDailySpend = calculateSafeDailySpend(
		profile.annualSalary,
		profile.monthlyExpenses,
		profile.debts,
		profile.goals
	);
	const runwayMonths = calculateRunwayMonths(profile.bankBalance, profile.monthlyExpenses, profile.debts);
	const debtRatio = calculateDebtRatio(profile.annualSalary, profile.debts);
	const reviewTotal = calculateRecurringReviewTotal(profile.recurringItems);
	const transactionSummary = calculateTransactionSummary(profile.transactions);

	if (plan.leftover < 0) {
		insights.push({
			id: 'negative-leftover',
			title: 'Monthly plan is short',
			body: `${formatMoney(Math.abs(plan.leftover))} more is committed than expected income after bills, debt, and goals.`,
			tone: 'danger',
			action: 'Cut spending, pause a goal, or raise income before new purchases.'
		});
	} else {
		insights.push({
			id: 'safe-spend',
			title: 'Daily spending guardrail',
			body: `${formatMoney(safeDailySpend)} is the current safe daily spend after bills, debt, and goals.`,
			tone: safeDailySpend >= 25 ? 'safe' : 'caution',
			action: 'Use this number before dining, shopping, or impulse buys.'
		});
	}

	if (runwayMonths < 1) {
		insights.push({
			id: 'runway-low',
			title: 'Cash runway is thin',
			body: `Current cash covers about ${runwayMonths.toFixed(1)} months of expenses and debt payments.`,
			tone: 'danger',
			action: 'Prioritize emergency cash before optional purchases.'
		});
	} else if (runwayMonths < 3) {
		insights.push({
			id: 'runway-building',
			title: 'Emergency fund needs attention',
			body: `Cash runway is ${runwayMonths.toFixed(1)} months; many plans target at least 3 months.`,
			tone: 'caution',
			action: 'Send extra monthly surplus toward emergency savings.'
		});
	}

	if (debtRatio > 36) {
		insights.push({
			id: 'debt-pressure',
			title: 'Debt pressure is high',
			body: `${debtRatio.toFixed(1)}% of monthly income goes to minimum debt payments.`,
			tone: 'danger',
			action: 'Direct extra cash to high-interest debt before lifestyle upgrades.'
		});
	}

	if (reviewTotal > 0) {
		insights.push({
			id: 'recurring-review',
			title: 'Recurring charges to review',
			body: `${formatMoney(reviewTotal)} per month is marked for review or cancellation.`,
			tone: 'caution',
			action: 'Cancel one weak subscription and rerun the purchase check.'
		});
	}

	if (transactionSummary.discretionaryExpenses > transactionSummary.essentialExpenses * 0.35) {
		insights.push({
			id: 'discretionary-spend',
			title: 'Flexible spending is climbing',
			body: `${formatMoney(transactionSummary.discretionaryExpenses)} of tracked spending is discretionary.`,
			tone: 'caution',
			action: 'Set a weekly cap for dining, shopping, and entertainment.'
		});
	}

	return insights.slice(0, 5);
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

export const getProfileCompleteness = (profile: FinancialProfile): ProfileCompleteness => {
	const missing: string[] = [];

	if (!profile.annualSalary.trim()) missing.push('income');
	if (!profile.bankBalance.trim()) missing.push('bank balance');
	if (!profile.monthlyExpenses.trim()) missing.push('expenses');
	if (!profile.workHoursPerMonth.trim()) missing.push('work hours');
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
	const waitDays = options.waitDays ?? 45;
	const cheaperAlternativePercentage = options.cheaperAlternativePercentage ?? 0.72;
	const investmentYears = options.investmentYears ?? 15;
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
	const annualReturnRate = parsePercentage(profile.investmentReturnRate, 'investment return rate') / 100;
	const futureValue = calculateFutureValue(cost, annualReturnRate, investmentYears);
	const cheaperCost = cost * cheaperAlternativePercentage;
	const waitSavings = Math.max(
		calculateSafeDailySpend(profile.annualSalary, profile.monthlyExpenses, profile.debts, profile.goals) * waitDays,
		0
	);
	const goalDelays = calculateGoalDelaysForPurchase(cost, profile.goals);
	const goalDelaySummary = goalDelays[0]?.label ?? 'No goals';
	const debtTarget = profile.debts.find((debt) => optionalMoney(debt.balance, `${debt.name} balance`) > 0);

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
						: calculateGoalDelayMonths(Math.max(cost - waitSavings, 0.01), profile.goals[0]?.monthlyContribution ?? '0').label,
				verdict: waitSavings >= cost * 0.25 ? 'Better' : 'Still tight',
				tone: waitSavings >= cost * 0.25 ? 'safe' : 'caution'
			},
			{
				option: 'Buy cheaper',
				result: `${formatMoney(balance - cheaperCost)} left`,
				timeCost: `${(cheaperCost / Math.max(hourlyIncome, 1)).toFixed(1)} hrs`,
				goalDelay: calculateGoalDelayMonths(cheaperCost, profile.goals[0]?.monthlyContribution ?? '0').label,
				verdict: 'Lower impact',
				tone: 'safe'
			},
			{
				option: 'Invest instead',
				result: `${formatMoney(futureValue)} in ${investmentYears} years`,
				timeCost: '0.0 hrs',
				goalDelay: 'No goal delay',
				verdict: `${formatMoney(futureValue - cost)} potential gain`,
				tone: 'safe'
			},
			{
				option: 'Pay debt instead',
				result: debtTarget
					? `${formatMoney(Math.min(cost, optionalMoney(debtTarget.balance, `${debtTarget.name} balance`)))} toward ${debtTarget.name}`
					: 'No active debt',
				timeCost: '0.0 hrs',
				goalDelay: 'No purchase delay',
				verdict: debtTarget ? 'Reduces obligations' : 'Not applicable',
				tone: debtTarget ? 'safe' : 'caution'
			},
			{
				option: 'Skip it',
				result: `${formatMoney(cost)} preserved`,
				timeCost: '0.0 hrs',
				goalDelay: 'No goal delay',
				verdict: 'Future win',
				tone: 'safe'
			}
		],
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
