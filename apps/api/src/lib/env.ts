import { validateEnv } from "@repo/core/env";
import { z } from "zod";

export const apiEnvSchema = z.object({
  EMAIL_FROM: z.email(),
  ENVIRONMENT: z.enum(["development", "staging", "production"]),
  R2_PUBLIC_URL: z.url(),
  WEB_BASE_URL: z.url(),
  AXIOM_API_TOKEN: z.string().min(1),
  PAYSTACK_SECRET_KEY: z.string(),
  OPENAI_API_KEY: z.string(),
  RESEND_API_KEY: z.string(),
  PILO_SMS_API_KEY: z.string().min(1),
  PILO_SMS_SENDER_ID: z.string().min(1),
  SMILE_API_KEY: z.string().min(1),
  TELNYX_API_KEY: z.string().min(1),
  TELNYX_FROM_NUMBER: z.string().min(1),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export function validateApiEnv(env: unknown): ApiEnv {
  return validateEnv(apiEnvSchema, env, "api");
}
