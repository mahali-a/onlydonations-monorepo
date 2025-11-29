import { validateEnv } from "@repo/core/env";
import { z } from "zod";

export const webEnvSchema = z.object({
  API_BASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().startsWith("re_"),
  EMAIL_FROM: z.email(),
  ENVIRONMENT: z.enum(["development", "staging", "production"]),
  R2_PUBLIC_URL: z.url(),
  SMILE_PARTNER_ID: z.string().min(1),
  SMILE_API_KEY: z.string().min(1),
  SMILE_ENVIRONMENT: z.string().min(1),
  SMILE_CALLBACK_URL: z.url(),
  PAYSTACK_SECRET_KEY: z.string().startsWith("sk_"),
  PAYSTACK_PUBLIC_KEY: z.string().startsWith("pk_"),
  CMS_API_URL: z.url(),
  HONEYPOT_SECRET: z.string().min(16),
  BASE_URL: z.url(),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

export function validateWebEnv(env: unknown): WebEnv {
  return validateEnv(webEnvSchema, env, "web");
}
