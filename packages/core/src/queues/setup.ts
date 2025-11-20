import type { ModerationQueueProducer } from "./moderation-queue";

let moderationQueueInstance: ModerationQueueProducer | null = null;

/**
 * Initialize the moderation queue with a queue instance
 * This should be called once per worker instance from the server entry point
 *
 * @param queue - The moderation queue producer instance
 * @returns The initialized moderation queue instance
 */
export function initModerationQueue(queue: ModerationQueueProducer): ModerationQueueProducer {
  if (!moderationQueueInstance) {
    moderationQueueInstance = queue;
  }
  return moderationQueueInstance;
}

/**
 * Get the initialized moderation queue instance
 * Throws an error if queue hasn't been initialized
 *
 * @returns The moderation queue producer instance
 */
export function getModerationQueue(): ModerationQueueProducer {
  if (!moderationQueueInstance) {
    throw new Error("Moderation queue not initialized. Call initModerationQueue() first.");
  }
  return moderationQueueInstance;
}
