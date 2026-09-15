import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = null;
	if (env.PUBLIC_SUPABASE_URL && env.PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
		event.locals.supabase = createServerClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookies) => cookies.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/', httpOnly: true, sameSite: 'lax', secure: event.url.protocol === 'https:' });
				})
			}
		});
	}
	const response = await resolve(event);
	// Personalized pages and refreshed session cookies must never enter shared caches.
	response.headers.set('cache-control', 'private, no-store');
	response.headers.set('referrer-policy', 'same-origin');
	return response;
};
