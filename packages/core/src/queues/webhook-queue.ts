import { nanoid } from "nanoid";
import type { WebhookQueueData, WebhookQueueMessage } from "./webhook-schema";

/**
 * Type-safe webhook queue producer
 * Used to queue webhook events for async processing
 */
export class WebhookQueueProducer {
  constructor(
    private queue: Queue<WebhookQueueMessage>,
    private options?: {
      defaultSource?: string;
    },
  ) {}

  /**
   * Queue a webhook event for asynchronous processing
   * Call this after storing the event in the database
   */
  async send(
    data: WebhookQueueData,
    options?: {
      requestId?: string;
      delaySeconds?: number;
    },
  ): Promise<{ messageId: string }> {
    const messageId = nanoid();

    const message: WebhookQueueMessage = {
      type: "webhook",
      messageId,
      timestamp: Date.now(),
      metadata: {
        requestId: options?.requestId,
        source: this.options?.defaultSource || "api",
      },
      data,
    };

    await this.queue.send(message, {
      contentType: "json",
      delaySeconds: options?.delaySeconds,
    });

    return { messageId };
  }

  /**
   * Queue multiple webhook events in a batch
   */
  async sendBatch(
    events: Array<{
      data: WebhookQueueData;
      metadata?: WebhookQueueMessage["metadata"];
    }>,
    options?: {
      delaySeconds?: number;
    },
  ): Promise<{ messageIds: string[] }> {
    const messages = events.map((event) => ({
      body: {
        type: "webhook" as const,
        messageId: nanoid(),
        timestamp: Date.now(),
        metadata: event.metadata,
        data: event.data,
      } satisfies WebhookQueueMessage,
      contentType: "json" as const,
      delaySeconds: options?.delaySeconds,
    }));

    await this.queue.sendBatch(messages);

    return { messageIds: messages.map((m) => m.body.messageId) };
  }
}

/**
 * Factory function for creating webhook queue producer
 */
export function createWebhookQueue(
  queue: Queue<WebhookQueueMessage>,
  options?: { defaultSource?: string },
): WebhookQueueProducer {
  return new WebhookQueueProducer(queue, options);
}
