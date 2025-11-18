import { z } from "zod";

const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, "").replace(/\s+/g, " ");
};

const ghanaPhoneRegex = /^(\+233|0)?[235]\d{8}$/;

export const donateSchema = z.object({
  amount: z
    .number()
    .min(1, "Minimum donation is 1.00 GHS")
    .max(1000000, "Maximum donation is 1,000,000 GHS"),
  donorName: z
    .string()
    .min(2, "Name is required")
    .max(100, "Name too long")
    .transform(sanitizeString)
    .refine((val) => val.length >= 2, "Name is required after sanitization"),
  donorEmail: z
    .string()
    .email("Invalid email address")
    .max(254, "Email too long")
    .transform((val) => val.trim().toLowerCase()),
  donorPhone: z
    .string()
    .transform((val) => (val ? val.trim().replace(/\s+/g, "") : ""))
    .refine(
      (val) => !val || ghanaPhoneRegex.test(val),
      "Invalid Ghana phone number format (e.g., 0241234567 or +233241234567)",
    )
    .optional(),
  donorMessage: z
    .string()
    .max(500, "Message too long")
    .transform((val) => (val ? sanitizeString(val) : ""))
    .optional(),
  isAnonymous: z.boolean().default(false),
  coverFees: z.boolean().default(false),
  currency: z.literal("GHS").default("GHS"),
});

export type DonateFormData = z.infer<typeof donateSchema>;

export const donateLoaderSchema = z.object({
  slug: z.string().min(1, "Campaign slug is required"),
});
