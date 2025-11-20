import { z } from "zod";

export const campaignApprovedSchema = z.object({
  email: z.string(),
  campaignTitle: z.string(),
  campaignUrl: z.string(),
  recipientName: z.string(),
});

export type CampaignApprovedData = z.infer<typeof campaignApprovedSchema>;
