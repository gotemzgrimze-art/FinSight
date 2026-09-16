import { describe, expect, it } from 'vitest';
import { validateAuth } from './validation';

const form = (overrides: Record<string, string> = {}) => {
	const data = new FormData();
	for (const [key, value] of Object.entries({ email: ' Person@Example.com ', username: ' Mixed_Name ', password: ' password ', confirmPassword: ' password ', terms: 'on', privacy: 'on', ...overrides })) data.set(key, value);
	return data;
};

describe('account validation', () => {
	it('normalizes identifiers but preserves password whitespace', () => {
		expect(validateAuth('signup', form())).toEqual({ email: 'person@example.com', username: 'mixed_name', password: ' password ', errors: {} });
	});
	it('rejects a short password, mismatched confirmation and missing acceptance together', () => {
		const result = validateAuth('signup', form({ password: '1234567', confirmPassword: '12345678', terms: '' }));
		expect(Object.keys(result.errors).sort()).toEqual(['confirmPassword', 'password', 'terms']);
	});
	it.each(['aa', 'a'.repeat(31), 'two words', '<script>', 'person@example.com'])('rejects invalid username %s', (username) => {
		expect(validateAuth('signup', form({ username })).errors.username).toBeDefined();
	});
	it.each(['', 'missing-domain@', 'a b@example.com', 'example.com'])('rejects invalid email %s', (email) => {
		expect(validateAuth('login', form({ email })).errors.email).toBeDefined();
	});
	it('accepts an eight-character password and never requires signup fields at login', () => {
		expect(validateAuth('signup', form({ password: '12345678', confirmPassword: '12345678' })).errors).toEqual({});
		expect(validateAuth('login', form({ password: 'short', username: '', terms: '' })).errors).toEqual({});
	});
	it('does not trim confirmation and applies password rules to reset', () => {
		expect(validateAuth('reset-password', form({ confirmPassword: 'password' })).errors.confirmPassword).toBeDefined();
		expect(validateAuth('reset-password', form({ password: 'short', confirmPassword: 'short' })).errors.password).toBeDefined();
	});
});
