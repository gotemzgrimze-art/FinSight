import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
export function getAdminClient() {
	if (!env.SUPABASE_SERVICE_ROLE_KEY || !publicEnv.PUBLIC_SUPABASE_URL) return null;
	return createClient(publicEnv.PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
}
