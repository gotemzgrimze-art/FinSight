import type { Allowance, Debt, FinancialProfile, Goal, ProductOption } from '$lib/models';

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

export const demoProfile: FinancialProfile = {
	creditScore: '720',
	annualSalary: '65000',
	bankBalance: '4250',
	monthlyExpenses: '2800',
	workHoursPerMonth: '173',
	investmentReturnRate: '8.5',
	goals: demoGoals,
	debts: demoDebts,
	allowances: demoAllowances
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
