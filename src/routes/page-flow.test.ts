/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/svelte';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Page from './+page.svelte';

const openService = async (user: ReturnType<typeof userEvent.setup>, serviceName: string) => {
	await user.click(screen.getByLabelText('Open services menu'));
	await user.click(screen.getByRole('button', { name: serviceName }));
};

const runPurchase = async (user: ReturnType<typeof userEvent.setup>, cost = '900') => {
	await openService(user, 'Purchase Check');
	await user.type(screen.getByLabelText('What does the customer want to buy?'), 'Laptop');
	await user.clear(screen.getByLabelText('How much does it cost?'));
	await user.type(screen.getByLabelText('How much does it cost?'), cost);
	await user.click(screen.getByRole('button', { name: 'Run check' }));
};

describe('FinSight page user flows', () => {
	afterEach(() => {
		cleanup();
	});

	beforeEach(() => {
		localStorage.clear();
		let id = 0;
		if (!globalThis.crypto?.randomUUID) {
			Object.defineProperty(globalThis, 'crypto', {
				value: {
					randomUUID: () => `test-id-${id++}`
				},
				configurable: true
			});
		}
	});

	it('lets a user enter a purchase and see verdict, work hours, goal delay, and disclaimer', async () => {
		const user = userEvent.setup();
		render(Page);

		await runPurchase(user);

		expect((await screen.findAllByText(/Buy is reasonable|Wait or find cheaper|Do not buy yet/)).length).toBeGreaterThan(
			0
		);
		expect(screen.getByText('work cost')).toBeInTheDocument();
		expect(screen.getAllByText(/Emergency fund delayed by|Japan trip delayed by/).length).toBeGreaterThan(0);
		expect(
			screen.getAllByText('FinSight provides educational planning tools, not financial advice.').length
		).toBeGreaterThanOrEqual(3);
	});

	it('limits free users to 5 purchase checks per month', async () => {
		const user = userEvent.setup();
		render(Page);

		await openService(user, 'Purchase Check');
		await user.type(screen.getByLabelText('What does the customer want to buy?'), 'Laptop');
		await user.type(screen.getByLabelText('How much does it cost?'), '900');

		const runButton = screen.getByRole('button', { name: 'Run check' });
		for (let index = 0; index < 5; index += 1) {
			await user.click(runButton);
		}

		await waitFor(() => expect(runButton).toBeDisabled());
		expect(screen.getByText(/Checks used this month: 5 \/ 5/)).toBeInTheDocument();
	});

	it('keeps premium purchase checks available past the free limit', async () => {
		const user = userEvent.setup();
		render(Page);

		await openService(user, 'Local Profile');
		await user.click(screen.getByRole('button', { name: 'Premium' }));
		await openService(user, 'Purchase Check');
		await user.type(screen.getByLabelText('What does the customer want to buy?'), 'Laptop');
		await user.type(screen.getByLabelText('How much does it cost?'), '900');

		const runButton = screen.getByRole('button', { name: 'Run check' });
		for (let index = 0; index < 6; index += 1) {
			await user.click(runButton);
		}

		expect(runButton).toBeEnabled();
		expect((await screen.findAllByText(/Buy is reasonable|Wait or find cheaper|Do not buy yet/)).length).toBeGreaterThan(
			0
		);
	});

	it('prevents free users from exceeding 3 goals', async () => {
		const user = userEvent.setup();
		render(Page);

		await openService(user, 'Local Profile');
		await user.click(screen.getByRole('button', { name: 'Add goal' }));
		await user.click(screen.getByRole('button', { name: 'Add goal' }));

		expect(screen.getAllByLabelText('Goal name')).toHaveLength(3);
		expect(screen.getByText('Free tier allows 3 goals. Switch to premium or student to add more.')).toBeInTheDocument();
	});

	it.each(['Premium', 'Student'])('lets %s users exceed 3 goals', async (tierName) => {
		const user = userEvent.setup();
		render(Page);

		await openService(user, 'Local Profile');
		await user.click(screen.getByRole('button', { name: tierName }));
		await user.click(screen.getByRole('button', { name: 'Add goal' }));
		await user.click(screen.getByRole('button', { name: 'Add goal' }));

		expect(screen.getAllByLabelText('Goal name')).toHaveLength(4);
	});

	it('shows validation error for an invalid purchase price', async () => {
		const user = userEvent.setup();
		render(Page);

		await runPurchase(user, '-100');

		expect(await screen.findByText('purchase price cannot be negative')).toBeInTheDocument();
	});
});
