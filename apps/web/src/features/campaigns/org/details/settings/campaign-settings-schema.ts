import { z } from "zod";
import { feeHandlingEnum } from "../../campaigns-schemas";

export const campaignSettingsSchema = z.object({
  publishCampaign: z.boolean(),
  endDate: z.string().nullable().optional(),
  donateButtonText: z.string().max(50, "Button text must be at most 50 characters").optional(),
  feeHandling: feeHandlingEnum,
  thankYouMessage: z.string().optional(),
});

export type CampaignSettingsFormData = z.infer<typeof campaignSettingsSchema>;
