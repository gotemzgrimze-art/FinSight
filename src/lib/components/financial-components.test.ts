/* @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/svelte';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AllowanceTracker from '$lib/components/AllowanceTracker.svelte';
import Dashboard from '$lib/components/Dashboard.svelte';
import DebtTracker from '$lib/components/DebtTracker.svelte';
import type { FinancialProfile } from '$lib/models';

const incompleteProfile: FinancialProfile = {
	creditScore: '',
	annualSalary: '',
	bankBalance: '',
	monthlyExpenses: '',
	workHoursPerMonth: '',
	investmentReturnRate: '',
	goals: [],
	debts: [],
	allowances: []
};

describe('financial display components', () => {
	afterEach(() => {
		cleanup();
	});

	it('shows profile completeness warning when required profile data is missing', () => {
		render(Dashboard, { props: { profile: incompleteProfile } });

		expect(screen.getAllByText('Needs income').length).toBeGreaterThan(0);
		expect(screen.getByRole('status')).toHaveTextContent('Needs income');
	});

	it('shows remaining allowance and usage percentage', () => {
		render(AllowanceTracker, {
			props: {
				allowances: [
					{
						id: 'allowance-food',
						name: 'Food',
						limit: '400',
						spent: '125',
						period: 'monthly'
					}
				],
				onAllowanceChange: vi.fn(),
				onAddAllowance: vi.fn(),
				onRemoveAllowance: vi.fn()
			}
		});

		expect(screen.getByText(/\$275 remaining this month/)).toBeInTheDocument();
		expect(screen.getByText(/31% used/)).toBeInTheDocument();
	});

	it('shows debt payoff estimate', () => {
		render(DebtTracker, {
			props: {
				debts: [
					{
						id: 'debt-card',
						name: 'Card',
						balance: '1200',
						minimumPayment: '100',
						annualInterestRate: '0'
					}
				],
				onDebtChange: vi.fn(),
				onAddDebt: vi.fn(),
				onRemoveDebt: vi.fn()
			}
		});

		expect(screen.getByText('12 mo')).toBeInTheDocument();
	});
});
