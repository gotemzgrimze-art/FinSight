import { fail, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const readCheckbox = (formData: FormData, key: string): boolean => formData.get(key) === 'on';

export const requireAuthenticatedUser = (event: RequestEvent) => {
	if (!event.locals.user) {
		throw redirect(303, '/login');
	}
	return event.locals.user;
};

export const formError = (message: string, status = 400) => fail(status, { error: message });
