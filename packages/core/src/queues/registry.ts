import type { QueueMessage } from "./types";

/**
 * Centralized queue type definitions
 * This is the SINGLE source of truth for all queue types
 */
export const QUEUE_TYPES = {
  EMAIL: "email",
  MODERATION: "moderation",
  WEBHOOK: "webhook",
  SMS: "sms",
} as const;

export type QueueType = (typeof QUEUE_TYPES)[keyof typeof QUEUE_TYPES];

/**
 * Generic queue binding interface
 * Apps should extend this with their specific queue message types
 *
 * @example
 * ```ts
 * // In your app:
 * import type { EmailQueueData } from "@repo/email/email/schema";
 *
 * interface AppQueueBindings extends QueueBindings {
 *   EMAIL_QUEUE: Queue<QueueMessage<"email", EmailQueueData>>;
 * }
 * ```
 */
export interface QueueBindings {
  APP_QUEUE: Queue<QueueMessage>;
}
