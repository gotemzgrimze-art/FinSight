import { and, desc, eq } from 'drizzle-orm';
import type { FinancialModel } from '$lib/financial-domain';
import { assertSupportedCurrency, type Money } from '$lib/money';
import { getDb } from '$lib/server/db';
import {
	auditEvents,
	debts,
	expenses,
	financialAccounts,
	financialGoals,
	incomeSources,
	profiles,
	purchaseChecks,
	transactions
} from '$lib/server/db/schema';

const id = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;
const dateOnly = (value: Date | null): string | null => value?.toISOString().slice(0, 10) ?? null;
const money = (amountMinor: number, currency: string): Money => ({
	amountMinor,
	currency: assertSupportedCurrency(currency)
});

export const getFinancialModelForUser = async (userId: string): Promise<FinancialModel | null> => {
	const database = getDb();
	const [profile] = await database.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
	if (!profile) return null;

	const [accounts, incomes, expenseRows, debtRows, goalRows, transactionRows] = await Promise.all([
		database.select().from(financialAccounts).where(eq(financialAccounts.userId, userId)),
		database.select().from(incomeSources).where(eq(incomeSources.userId, userId)),
		database.select().from(expenses).where(eq(expenses.userId, userId)),
		database.select().from(debts).where(eq(debts.userId, userId)),
		database.select().from(financialGoals).where(eq(financialGoals.userId, userId)),
		database.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.transactionDate)).limit(100)
	]);

	return {
		profile: {
			userId,
			firstName: profile.firstName,
			lastName: profile.lastName,
			country: profile.country,
			preferredCurrency: assertSupportedCurrency(profile.preferredCurrency),
			employmentStatus: profile.employmentStatus,
			emergencyFundMonths: profile.emergencyFundMonths,
			onboardingCompletedAt: profile.onboardingCompletedAt
		},
		accounts: accounts.map((account) => ({
			id: account.id,
			userId,
			provider: account.provider,
			accountType: account.accountType,
			accountName: account.accountName,
			balance: money(account.currentBalanceMinor, account.currency),
			availableBalance:
				account.availableBalanceMinor === null ? null : money(account.availableBalanceMinor, account.currency),
			lastSyncedAt: account.lastSyncedAt
		})),
		incomeSources: incomes.map((income) => ({
			id: income.id,
			userId,
			name: income.name,
			amount: money(income.amountMinor, income.currency),
			frequency: income.frequency,
			stability: income.stability,
			nextExpectedDate: dateOnly(income.nextExpectedDate)
		})),
		expenses: expenseRows.map((expense) => ({
			id: expense.id,
			userId,
			category: expense.category,
			name: expense.name,
			amount: money(expense.amountMinor, expense.currency),
			frequency: expense.frequency,
			nextDueDate: dateOnly(expense.nextDueDate)
		})),
		debts: debtRows.map((debt) => ({
			id: debt.id,
			userId,
			name: debt.name,
			debtType: debt.debtType,
			balance: money(debt.balanceMinor, debt.currency),
			aprBasisPoints: debt.aprBasisPoints,
			minimumPayment: money(debt.minimumPaymentMinor, debt.currency),
			paymentDueDate: dateOnly(debt.paymentDueDate)
		})),
		goals: goalRows.map((goal) => ({
			id: goal.id,
			userId,
			name: goal.name,
			targetAmount: money(goal.targetAmountMinor, goal.currency),
			currentAmount: money(goal.currentAmountMinor, goal.currency),
			targetDate: dateOnly(goal.targetDate),
			priority: goal.priority,
			monthlyContribution: money(goal.monthlyContributionMinor, goal.currency)
		})),
		transactions: transactionRows.map((transaction) => ({
			id: transaction.id,
			userId,
			financialAccountId: transaction.financialAccountId,
			externalTransactionId: transaction.externalTransactionId,
			amount: money(transaction.amountMinor, transaction.currency),
			merchant: transaction.merchant,
			description: transaction.description,
			category: transaction.category as never,
			transactionDate: transaction.transactionDate.toISOString().slice(0, 10),
			pending: transaction.pending
		}))
	};
};

export const savePurchaseCheckForUser = async (
	userId: string,
	data: {
		requestedAmount: Money;
		category: string;
		engineVersion: string;
		impactLevel: 'LOW_IMPACT' | 'MODERATE_IMPACT' | 'HIGH_IMPACT' | 'VERY_HIGH_IMPACT';
		confidence: string;
		explanationJson: unknown;
	}
) => {
	const database = getDb();
	const [row] = await database
		.insert(purchaseChecks)
		.values({
			id: id('pch'),
			userId,
			requestedAmountMinor: data.requestedAmount.amountMinor,
			currency: data.requestedAmount.currency,
			category: data.category,
			engineVersion: data.engineVersion,
			impactLevel: data.impactLevel,
			confidence: data.confidence,
			explanationJson: data.explanationJson
		})
		.returning();
	return row;
};

export const createAuditEvent = async (userId: string | null, action: string, metadata: Record<string, unknown> = {}) => {
	await getDb().insert(auditEvents).values({
		id: id('audit'),
		userId,
		action,
		metadata
	});
};

export const deleteFinancialDataForUser = async (userId: string) => {
	const database = getDb();
	await Promise.all([
		database.delete(transactions).where(eq(transactions.userId, userId)),
		database.delete(purchaseChecks).where(eq(purchaseChecks.userId, userId)),
		database.delete(financialGoals).where(eq(financialGoals.userId, userId)),
		database.delete(debts).where(eq(debts.userId, userId)),
		database.delete(expenses).where(eq(expenses.userId, userId)),
		database.delete(incomeSources).where(eq(incomeSources.userId, userId)),
		database.delete(financialAccounts).where(eq(financialAccounts.userId, userId))
	]);
};

export const updateTransactionCategoryForUser = async (userId: string, transactionId: string, category: string) => {
	const [row] = await getDb()
		.update(transactions)
		.set({ category, updatedAt: new Date() })
		.where(and(eq(transactions.userId, userId), eq(transactions.id, transactionId)))
		.returning();
	return row ?? null;
};
