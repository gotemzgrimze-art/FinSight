import { describe, expect, it } from 'vitest';
import { demoFinancialModel, demoLaptopPurchase } from '$lib/demoMode';
import { forecastCashFlow, emergencyRunwayMonths, monthlyDiscretionaryIncome } from '$lib/finance/cashFlow';
import { evaluatePurchaseImpact } from '$lib/finance/purchaseEngine';

describe('cash-flow and purchase impact engine', () => {
	it('calculates discretionary income in minor units', () => {
		expect(monthlyDiscretionaryIncome(demoFinancialModel).amountMinor).toBe(120000);
	});

	it('creates 30, 60, and 90 day forecasts', () => {
		const forecast = forecastCashFlow(demoFinancialModel, demoLaptopPurchase.amount);
		expect(forecast.map((item) => item.days)).toEqual([30, 60, 90]);
		expect(forecast[0].afterPurchaseBalance.amountMinor).toBeGreaterThan(0);
	});

	it('handles zero obligations without claiming infinite runway', () => {
		expect(emergencyRunwayMonths({ amountMinor: 10_000, currency: 'USD' }, { amountMinor: 0, currency: 'USD' })).toBe(0);
	});

	it('returns deterministic impact level and reason codes for the investor demo purchase', () => {
		const result = evaluatePurchaseImpact(demoFinancialModel, demoLaptopPurchase);
		expect(result.engineVersion).toBe('2026.08.19-v2');
		expect(result.impactLevel).toBe('MODERATE_IMPACT');
		expect(result.reasonCodes).toContain('HIGH_INTEREST_DEBT');
		expect(result.auditPayload.result.impactLevel).toBe(result.impactLevel);
	});

	it('flags purchases larger than available cash as very high impact', () => {
		const result = evaluatePurchaseImpact(demoFinancialModel, {
			...demoLaptopPurchase,
			amount: { amountMinor: 2_000_000, currency: 'USD' }
		});
		expect(result.impactLevel).toBe('VERY_HIGH_IMPACT');
		expect(result.reasonCodes).toContain('NEGATIVE_CASH_AFTER_PURCHASE');
	});

	it('handles negative cash flow without dividing by zero recovery assumptions', () => {
		const result = evaluatePurchaseImpact(
			{
				...demoFinancialModel,
				incomeSources: [],
				expenses: [
					{
						id: 'expensive',
						userId: 'u1',
						category: 'Housing',
						name: 'Housing',
						amount: { amountMinor: 500_000, currency: 'USD' },
						frequency: 'monthly'
					}
				]
			},
			demoLaptopPurchase
		);
		expect(result.metrics.estimatedRecoveryDays).toBeNull();
		expect(result.reasonCodes).toContain('HIGH_PERCENT_DISCRETIONARY');
	});
});
