import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createBetterAuth } from "@/auth/setup";
import type { initDatabase } from "@/database/setup";
import {
  auth_account,
  auth_session,
  auth_user,
  auth_verification,
  invitation,
  member,
  organization,
} from "@/drizzle/auth-schema";

let betterAuth: ReturnType<typeof createBetterAuth>;

export function setAuth(
  config: Omit<Parameters<typeof createBetterAuth>[0], "database"> & {
    adapter: {
      drizzleDb: Awaited<ReturnType<typeof initDatabase>>;
      provider: Parameters<typeof drizzleAdapter>[1]["provider"];
    };
  },
) {
  if (!betterAuth) {
    betterAuth = createBetterAuth({
      database: drizzleAdapter(config.adapter.drizzleDb, {
        provider: config.adapter.provider,
        schema: {
          auth_user,
          auth_account,
          auth_session,
          auth_verification,
          organization,
          member,
          invitation,
        },
      }),
      ...config,
    });
  }
  return betterAuth;
}

export function getAuth() {
  if (!betterAuth) {
    throw new Error("Auth not initialized");
  }
  return betterAuth;
}
