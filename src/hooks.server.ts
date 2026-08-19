import { building } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { auth } from '$lib/server/auth';

const protectedPrefixes = ['/dashboard', '/onboarding', '/settings', '/cash-flow', '/transactions', '/debts', '/goals', '/purchase-check'];
const verificationRequiredPrefixes = ['/dashboard', '/cash-flow', '/transactions', '/debts', '/goals', '/purchase-check'];

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	event.locals.session = session?.session ?? null;
	event.locals.user = session?.user ?? null;

	const pathname = event.url.pathname;
	const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
	const needsVerifiedEmail = verificationRequiredPrefixes.some((prefix) => pathname.startsWith(prefix));

	if (isProtected && !event.locals.user) {
		throw redirect(303, `/login?redirectTo=${encodeURIComponent(pathname)}`);
	}

	if (needsVerifiedEmail && event.locals.user && !event.locals.user.emailVerified) {
		throw redirect(303, '/verify-email');
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
