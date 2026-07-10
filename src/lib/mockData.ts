import type {
	Allowance,
	AssetAccount,
	Debt,
	FinancialProfile,
	Goal,
	ProductOption,
	RecurringItem,
	Transaction
} from '$lib/models';

export const demoGoals: Goal[] = [
	{
		id: 'goal-emergency',
		name: 'Emergency fund',
		targetAmount: '10000',
		currentAmount: '7200',
		monthlyContribution: '450'
	},
	{
		id: 'goal-trip',
		name: 'Japan trip',
		targetAmount: '3200',
		currentAmount: '900',
		monthlyContribution: '220'
	}
];

export const demoDebts: Debt[] = [
	{
		id: 'debt-student',
		name: 'Student loan',
		balance: '8600',
		minimumPayment: '260',
		annualInterestRate: '5.8'
	},
	{
		id: 'debt-card',
		name: 'Credit card',
		balance: '1400',
		minimumPayment: '110',
		annualInterestRate: '18.9'
	}
];

export const demoAllowances: Allowance[] = [
	{
		id: 'allow-food',
		name: 'Food',
		limit: '420',
		spent: '285',
		period: 'monthly'
	},
	{
		id: 'allow-fun',
		name: 'Fun money',
		limit: '90',
		spent: '44',
		period: 'weekly'
	}
];

export const demoTransactions: Transaction[] = [
	{
		id: 'txn-payroll',
		date: '2026-07-01',
		merchant: 'Payroll deposit',
		category: 'Income',
		amount: '5416',
		type: 'income',
		essential: true
	},
	{
		id: 'txn-rent',
		date: '2026-07-02',
		merchant: 'Rent',
		category: 'Housing',
		amount: '1650',
		type: 'expense',
		essential: true
	},
	{
		id: 'txn-groceries',
		date: '2026-07-04',
		merchant: 'Market basket',
		category: 'Food',
		amount: '148',
		type: 'expense',
		essential: true
	},
	{
		id: 'txn-coffee',
		date: '2026-07-05',
		merchant: 'Coffee run',
		category: 'Dining',
		amount: '18',
		type: 'expense',
		essential: false
	},
	{
		id: 'txn-streaming',
		date: '2026-07-07',
		merchant: 'StreamPlus',
		category: 'Subscriptions',
		amount: '19',
		type: 'expense',
		essential: false
	},
	{
		id: 'txn-gas',
		date: '2026-07-08',
		merchant: 'Fuel stop',
		category: 'Transportation',
		amount: '56',
		type: 'expense',
		essential: true
	},
	{
		id: 'txn-freelance',
		date: '2026-07-09',
		merchant: 'Freelance project',
		category: 'Income',
		amount: '420',
		type: 'income',
		essential: true
	}
];

export const demoRecurringItems: RecurringItem[] = [
	{
		id: 'rec-rent',
		name: 'Rent',
		amount: '1650',
		category: 'Housing',
		dueDay: '2',
		status: 'active'
	},
	{
		id: 'rec-phone',
		name: 'Phone plan',
		amount: '68',
		category: 'Utilities',
		dueDay: '12',
		status: 'active'
	},
	{
		id: 'rec-gym',
		name: 'Gym membership',
		amount: '44',
		category: 'Health',
		dueDay: '16',
		status: 'review'
	},
	{
		id: 'rec-stream',
		name: 'StreamPlus',
		amount: '19',
		category: 'Subscriptions',
		dueDay: '21',
		status: 'review'
	}
];

export const demoAssets: AssetAccount[] = [
	{
		id: 'asset-checking',
		name: 'Checking',
		type: 'cash',
		balance: '4250'
	},
	{
		id: 'asset-brokerage',
		name: 'Brokerage',
		type: 'investment',
		balance: '6400'
	},
	{
		id: 'asset-retirement',
		name: 'Retirement',
		type: 'retirement',
		balance: '18400'
	}
];

export const demoProfile: FinancialProfile = {
	creditScore: '720',
	annualSalary: '65000',
	bankBalance: '4250',
	monthlyExpenses: '2800',
	workHoursPerMonth: '173',
	investmentReturnRate: '8.5',
	goals: demoGoals,
	debts: demoDebts,
	allowances: demoAllowances,
	transactions: demoTransactions,
	recurringItems: demoRecurringItems,
	assets: demoAssets
};

export const productOptions: ProductOption[] = [
	{
		id: 'home-appliance',
		name: 'Home appliance',
		necessity: 8,
		lifespan: 'Long-term home use',
		risk: 'Repair or replacement urgency can justify cost'
	},
	{
		id: 'electronics',
		name: 'Electronics',
		necessity: 5,
		lifespan: 'Useful, but upgrades lose value fast',
		risk: 'Depreciates quickly'
	},
	{
		id: 'decorations',
		name: 'Decorations',
		necessity: 2,
		lifespan: 'Nice-to-have',
		risk: 'Easy to overspend on nonessential upgrades'
	},
	{
		id: 'games',
		name: 'Games',
		necessity: 2,
		lifespan: 'Entertainment value',
		risk: 'Best when paid from fun money'
	},
	{
		id: 'food',
		name: 'Food',
		necessity: 9,
		lifespan: 'Immediate need',
		risk: 'Frequent dining can quietly drain cash'
	},
	{
		id: 'clothing',
		name: 'Clothing',
		necessity: 6,
		lifespan: 'Depends on actual need',
		risk: 'Trendy items lose value fast'
	},
	{
		id: 'healthcare',
		name: 'Healthcare',
		necessity: 10,
		lifespan: 'Health and safety',
		risk: 'Delaying can create larger costs'
	},
	{
		id: 'transportation',
		name: 'Transportation',
		necessity: 8,
		lifespan: 'Work and mobility',
		risk: 'Maintenance and insurance can add up'
	},
	{
		id: 'education',
		name: 'Education',
		necessity: 7,
		lifespan: 'Skill-building',
		risk: 'Value depends on follow-through'
	},
	{
		id: 'furniture',
		name: 'Furniture',
		necessity: 5,
		lifespan: 'Longer-term home use',
		risk: 'Delivery and financing can raise cost'
	},
	{
		id: 'subscription',
		name: 'Subscription',
		necessity: 3,
		lifespan: 'Recurring cost',
		risk: 'Small monthly charges stack up'
	},
	{
		id: 'gift',
		name: 'Gift',
		necessity: 4,
		lifespan: 'Relationship value',
		risk: 'Set a limit before buying'
	},
	{
		id: 'travel',
		name: 'Travel',
		necessity: 3,
		lifespan: 'Experience value',
		risk: 'Flights, food, and lodging expand the real cost'
	}
];
