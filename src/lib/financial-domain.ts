import type { Money, SupportedCurrency } from '$lib/money';

export type Frequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'annual' | 'one_time';
export type IncomeStability = 'stable' | 'variable' | 'seasonal' | 'unpredictable';
export type DebtType = 'credit_card' | 'student_loan' | 'auto_loan' | 'personal_loan' | 'mortgage' | 'other';
export type GoalPriority = 'low' | 'medium' | 'high';
export type ImpactLevel = 'LOW_IMPACT' | 'MODERATE_IMPACT' | 'HIGH_IMPACT' | 'VERY_HIGH_IMPACT';
export type ReasonCode =
	| 'EMERGENCY_RUNWAY_LOW'
	| 'HIGH_PERCENT_LIQUID_CASH'
	| 'HIGH_PERCENT_DISCRETIONARY'
	| 'UPCOMING_BILLS_HIGH'
	| 'HIGH_INTEREST_DEBT'
	| 'GOAL_DELAY'
	| 'INCOME_VOLATILITY'
	| 'NEGATIVE_CASH_AFTER_PURCHASE'
	| 'EMERGENCY_TARGET_BREACHED';

export type UserProfile = {
	userId: string;
	firstName: string;
	lastName: string;
	country: string;
	preferredCurrency: SupportedCurrency;
	employmentStatus?: string | null;
	emergencyFundMonths: number;
	onboardingCompletedAt?: Date | null;
};

export type FinancialAccount = {
	id: string;
	userId: string;
	provider: string;
	accountType: 'checking' | 'savings' | 'credit_card' | 'loan' | 'investment' | 'other';
	accountName: string;
	balance: Money;
	availableBalance?: Money | null;
	lastSyncedAt?: Date | null;
};

export type IncomeSource = {
	id: string;
	userId: string;
	name: string;
	amount: Money;
	frequency: Frequency;
	stability: IncomeStability;
	nextExpectedDate?: string | null;
};

export type Expense = {
	id: string;
	userId: string;
	category: string;
	name: string;
	amount: Money;
	frequency: Frequency;
	nextDueDate?: string | null;
};

export type DebtRecord = {
	id: string;
	userId: string;
	name: string;
	debtType: DebtType;
	balance: Money;
	aprBasisPoints: number;
	minimumPayment: Money;
	paymentDueDate?: string | null;
};

export type FinancialGoal = {
	id: string;
	userId: string;
	name: string;
	targetAmount: Money;
	currentAmount: Money;
	targetDate?: string | null;
	priority: GoalPriority;
	monthlyContribution: Money;
};

export type TransactionCategory =
	| 'Housing'
	| 'Utilities'
	| 'Transportation'
	| 'Groceries'
	| 'Restaurants'
	| 'Shopping'
	| 'Entertainment'
	| 'Healthcare'
	| 'Insurance'
	| 'Subscriptions'
	| 'Debt Payment'
	| 'Income'
	| 'Transfer'
	| 'Other';

export type Transaction = {
	id: string;
	userId: string;
	financialAccountId: string;
	externalTransactionId?: string | null;
	amount: Money;
	merchant?: string | null;
	description: string;
	category: TransactionCategory;
	transactionDate: string;
	pending: boolean;
};

export type FinancialModel = {
	profile: UserProfile;
	accounts: FinancialAccount[];
	incomeSources: IncomeSource[];
	expenses: Expense[];
	debts: DebtRecord[];
	goals: FinancialGoal[];
	transactions?: Transaction[];
};
