import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

type Db = ReturnType<typeof drizzle<typeof schema>>;

let instance: Db | undefined;

export function getDb(): Db {
	if (instance) return instance;
	if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

	const client = new Database(env.DATABASE_URL);
	client.pragma('foreign_keys = ON');
	instance = drizzle(client, { schema });
	return instance;
}
