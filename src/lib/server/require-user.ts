import { redirect, type RequestEvent } from '@sveltejs/kit';
export async function requireUser(event: RequestEvent) {
	if (!event.locals.supabase) redirect(303, `/login?next=${encodeURIComponent(event.url.pathname)}`);
	const { data, error } = await event.locals.supabase.auth.getUser();
	if (error || !data.user) redirect(303, `/login?next=${encodeURIComponent(event.url.pathname)}`);
	return data.user;
}
