import { z } from "zod";

export const feeHandlingEnum = z.enum([
  "DONOR_ASK_COVER",
  "DONOR_REQUIRE_COVER",
  "CAMPAIGN_ABSORB",
]);

export const campaignSettingsSchema = z.object({
  endDate: z.date().optional().nullable(),
  donateButtonText: z
    .string()
    .max(50, "Button text must be at most 50 characters")
    .optional()
    .nullable(),
  feeHandling: feeHandlingEnum,
  thankYouMessage: z.string().optional().nullable(),
});

export type CampaignSettingsFormData = z.infer<typeof campaignSettingsSchema>;

export const updateCampaignSettingsSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  campaignId: z.string().min(1, "Campaign ID is required"),
  publishCampaign: z.boolean().optional(),
  endDate: z.date().optional().nullable(),
  donateButtonText: z
    .string()
    .max(50, "Button text must be 50 characters or less")
    .optional(),
  feeHandling: feeHandlingEnum,
  thankYouMessage: z.string().optional(),
});
