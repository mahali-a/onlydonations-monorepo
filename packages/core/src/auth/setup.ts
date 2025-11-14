import { sendEmail } from "@repo/email/email/setup";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import {
  anonymous,
  emailOTP,
  lastLoginMethod,
  organization,
  phoneNumber,
} from "better-auth/plugins";
import { reactStartCookies } from "better-auth/react-start";

export const createBetterAuth = (config: {
  database: BetterAuthOptions["database"];
  secret?: BetterAuthOptions["secret"];
  socialProviders?: BetterAuthOptions["socialProviders"];
}): ReturnType<typeof betterAuth> => {
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
          await sendEmail("change-email", {
            email: user.email,
            newEmail,
            url,
          });
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
          console.log("otp", otp);

          await sendEmail("email-otp", {
            email,
            otp,
            type: type as "sign-in" | "email-verification" | "forget-password",
            expiresIn: "5 minutes",
          });
        },
      }),
      phoneNumber({
        sendOTP: async ({ phoneNumber: phone, code }) => {
          console.log(`[NOOP] Send SMS OTP to ${phone}: ${code}`);
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
};
