import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Config } from "drizzle-kit";

/**
 * Find the local D1 database path from wrangler's state directory
 * This path changes based on the database ID hash
 */
function findLocalD1Database(): string {
  // Look in the web app's wrangler state
  const basePath = "../../apps/web/.wrangler/state/v3/d1/miniflare-D1DatabaseObject";

  try {
    const entries = readdirSync(basePath);
    const sqliteFile = entries.find((entry) => {
      const fullPath = join(basePath, entry);
      const stats = statSync(fullPath);
      return stats.isFile() && entry.endsWith(".sqlite");
    });

    if (sqliteFile) {
      return join(basePath, sqliteFile);
    }
  } catch (_error) {
    console.warn("Local D1 database not found, using in-memory fallback");
  }

  // Fallback for when D1 hasn't been initialized yet
  return ":memory:";
}

const config: Config = {
  // Output migrations to web app's migrations directory
  out: "../../apps/web/migrations",

  schema: ["./src/drizzle/auth-schema.ts", "./src/drizzle/schema/index.ts"],
  dialect: "sqlite",

  dbCredentials: {
    url: findLocalD1Database(),
  },

  tablesFilter: ["!auth_*"],
};

export default config satisfies Config;
