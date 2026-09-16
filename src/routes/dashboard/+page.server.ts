import { requireUser } from '$lib/server/require-user';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async (event) => { const user = await requireUser(event); return { user: { email: user.email, createdAt: user.created_at } }; };
