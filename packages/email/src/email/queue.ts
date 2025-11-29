import { nanoid } from "nanoid";
import type { EmailQueueMessage } from "./schema";
import type { EmailTemplateData, EmailTemplateType } from "./types";

/**
 * Type-safe email queue producer
 * This is the ONLY way to send emails via queue
 */
export class EmailQueueProducer {
  constructor(
    private queue: Queue<EmailQueueMessage>,
    private options?: {
      defaultSource?: string;
    },
  ) {}

  /**
   * Queue an email for asynchronous delivery
   */
  async send<T extends EmailTemplateType>(
    templateId: T,
    templateData: EmailTemplateData<T>,
    options?: {
      userId?: string;
      orgId?: string;
      requestId?: string;
      delaySeconds?: number;
      priority?: "low" | "normal" | "high";
    },
  ): Promise<{ messageId: string }> {
    const messageId = nanoid();

    const message: EmailQueueMessage = {
      type: "email",
      messageId,
      timestamp: Date.now(),
      metadata: {
        userId: options?.userId,
        orgId: options?.orgId,
        requestId: options?.requestId,
        source: this.options?.defaultSource || "web",
      },
      data: {
        templateId,
        templateData: templateData as Record<string, unknown>,
        options: {
          priority: options?.priority || "normal",
        },
      },
    };

    await this.queue.send(message, {
      contentType: "json",
      delaySeconds: options?.delaySeconds,
    });

    return { messageId };
  }

  /**
   * Send multiple emails in a batch
   */
  async sendBatch<T extends EmailTemplateType>(
    emails: Array<{
      templateId: T;
      templateData: EmailTemplateData<T>;
      metadata?: EmailQueueMessage["metadata"];
    }>,
    options?: {
      delaySeconds?: number;
    },
  ): Promise<{ messageIds: string[] }> {
    const messages = emails.map((email) => ({
      body: {
        type: "email" as const,
        messageId: nanoid(),
        timestamp: Date.now(),
        metadata: email.metadata,
        data: {
          templateId: email.templateId,
          templateData: email.templateData as Record<string, unknown>,
        },
      } satisfies EmailQueueMessage,
      contentType: "json" as const,
      delaySeconds: options?.delaySeconds,
    }));

    await this.queue.sendBatch(messages);

    return { messageIds: messages.map((m) => m.body.messageId) };
  }
}

/**
 * Factory function for creating email queue producer
 */
export function createEmailQueue(
  queue: Queue<EmailQueueMessage>,
  options?: { defaultSource?: string },
): EmailQueueProducer {
  return new EmailQueueProducer(queue, options);
}
