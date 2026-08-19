import { demoFinancialModel } from '$lib/demoMode';
import type { FinancialAccount, Transaction } from '$lib/financial-domain';

export type LinkSession = {
	provider: string;
	linkToken: string;
	expiresAt: string;
	demo: boolean;
};

export interface BankDataProvider {
	createLinkSession(userId: string): Promise<LinkSession>;
	exchangeToken(userId: string, publicToken: string): Promise<{ connectionId: string; demo: boolean }>;
	getAccounts(userId: string, connectionId: string): Promise<FinancialAccount[]>;
	getBalances(userId: string, connectionId: string): Promise<FinancialAccount[]>;
	getTransactions(userId: string, connectionId: string): Promise<Transaction[]>;
	refreshAccounts(userId: string, connectionId: string): Promise<void>;
	revokeConnection(userId: string, connectionId: string): Promise<void>;
}

export class MockBankDataProvider implements BankDataProvider {
	async createLinkSession(userId: string): Promise<LinkSession> {
		return {
			provider: 'mock',
			linkToken: `mock_link_${userId}_${Date.now()}`,
			expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
			demo: true
		};
	}

	async exchangeToken(userId: string): Promise<{ connectionId: string; demo: boolean }> {
		return { connectionId: `mock_connection_${userId}`, demo: true };
	}

	async getAccounts(userId: string, _connectionId: string): Promise<FinancialAccount[]> {
		return demoFinancialModel.accounts.map((account) => ({ ...account, userId, provider: 'mock' }));
	}

	async getBalances(userId: string, _connectionId: string): Promise<FinancialAccount[]> {
		return this.getAccounts(userId, 'mock_connection');
	}

	async getTransactions(userId: string): Promise<Transaction[]> {
		return [
			{
				id: 'mock_txn_1',
				userId,
				financialAccountId: 'demo-checking',
				amount: { amountMinor: -185_000, currency: 'USD' },
				merchant: 'Metro Apartments',
				description: 'Rent payment',
				category: 'Housing',
				transactionDate: '2026-08-01',
				pending: false
			},
			{
				id: 'mock_txn_2',
				userId,
				financialAccountId: 'demo-checking',
				amount: { amountMinor: 520_000, currency: 'USD' },
				merchant: 'Employer Payroll',
				description: 'Payroll deposit',
				category: 'Income',
				transactionDate: '2026-08-15',
				pending: false
			}
		];
	}

	async refreshAccounts(): Promise<void> {
		return;
	}

	async revokeConnection(): Promise<void> {
		return;
	}
}

export const bankProvider = new MockBankDataProvider();
