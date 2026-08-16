import { existsSync } from 'node:fs';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

if (existsSync('.env')) process.loadEnvFile('.env');

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

migrate(drizzle(new Database(process.env.DATABASE_URL)), { migrationsFolder: 'drizzle' });
