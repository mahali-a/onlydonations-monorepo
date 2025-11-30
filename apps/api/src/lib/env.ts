import { validateEnv } from "@repo/core/env";
import { z } from "zod";

export const apiEnvSchema = z.object({
  EMAIL_FROM: z.email(),
  ENVIRONMENT: z.enum(["development", "staging", "production"]),
  R2_PUBLIC_URL: z.url(),
  WEB_BASE_URL: z.url(),
  PAYSTACK_SECRET_KEY: z.string(),
  OPENAI_API_KEY: z.string(),
  RESEND_API_KEY: z.string(),
  SMILE_API_KEY: z.string().min(1),

  // SMS Provider Configuration
  PILO_SMS_API_KEY: z.string().optional(),
  PILO_SMS_SENDER_ID: z.string().optional(),
  ZEND_API_KEY: z.string().optional(),
  TELNYX_API_KEY: z.string().optional(),
  TELNYX_FROM_NUMBER: z.string().optional(),
  PRELUDE_API_TOKEN: z.string().optional(),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export function validateApiEnv(env: unknown): ApiEnv {
  return validateEnv(apiEnvSchema, env, "api");
}
