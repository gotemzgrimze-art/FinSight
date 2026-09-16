import { authAction } from '$lib/server/auth-actions';
import type { Actions } from './$types';

export const actions: Actions = { default: authAction('forgot-password') };
