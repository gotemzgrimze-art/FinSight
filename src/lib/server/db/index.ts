import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$lib/server/env';
import * as schema from './schema';

const globalForDb = globalThis as typeof globalThis & {
	finsightSql?: ReturnType<typeof postgres>;
};

export const hasDatabase = Boolean(env.DATABASE_URL);

const sql =
	hasDatabase && env.DATABASE_URL
		? (globalForDb.finsightSql ??= postgres(env.DATABASE_URL, {
				max: 10,
				prepare: false
			}))
		: null;

export const db = sql ? drizzle(sql, { schema }) : null;

export const getDb = () => {
	if (!db) {
		throw new Error('DATABASE_URL is required for persistent FinSight data');
	}
	return db;
};

export type Db = ReturnType<typeof getDb>;
