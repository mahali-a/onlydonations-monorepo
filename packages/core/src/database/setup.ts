import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "@/drizzle/auth-schema";
import * as schema from "@/drizzle/schema";

export type Database = ReturnType<typeof drizzle<typeof authSchema & typeof schema>>;
export type DatabaseTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

let db: Database | undefined;

export async function initDatabase(connectionString: string): Promise<Database> {
  if (!db) {
    const client = neon(connectionString);
    db = drizzle(client, { schema: { ...authSchema, ...schema } });
  }
  return db;
}

export function getDb(): Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}
