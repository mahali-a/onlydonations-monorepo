import type { BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { type AuthEmailHandler, createBetterAuth } from "@/auth/setup";
import type { initDatabase } from "@/database/setup";
import {
  auth_account,
  auth_session,
  auth_user,
  auth_verification,
  invitation,
  member,
  organization,
} from "@/drizzle/schema/auth.schema";

/**
 * Configuration for initializing auth with Drizzle adapter
 */
export interface InitAuthConfig {
  /** Drizzle database instance */
  db: Awaited<ReturnType<typeof initDatabase>>;
  /** Database provider type */
  provider: "pg" | "mysql" | "sqlite";
  /** Secret key for session encryption */
  secret: string;
  /** Social authentication providers */
  socialProviders?: BetterAuthOptions["socialProviders"];
  /** Email handler for auth-related emails */
  emailHandler?: AuthEmailHandler;
}

/**
 * Global Better Auth instance
 * Initialized once per application lifecycle
 */
let authInstance: ReturnType<typeof createBetterAuth> | null = null;

/**
 * Initialize Better Auth with Drizzle adapter and auth schema.
 *
 * This should be called once at application startup.
 * Subsequent calls will return the existing instance.
 *
 * @param config - Auth initialization config
 * @returns Better Auth instance
 *
 * @example
 * ```ts
 * const auth = initAuth({
 *   db: initDatabase(env.DB),
 *   provider: "sqlite",
 *   secret: env.BETTER_AUTH_SECRET,
 *   socialProviders: {
 *     google: {
 *       clientId: env.GOOGLE_CLIENT_ID,
 *       clientSecret: env.GOOGLE_CLIENT_SECRET,
 *     },
 *   },
 *   emailHandler: createAuthEmailHandler(emailQueue),
 * });
 * ```
 */
export function initAuth(config: InitAuthConfig) {
  if (!authInstance) {
    authInstance = createBetterAuth({
      database: drizzleAdapter(config.db, {
        provider: config.provider,
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
      secret: config.secret,
      socialProviders: config.socialProviders,
      emailHandler: config.emailHandler,
    });
  }
  return authInstance;
}

/**
 * Get the initialized Better Auth instance.
 *
 * @throws {Error} If auth has not been initialized via `initAuth()`
 * @returns Better Auth instance
 */
export function getAuth() {
  if (!authInstance) {
    throw new Error("Auth not initialized. Call initAuth() first in your application entry point.");
  }
  return authInstance;
}

/**
 * Reset the auth instance (useful for testing)
 * @internal
 */
export function resetAuth() {
  authInstance = null;
}
