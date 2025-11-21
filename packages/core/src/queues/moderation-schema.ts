import { z } from "zod";
import type { BaseQueueMessage } from "./types";

export const moderationQueueDataSchema = z.object({
  contentType: z.enum(["campaign", "campaign-update", "donation-message"]),
  campaignId: z.string().optional(),
  donationId: z.string().optional(),
  organizationId: z.string().optional(),
});

export type ModerationQueueData = z.infer<typeof moderationQueueDataSchema>;

export interface ModerationQueueMessage extends BaseQueueMessage {
  type: "moderation";
  data: ModerationQueueData;
}
