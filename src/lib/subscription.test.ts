import { describe, expect, it } from 'vitest';
import { canRunPurchaseCheck, currentResetMonth, normalizeSubscriptionState } from '$lib/subscription';

describe('subscription', () => {
	it('resets free purchase checks when stored month is stale', () => {
		const normalized = normalizeSubscriptionState({
			tier: 'free',
			purchaseChecksUsedThisMonth: 5,
			lastResetMonth: '2000-01',
			isStudentVerified: false
		});

		expect(normalized.purchaseChecksUsedThisMonth).toBe(0);
		expect(normalized.lastResetMonth).toBe(currentResetMonth());
		expect(canRunPurchaseCheck(normalized)).toBe(true);
	});

	it('blocks free purchase checks at the monthly limit', () => {
		expect(
			canRunPurchaseCheck({
				tier: 'free',
				purchaseChecksUsedThisMonth: 5,
				lastResetMonth: currentResetMonth(),
				isStudentVerified: false
			})
		).toBe(false);
	});

	it('allows premium and student purchase checks past the free limit', () => {
		expect(
			canRunPurchaseCheck({
				tier: 'premium',
				purchaseChecksUsedThisMonth: 50,
				lastResetMonth: currentResetMonth(),
				isStudentVerified: false
			})
		).toBe(true);
		expect(
			canRunPurchaseCheck({
				tier: 'student',
				purchaseChecksUsedThisMonth: 50,
				lastResetMonth: currentResetMonth(),
				isStudentVerified: true
			})
		).toBe(true);
	});
});
