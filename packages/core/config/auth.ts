import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { createBetterAuth } from "../src/auth/setup";
import * as schema from "../src/drizzle/schema";
import * as authSchema from "../src/drizzle/schema/auth.schema";

/**
 * Find local D1 database for Better Auth schema generation
 */
function getLocalDb() {
  const basePath = "../../apps/web/.wrangler/state/v3/d1/miniflare-D1DatabaseObject";

  try {
    const entries = readdirSync(basePath);
    const sqliteFile = entries.find((entry) => {
      const fullPath = join(basePath, entry);
      return statSync(fullPath).isFile() && entry.endsWith(".sqlite");
    });

    if (sqliteFile) {
      const dbPath = join(basePath, sqliteFile);
      const sqlite = new Database(dbPath);
      return drizzle(sqlite, { schema: { ...authSchema, ...schema } });
    }
  } catch (_error) {
    console.warn("Local D1 not found, using in-memory database for schema generation");
  }

  // Fallback to in-memory database for schema generation
  const sqlite = new Database(":memory:");
  return drizzle(sqlite, { schema: { ...authSchema, ...schema } });
}

const db = getLocalDb();

export const auth = createBetterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailQueue: null as never,
});
