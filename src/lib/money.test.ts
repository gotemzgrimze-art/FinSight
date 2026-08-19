import { describe, expect, it } from 'vitest';
import { addMoney, formatMoney, parseMoneyToMinor, subtractMoney } from '$lib/money';

describe('money utilities', () => {
	it('parses dollars into integer minor units without floating point storage', () => {
		expect(parseMoneyToMinor('1,499.99', 'USD')).toEqual({ amountMinor: 149999, currency: 'USD' });
		expect(parseMoneyToMinor('1499.9', 'USD')).toEqual({ amountMinor: 149990, currency: 'USD' });
	});

	it('formats supported currencies using Intl', () => {
		expect(formatMoney({ amountMinor: 149999, currency: 'USD' })).toBe('$1,499.99');
		expect(formatMoney({ amountMinor: 149999, currency: 'EUR' })).toContain('1,499.99');
	});

	it('rejects invalid, negative, and oversized values', () => {
		expect(() => parseMoneyToMinor('-1', 'USD')).toThrow('cannot be negative');
		expect(() => parseMoneyToMinor('10.999', 'USD')).toThrow('valid money');
		expect(() => parseMoneyToMinor('999999999999999999999', 'USD')).toThrow('too large');
	});

	it('prevents arithmetic across different currencies', () => {
		expect(addMoney({ amountMinor: 100, currency: 'USD' }, { amountMinor: 50, currency: 'USD' }).amountMinor).toBe(150);
		expect(subtractMoney({ amountMinor: 100, currency: 'USD' }, { amountMinor: 50, currency: 'USD' }).amountMinor).toBe(50);
		expect(() => addMoney({ amountMinor: 100, currency: 'USD' }, { amountMinor: 100, currency: 'CAD' })).toThrow('different currencies');
	});
});
