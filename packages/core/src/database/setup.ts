import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/drizzle/schema";
import * as authSchema from "@/drizzle/schema/auth.schema";

const allSchema = { ...authSchema, ...schema };

export type Database = ReturnType<typeof drizzle<typeof allSchema>>;
export type DatabaseType = Database;
export type DatabaseTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

let dbInstance: Database | undefined;

/**
 * Initialize the database with a D1 instance
 * This should be called once per worker instance from the server entry point
 *
 * @param d1 - Cloudflare D1 database instance from env.DB
 * @returns The initialized Drizzle database instance
 */
export function initDatabase(d1: D1Database): Database {
  if (!dbInstance) {
    dbInstance = drizzle(d1, { schema: allSchema });
  }
  return dbInstance;
}

/**
 * Get the initialized database instance
 * Throws an error if database hasn't been initialized
 *
 * @returns The Drizzle database instance
 */
export function getDb(): Database {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return dbInstance;
}
