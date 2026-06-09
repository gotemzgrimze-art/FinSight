export type StatusTone = 'safe' | 'caution' | 'risky' | 'danger';

export type ProductCategory =
	| 'home-appliance'
	| 'electronics'
	| 'decorations'
	| 'games'
	| 'food'
	| 'clothing'
	| 'healthcare'
	| 'transportation'
	| 'education'
	| 'furniture'
	| 'subscription'
	| 'gift'
	| 'travel';

export type Goal = {
	id: string;
	name: string;
	targetAmount: string;
	currentAmount: string;
	monthlyContribution: string;
};

export type Debt = {
	id: string;
	name: string;
	balance: string;
	minimumPayment: string;
	annualInterestRate: string;
};

export type Allowance = {
	id: string;
	name: string;
	limit: string;
	spent: string;
	period: 'weekly' | 'monthly';
};

export type SubscriptionTier = 'free' | 'premium' | 'student';

export type SubscriptionState = {
	tier: SubscriptionTier;
	purchaseChecksUsedThisMonth: number;
	isStudentVerified: boolean;
};

export type FinancialProfile = {
	creditScore: string;
	annualSalary: string;
	bankBalance: string;
	monthlyExpenses: string;
	workHoursPerMonth: string;
	investmentReturnRate: string;
	goals: Goal[];
	debts: Debt[];
	allowances: Allowance[];
};

export type PurchaseInput = {
	name: string;
	cost: string;
	category: ProductCategory;
};

export type ProductOption = {
	id: ProductCategory;
	name: string;
	necessity: number;
	lifespan: string;
	risk: string;
};

export type PurchaseAlternative = {
	option: string;
	result: string;
	timeCost: string;
	verdict: string;
	tone: StatusTone;
};

export type PurchaseAssessment = {
	verdict: string;
	tone: StatusTone;
	necessity: string;
	impact: string;
	balanceAfter: string;
	workCost: string;
	pros: string[];
	cons: string[];
	alternatives: PurchaseAlternative[];
	principal: number;
	futureAmount: number;
	futureValue: string;
	opportunityGain: string;
};

export type DashboardSnapshot = {
	monthlyIncome: number;
	monthlyLeftover: number;
	monthlyDebtPayment: number;
	debtRatio: number;
	runwayMonths: number;
	primaryGoalProgress: number;
	safeDailySpend: number;
};

export type ValidationIssue = {
	field: string;
	message: string;
};
