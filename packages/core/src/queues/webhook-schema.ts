import { z } from "zod";
import type { BaseQueueMessage } from "./types";

/**
 * Supported webhook processors
 */
export const webhookProcessors = ["paystack", "smile"] as const;
export type WebhookProcessor = (typeof webhookProcessors)[number];

/**
 * Webhook queue data schema
 * Contains reference to stored webhook event for processing
 */
export const webhookQueueDataSchema = z.object({
  webhookEventId: z.string(),
  processor: z.enum(webhookProcessors),
  eventType: z.string(),
  processorEventId: z.string(),
});

export type WebhookQueueData = z.infer<typeof webhookQueueDataSchema>;

export interface WebhookQueueMessage extends BaseQueueMessage {
  type: "webhook";
  data: WebhookQueueData;
}
