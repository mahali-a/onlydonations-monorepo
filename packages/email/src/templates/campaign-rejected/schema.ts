import { z } from "zod";

export const campaignRejectedSchema = z.object({
  email: z.string(),
  campaignTitle: z.string(),
  reason: z.string(),
  recipientName: z.string(),
  dashboardUrl: z.string(),
});

export type CampaignRejectedData = z.infer<typeof campaignRejectedSchema>;
