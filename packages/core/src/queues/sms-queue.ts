import { nanoid } from "nanoid";
import type { SMSQueueData, SMSQueueMessage } from "./sms-schema";

/**
 * Type-safe SMS queue producer
 */
export class SMSQueueProducer {
  constructor(
    private queue: Queue<SMSQueueMessage>,
    private options?: {
      defaultSource?: string;
    },
  ) {}

  /**
   * Queue an SMS for delivery
   */
  async send(
    data: SMSQueueData,
    options?: {
      userId?: string;
      requestId?: string;
      delaySeconds?: number;
    },
  ): Promise<{ messageId: string }> {
    const messageId = nanoid();

    const message: SMSQueueMessage = {
      type: "sms",
      messageId,
      timestamp: Date.now(),
      metadata: {
        userId: options?.userId,
        requestId: options?.requestId,
        source: this.options?.defaultSource || "web",
      },
      data,
    };

    await this.queue.send(message, {
      contentType: "json",
      delaySeconds: options?.delaySeconds,
    });

    return { messageId };
  }
}

/**
 * Factory function for creating SMS queue producer
 */
export function createSMSQueue(
  queue: Queue<SMSQueueMessage>,
  options?: { defaultSource?: string },
): SMSQueueProducer {
  return new SMSQueueProducer(queue, options);
}
