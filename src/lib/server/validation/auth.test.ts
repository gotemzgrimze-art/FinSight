import { describe, expect, it } from 'vitest';
import { signupValidationSchema } from '$lib/server/validation/auth';

describe('signup validation', () => {
	it('requires terms, privacy acknowledgement, and matching strong passwords', () => {
		const result = signupValidationSchema.safeParse({
			firstName: 'Alex',
			lastName: 'Morgan',
			email: 'alex@example.com',
			password: 'short',
			confirmPassword: 'different',
			acceptTerms: false,
			acceptPrivacy: false
		});
		expect(result.success).toBe(false);
	});

	it('accepts a complete signup payload', () => {
		const result = signupValidationSchema.safeParse({
			firstName: 'Alex',
			lastName: 'Morgan',
			email: 'alex@example.com',
			password: 'correct-horse-battery',
			confirmPassword: 'correct-horse-battery',
			acceptTerms: true,
			acceptPrivacy: true
		});
		expect(result.success).toBe(true);
	});
});
