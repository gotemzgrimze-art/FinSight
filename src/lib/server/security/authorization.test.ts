import { describe, expect, it } from 'vitest';
import { AuthorizationError, assertOwnsUserResource, requireUserId } from '$lib/server/security/authorization';

describe('authorization controls', () => {
	it('requires an authenticated user id', () => {
		expect(requireUserId('user-a')).toBe('user-a');
		expect(() => requireUserId(null)).toThrow(AuthorizationError);
	});

	it('prevents user A from accessing user B resources', () => {
		expect(() => assertOwnsUserResource('user-a', 'user-b')).toThrow(AuthorizationError);
		expect(() => assertOwnsUserResource('user-a', 'user-a')).not.toThrow();
	});
});
