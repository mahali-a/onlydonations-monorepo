import { z } from "zod";

export const emailOtpSchema = z
  .object({
    email: z.string().email(),
    otp: z
      .string()
      .min(4, "OTP must be at least 4 characters long")
      .max(10, "OTP must be at most 10 characters long"),
    type: z.enum(["sign-in", "email-verification", "forget-password"]),
    expiresIn: z.string().nullable().optional(),
  })
  .transform((data) => ({
    ...data,
    expiresIn: data.expiresIn ?? "5 minutes",
  }));

export type EmailOtpData = z.infer<typeof emailOtpSchema>;
