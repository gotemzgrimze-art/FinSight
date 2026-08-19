import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, twoFactor } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db, hasDatabase } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { authSecret, env } from '$lib/server/env';
import { sendTransactionalEmail } from '$lib/server/email';

const appUrl = env.BETTER_AUTH_URL ?? env.PUBLIC_APP_URL;

export const auth = betterAuth({
	appName: 'FinSight',
	baseURL: appUrl,
	secret: authSecret,
	database: hasDatabase && db ? drizzleAdapter(db, { provider: 'pg', schema }) : undefined,
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 12,
		maxPasswordLength: 128,
		requireEmailVerification: true,
		autoSignIn: false,
		sendResetPassword: async ({ user, url }) => {
			await sendTransactionalEmail({
				to: user.email,
				subject: 'Reset your FinSight password',
				text: `Use this link to reset your FinSight password: ${url}`
			});
		}
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sendTransactionalEmail({
				to: user.email,
				subject: 'Verify your FinSight email',
				text: `Use this link to verify your FinSight email: ${url}`
			});
		}
	},
	session: {
		expiresIn: 60 * 60 * 24 * 14,
		updateAge: 60 * 60 * 24
	},
	advanced: {
		cookiePrefix: 'finsight',
		useSecureCookies: appUrl.startsWith('https://'),
		defaultCookieAttributes: {
			sameSite: 'lax',
			httpOnly: true,
			secure: appUrl.startsWith('https://')
		}
	},
	plugins: [
		admin({
			defaultRole: 'user',
			adminRoles: ['admin']
		}),
		twoFactor(),
		sveltekitCookies(getRequestEvent)
	]
});
