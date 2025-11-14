import { invariant } from "@epic-web/invariant";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createBetterAuth } from "../src/auth/setup";
import { initDatabase } from "../src/database/setup";

invariant(process.env.DATABASE_URL, "DATABASE_URL must be set");
const db = await initDatabase(process.env.DATABASE_URL);

export const auth = createBetterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
});
