import type { FinancialModel } from '$lib/financial-domain';
import type { Money, SupportedCurrency } from '$lib/money';

const currency: SupportedCurrency = 'USD';
const money = (amountMinor: number): Money => ({ amountMinor, currency });

export const demoFinancialModel: FinancialModel = {
	profile: {
		userId: 'demo-user-alex-morgan',
		firstName: 'Alex',
		lastName: 'Morgan',
		country: 'US',
		preferredCurrency: currency,
		emergencyFundMonths: 3,
		employmentStatus: 'Full-time'
	},
	accounts: [
		{
			id: 'demo-checking',
			userId: 'demo-user-alex-morgan',
			provider: 'demo',
			accountType: 'checking',
			accountName: 'Demo Checking',
			balance: money(385_000),
			availableBalance: money(385_000)
		},
		{
			id: 'demo-savings',
			userId: 'demo-user-alex-morgan',
			provider: 'demo',
			accountType: 'savings',
			accountName: 'Demo Savings',
			balance: money(740_000),
			availableBalance: money(740_000)
		}
	],
	incomeSources: [
		{
			id: 'demo-income',
			userId: 'demo-user-alex-morgan',
			name: 'Take-home pay',
			amount: money(520_000),
			frequency: 'monthly',
			stability: 'stable',
			nextExpectedDate: '2026-09-01'
		}
	],
	expenses: [
		{ id: 'housing', userId: 'demo-user-alex-morgan', category: 'Housing', name: 'Rent', amount: money(185_000), frequency: 'monthly', nextDueDate: '2026-08-25' },
		{ id: 'utilities', userId: 'demo-user-alex-morgan', category: 'Utilities', name: 'Utilities', amount: money(24_000), frequency: 'monthly', nextDueDate: '2026-08-28' },
		{ id: 'transportation', userId: 'demo-user-alex-morgan', category: 'Transportation', name: 'Transportation', amount: money(40_000), frequency: 'monthly', nextDueDate: '2026-08-27' },
		{ id: 'food', userId: 'demo-user-alex-morgan', category: 'Groceries', name: 'Food', amount: money(62_000), frequency: 'monthly', nextDueDate: '2026-08-26' },
		{ id: 'subscriptions', userId: 'demo-user-alex-morgan', category: 'Subscriptions', name: 'Subscriptions', amount: money(19_000), frequency: 'monthly', nextDueDate: '2026-09-05' }
	],
	debts: [
		{
			id: 'demo-card',
			userId: 'demo-user-alex-morgan',
			name: 'Credit card',
			debtType: 'credit_card',
			balance: money(275_000),
			aprBasisPoints: 1999,
			minimumPayment: money(33_000),
			paymentDueDate: '2026-08-29'
		},
		{
			id: 'demo-car',
			userId: 'demo-user-alex-morgan',
			name: 'Car loan',
			debtType: 'auto_loan',
			balance: money(890_000),
			aprBasisPoints: 640,
			minimumPayment: money(37_000),
			paymentDueDate: '2026-09-10'
		}
	],
	goals: [
		{
			id: 'demo-japan-trip',
			userId: 'demo-user-alex-morgan',
			name: 'Japan Trip',
			targetAmount: money(300_000),
			currentAmount: money(115_000),
			targetDate: '2027-05-15',
			priority: 'high',
			monthlyContribution: money(30_000)
		}
	]
};

export const demoLaptopPurchase = {
	name: 'Laptop',
	amount: money(149_900),
	category: 'electronics',
	now: new Date('2026-08-19T12:00:00.000Z')
};
