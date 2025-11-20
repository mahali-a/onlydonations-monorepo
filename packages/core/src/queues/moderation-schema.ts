import { z } from "zod";
import type { BaseQueueMessage } from "./types";

export const moderationQueueDataSchema = z.object({
  contentType: z.enum(["campaign", "campaign-update"]),
  campaignId: z.string(),
  organizationId: z.string(),
});

export type ModerationQueueData = z.infer<typeof moderationQueueDataSchema>;

export interface ModerationQueueMessage extends BaseQueueMessage {
  type: "moderation";
  data: ModerationQueueData;
}
