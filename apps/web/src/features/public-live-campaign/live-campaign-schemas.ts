import { z } from "zod";

export const liveCampaignParamsSchema = z.object({
  slug: z.string().min(1),
});

export type LiveCampaignParams = z.infer<typeof liveCampaignParamsSchema>;
