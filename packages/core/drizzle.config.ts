// packages/data-ops/drizzle.config.ts
import { invariant } from "@epic-web/invariant";
import type { Config } from "drizzle-kit";

invariant(process.env.DATABASE_URL, "DATABASE_URL must be set");

const config: Config = {
  out: "./src/drizzle",
  schema: ["./src/drizzle/auth-schema.ts", "./src/drizzle/schema/index.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  tablesFilter: ["!auth_*"],
};

export default config satisfies Config;
