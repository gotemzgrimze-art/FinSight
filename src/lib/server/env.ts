import { z } from 'zod';

const envSchema = z.object({
	DATABASE_URL: z.string().url().optional(),
	BETTER_AUTH_SECRET: z.string().min(32).optional(),
	BETTER_AUTH_URL: z.string().url().optional(),
	PUBLIC_APP_URL: z.string().url().default('http://localhost:5173'),
	EMAIL_PROVIDER: z.enum(['console', 'external']).default('console'),
	EMAIL_FROM: z.string().email().default('security@finsight.local'),
	ANALYTICS_PROVIDER: z.enum(['console', 'none']).default('console'),
	BANK_PROVIDER: z.enum(['mock', 'external']).default('mock'),
	IDENTITY_PROVIDER: z.enum(['none', 'external']).default('none')
});

export const env = envSchema.parse({
	DATABASE_URL: process.env.DATABASE_URL,
	BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
	BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
	PUBLIC_APP_URL: process.env.PUBLIC_APP_URL,
	EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
	EMAIL_FROM: process.env.EMAIL_FROM,
	ANALYTICS_PROVIDER: process.env.ANALYTICS_PROVIDER,
	BANK_PROVIDER: process.env.BANK_PROVIDER,
	IDENTITY_PROVIDER: process.env.IDENTITY_PROVIDER
});

export const authSecret =
	env.BETTER_AUTH_SECRET ??
	'development-only-finsight-auth-secret-change-before-production';
