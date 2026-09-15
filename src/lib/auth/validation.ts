export type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';
export type FieldErrors = Partial<Record<'email' | 'username' | 'password' | 'confirmPassword' | 'terms', string>>;
export type AuthResult = {
	errors?: FieldErrors;
	message?: string;
	success?: boolean;
	values?: { email: string; username: string };
};

export const LOGIN_ERROR = 'Invalid email or password.';
export const SIGNUP_MESSAGE = 'If your details can be used, you will receive an email to confirm your account. If no email arrives, try a different username or sign in to an existing account.';
export const RESET_MESSAGE = 'If an account matches that email, you will receive a password reset link.';
export const TERMS_VERSION = '2026-09-15';

export function validateAuth(mode: AuthMode, data: FormData) {
	const read = (key: string) => typeof data.get(key) === 'string' ? data.get(key) as string : '';
	const email = read('email').trim().toLowerCase();
	const username = read('username').trim().toLowerCase();
	// Password whitespace is intentional: never silently change a user's secret.
	const password = read('password');
	const confirmPassword = read('confirmPassword');
	const errors: FieldErrors = {};
	if (mode !== 'reset-password' && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)) {
		errors.email = 'Enter a valid email address.';
	}
	if (mode === 'signup' && !/^[a-z0-9_]{3,30}$/.test(username)) {
		errors.username = 'Use 3–30 letters, numbers or underscores.';
	}
	if (mode !== 'forgot-password' && !password) errors.password = 'Enter your password.';
	if (mode === 'signup' || mode === 'reset-password') {
		if (password.length < 8) errors.password = 'Use at least 8 characters.';
		if (password !== confirmPassword) errors.confirmPassword = 'Passwords must match.';
	}
	if (mode === 'signup' && read('terms') !== 'on') errors.terms = 'Accept the Terms of Service to continue.';
	return { email, username, password, errors };
}
