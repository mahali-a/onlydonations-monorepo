import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be 50 characters or less"),
  subscribeToUpdates: z.boolean().default(false),
});

export const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .refine((val) => isValidPhoneNumber(val), {
      message: "Please enter a valid phone number",
    }),
});

export const verifySchema = z.object({
  code: z.string().min(6, "Verification code must be 6 digits").max(6),
});

export const organizationSchema = z.object({
  organizationName: z
    .string()
    .min(1, "Organization name is required")
    .max(100, "Organization name must be 100 characters or less"),
});
