export class AuthorizationError extends Error {
	constructor(message = 'You are not allowed to access this resource') {
		super(message);
		this.name = 'AuthorizationError';
	}
}

export const requireUserId = (userId: string | undefined | null): string => {
	if (!userId) throw new AuthorizationError('Authentication required');
	return userId;
};

export const assertOwnsUserResource = (sessionUserId: string, resourceUserId: string): void => {
	if (sessionUserId !== resourceUserId) {
		throw new AuthorizationError();
	}
};

export const redactSensitive = (value: Record<string, unknown>): Record<string, unknown> => {
	const redacted = { ...value };
	for (const key of Object.keys(redacted)) {
		if (/password|token|secret|authorization|cookie|amount|balance/i.test(key)) {
			redacted[key] = '[redacted]';
		}
	}
	return redacted;
};
