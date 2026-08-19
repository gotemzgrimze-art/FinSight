import { fail, redirect } from '@sveltejs/kit';
import { parseMoneyToMinor, assertSupportedCurrency } from '$lib/money';
import { analytics } from '$lib/server/analytics';
import { getDb, hasDatabase } from '$lib/server/db';
import { debts, expenses, financialAccounts, financialGoals, incomeSources, profiles } from '$lib/server/db/schema';
import { requireAuthenticatedUser } from '$lib/server/form';

const id = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;
const dateOrNull = (value: FormDataEntryValue | null) => {
	const text = String(value ?? '').trim();
	return text ? new Date(`${text}T00:00:00.000Z`) : null;
};

export const load = async (event) => {
	const user = requireAuthenticatedUser(event);
	await analytics.track(user.id, 'onboarding_started');
	return { hasDatabase };
};

export const actions = {
	default: async (event) => {
		const user = requireAuthenticatedUser(event);
		if (!hasDatabase) return fail(503, { error: 'Configure DATABASE_URL before saving onboarding data.' });
		const formData = await event.request.formData();
		const currency = assertSupportedCurrency(String(formData.get('preferredCurrency') ?? 'USD'));
		const database = getDb();
		const monthlyIncome = parseMoneyToMinor(String(formData.get('monthlyIncome') ?? '0'), currency, 'monthly income');
		const additionalIncome = parseMoneyToMinor(String(formData.get('additionalIncome') || '0'), currency, 'additional income');
		const checking = parseMoneyToMinor(String(formData.get('checkingBalance') ?? '0'), currency, 'checking balance');
		const savings = parseMoneyToMinor(String(formData.get('savingsBalance') ?? '0'), currency, 'savings balance');
		const expenseItems = [
			['Housing', 'Housing', formData.get('housing')],
			['Utilities', 'Utilities', formData.get('utilities')],
			['Transportation', 'Transportation', formData.get('transportation')],
			['Groceries', 'Food', formData.get('food')],
			['Insurance', 'Insurance', formData.get('insurance')],
			['Subscriptions', 'Subscriptions', formData.get('subscriptions')],
			['Other', 'Other recurring expenses', formData.get('otherExpenses')]
		] as const;

		await database.insert(profiles).values({
			id: id('profile'),
			userId: user.id,
			firstName: String(formData.get('firstName') ?? ''),
			lastName: String(formData.get('lastName') ?? ''),
			country: String(formData.get('country') ?? 'US'),
			preferredCurrency: currency,
			employmentStatus: String(formData.get('employmentStatus') ?? ''),
			emergencyFundMonths: Number(formData.get('emergencyFundMonths') ?? 3),
			onboardingCompletedAt: new Date()
		}).onConflictDoUpdate({
			target: profiles.userId,
			set: {
				country: String(formData.get('country') ?? 'US'),
				preferredCurrency: currency,
				employmentStatus: String(formData.get('employmentStatus') ?? ''),
				emergencyFundMonths: Number(formData.get('emergencyFundMonths') ?? 3),
				onboardingCompletedAt: new Date(),
				updatedAt: new Date()
			}
		});

		await database.insert(financialAccounts).values([
			{ id: id('acct'), userId: user.id, provider: 'manual', accountType: 'checking', accountName: 'Checking', currency, currentBalanceMinor: checking.amountMinor, availableBalanceMinor: checking.amountMinor },
			{ id: id('acct'), userId: user.id, provider: 'manual', accountType: 'savings', accountName: 'Savings', currency, currentBalanceMinor: savings.amountMinor, availableBalanceMinor: savings.amountMinor }
		]);

		const incomeStability = String(formData.get('incomeStability') ?? 'stable') as 'stable' | 'variable' | 'seasonal' | 'unpredictable';
		const incomeRows: Array<{
			id: string;
			userId: string;
			name: string;
			amountMinor: number;
			currency: string;
			frequency: 'monthly';
			stability: 'stable' | 'variable' | 'seasonal' | 'unpredictable';
			nextExpectedDate?: Date | null;
		}> = [
			{ id: id('inc'), userId: user.id, name: 'Monthly net income', amountMinor: monthlyIncome.amountMinor, currency, frequency: 'monthly' as const, stability: incomeStability, nextExpectedDate: dateOrNull(formData.get('nextIncomeDate')) },
			{ id: id('inc'), userId: user.id, name: 'Additional income', amountMinor: additionalIncome.amountMinor, currency, frequency: 'monthly' as const, stability: 'variable' as const }
		].filter((row) => row.amountMinor > 0);
		if (incomeRows.length) await database.insert(incomeSources).values(incomeRows);

		const expenseRows = expenseItems
			.map(([category, name, value]) => ({ category, name, amount: parseMoneyToMinor(String(value || '0'), currency, name) }))
			.filter((item) => item.amount.amountMinor > 0)
			.map((item) => ({ id: id('exp'), userId: user.id, category: item.category, name: item.name, amountMinor: item.amount.amountMinor, currency, frequency: 'monthly' as const }));
		if (expenseRows.length) await database.insert(expenses).values(expenseRows);

		const debtBalance = parseMoneyToMinor(String(formData.get('debtBalance') || '0'), currency, 'debt balance');
		if (debtBalance.amountMinor > 0) {
			await database.insert(debts).values({
				id: id('debt'),
				userId: user.id,
				name: String(formData.get('debtName') || 'Debt'),
				debtType: String(formData.get('debtType') || 'other') as never,
				balanceMinor: debtBalance.amountMinor,
				currency,
				aprBasisPoints: Math.round(Number(formData.get('debtApr') || 0) * 100),
				minimumPaymentMinor: parseMoneyToMinor(String(formData.get('debtMinimumPayment') || '0'), currency, 'minimum payment').amountMinor,
				paymentDueDate: dateOrNull(formData.get('debtDueDate'))
			});
		}

		const goalTarget = parseMoneyToMinor(String(formData.get('goalTargetAmount') || '0'), currency, 'goal target');
		if (goalTarget.amountMinor > 0) {
			await database.insert(financialGoals).values({
				id: id('goal'),
				userId: user.id,
				name: String(formData.get('goalName') || 'Goal'),
				targetAmountMinor: goalTarget.amountMinor,
				currentAmountMinor: parseMoneyToMinor(String(formData.get('goalCurrentAmount') || '0'), currency, 'goal current').amountMinor,
				currency,
				targetDate: dateOrNull(formData.get('goalTargetDate')),
				priority: String(formData.get('goalPriority') || 'medium') as never,
				monthlyContributionMinor: parseMoneyToMinor(String(formData.get('goalMonthlyContribution') || '0'), currency, 'goal contribution').amountMinor
			});
		}

		await analytics.track(user.id, 'onboarding_completed');
		throw redirect(303, '/dashboard');
	}
};
