import { type BetterAuthOptions, betterAuth } from "better-auth";
import {
  anonymous,
  emailOTP,
  lastLoginMethod,
  organization,
  phoneNumber,
} from "better-auth/plugins";
import { reactStartCookies } from "better-auth/react-start";

/**
 * Email handler callback type for auth-related emails
 */
export type AuthEmailHandler = (
  type: "otp" | "change-email",
  data: Record<string, unknown>,
) => Promise<void>;

/**
 * SMS handler callback type for phone verification
 */
export type AuthSMSHandler = (phoneNumber: string, code: string) => Promise<void>;

/**
 * Configuration for creating Better Auth instance
 */
export interface CreateAuthConfig {
  /** Database adapter (usually Drizzle) */
  database: BetterAuthOptions["database"];
  /** Secret key for session encryption */
  secret?: string;
  /** Social authentication providers (Google, GitHub, etc.) */
  socialProviders?: BetterAuthOptions["socialProviders"];
  /** Handler for sending authentication emails (OTP, email change, etc.) */
  emailHandler?: AuthEmailHandler;
  /** Handler for sending SMS OTP for phone verification */
  smsHandler?: AuthSMSHandler;
}

/**
 * Creates a Better Auth instance with opinionated defaults for the SaaS kit.
 *
 * Features enabled:
 * - Email OTP authentication
 * - Phone number authentication (NOOP - needs implementation)
 * - Anonymous users
 * - Organizations & team management
 * - Email change verification
 * - Last login method tracking
 *
 * @param config - Auth configuration
 * @returns Configured Better Auth instance
 */
export function createBetterAuth(config: CreateAuthConfig): ReturnType<typeof betterAuth> {
  return betterAuth({
    database: config.database,
    secret: config.secret,
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: config.socialProviders,
    user: {
      modelName: "auth_user",
      changeEmail: {
        enabled: true,
        sendChangeEmailVerification: async ({ user, newEmail, url }) => {
          if (config.emailHandler) {
            await config.emailHandler("change-email", {
              email: user.email,
              newEmail,
              url,
              userId: user.id,
            });
          }
        },
      },
    },
    session: {
      modelName: "auth_session",
    },
    verification: {
      modelName: "auth_verification",
    },
    account: {
      modelName: "auth_account",
    },
    plugins: [
      emailOTP({
        overrideDefaultEmailVerification: true,
        otpLength: 6,
        expiresIn: 300,
        async sendVerificationOTP({ email, otp, type }) {
          if (config.emailHandler) {
            await config.emailHandler("otp", {
              email,
              otp,
              type: type as "sign-in" | "email-verification" | "forget-password",
              expiresIn: "5 minutes",
            });
          }
        },
      }),
      phoneNumber({
        sendOTP: async ({ phoneNumber: phone, code }) => {
          if (config.smsHandler) {
            await config.smsHandler(phone, code);
          } else {
            console.log(`[NOOP] Send SMS OTP to ${phone}: ${code}`);
          }
        },
        otpLength: 6,
        expiresIn: 900,
      }),
      anonymous({
        onLinkAccount: async ({ anonymousUser, newUser }) => {
          console.log(
            `[INFO] Linking anonymous user ${anonymousUser.user.id} to ${newUser.user.id}`,
          );
        },
      }),
      organization(),
      lastLoginMethod({
        storeInDatabase: true,
      }),
      reactStartCookies(),
    ],
  });
}
