import { describe, expect, it } from 'vitest';
import {
	calculateAffordabilityVerdict,
	calculateDebtPayoffMonths,
	calculateDebtRatio,
	calculateFutureValue,
	calculateMonthlyIncome,
	calculateMonthlyLeftover,
	calculatePurchaseWorkHours,
	calculateRunwayMonths,
	calculateSafeDailySpend,
	parseMoney
} from '$lib/calculations';
import { demoProfile, productOptions } from '$lib/mockData';
import type { Debt, FinancialProfile, PurchaseInput } from '$lib/models';

const debts: Debt[] = [
	{
		id: 'debt-1',
		name: 'Card',
		balance: '1200',
		minimumPayment: '100',
		annualInterestRate: '0'
	},
	{
		id: 'debt-2',
		name: 'Loan',
		balance: '3000',
		minimumPayment: '200',
		annualInterestRate: '6'
	}
];

describe('calculations', () => {
	it('calculates monthly income', () => {
		expect(calculateMonthlyIncome('60000')).toBe(5000);
	});

	it('calculates monthly leftover after expenses and debt payments', () => {
		expect(calculateMonthlyLeftover('60000', '2500', debts)).toBe(2200);
	});

	it('calculates debt ratio from monthly debt payments', () => {
		expect(calculateDebtRatio('60000', debts)).toBe(6);
	});

	it('calculates runway months using expenses plus debt payments', () => {
		expect(calculateRunwayMonths('6000', '2700', debts)).toBe(2);
	});

	it('calculates purchase work hours', () => {
		expect(calculatePurchaseWorkHours('1000', '60000', '200')).toBe(40);
	});

	it('calculates future value with compound growth', () => {
		expect(calculateFutureValue(1000, 0.1, 2)).toBeCloseTo(1210);
	});

	it('calculates an affordability verdict', () => {
		const purchase: PurchaseInput = {
			name: 'Laptop',
			cost: '900',
			category: 'electronics'
		};
		const assessment = calculateAffordabilityVerdict(
			demoProfile,
			purchase,
			productOptions.find((option) => option.id === 'electronics') ?? productOptions[0]
		);

		expect(assessment.verdict).toMatch(/Buy|Wait|Do not/);
		expect(assessment.alternatives).toHaveLength(4);
		expect(assessment.futureValue).toMatch(/^\$/);
	});

	it('calculates safe daily spend', () => {
		const profile: FinancialProfile = {
			...demoProfile,
			annualSalary: '60000',
			monthlyExpenses: '2500',
			debts,
			goals: [
				{
					id: 'goal-1',
					name: 'Emergency',
					targetAmount: '5000',
					currentAmount: '1000',
					monthlyContribution: '500'
				}
			]
		};

		expect(calculateSafeDailySpend(profile.annualSalary, profile.monthlyExpenses, profile.debts, profile.goals, 30)).toBeCloseTo(56.666);
	});

	it('calculates debt payoff months', () => {
		expect(calculateDebtPayoffMonths(debts[0])).toBe(12);
	});

	it('rejects invalid money input', () => {
		expect(() => parseMoney('abc')).toThrow('valid money');
		expect(() => parseMoney('-1')).toThrow('cannot be negative');
		expect(() => parseMoney('')).toThrow('required');
	});
});
