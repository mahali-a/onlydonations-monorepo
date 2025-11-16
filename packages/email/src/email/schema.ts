import { z } from "zod";

/**
 * Base message structure for email queue
 * Matches the structure defined in @repo/core/queues/types for consistency
 */
export interface BaseEmailQueueMessage {
  messageId: string;
  timestamp: number;
  metadata?: {
    userId?: string;
    orgId?: string;
    requestId?: string;
    source?: string; // 'web' | 'api' | 'cron'
  };
}

/**
 * Email queue message data schema
 * This is validated both at send-time and consume-time
 */
export const emailQueueDataSchema = z.object({
  templateId: z.string(),
  templateData: z.record(z.string(), z.unknown()),
  options: z
    .object({
      priority: z.enum(["low", "normal", "high"]).default("normal"),
      scheduledAt: z.number().optional(), // Unix timestamp for delayed sending
    })
    .optional(),
});

export type EmailQueueData = z.infer<typeof emailQueueDataSchema>;

/**
 * Full email queue message (with base fields)
 */
export interface EmailQueueMessage extends BaseEmailQueueMessage {
  type: "email";
  data: EmailQueueData;
}
