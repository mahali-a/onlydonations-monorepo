import type { EmailQueueMessage } from "@repo/email/email/schema";
import { emailQueueDataSchema } from "@repo/email/email/schema";
import { emailConsumer } from "./consumers/email.consumer";

/**
 * Consumer registry - SINGLE source of truth for all queue consumers
 *
 * To add a new consumer:
 * 1. Create schema in the appropriate package (e.g., packages/email/src/email/schema.ts for email)
 * 2. Create consumer in apps/api/src/queues/consumers/
 * 3. Register here
 */
const CONSUMER_REGISTRY = {
  email: {
    name: "email",
    schema: emailQueueDataSchema,
    handler: emailConsumer,
    options: {
      maxRetries: 3,
      retryBackoff: (attempt: number) => 5 ** attempt * 60,
    },
  },

  // Future consumers:
  // webhook: { ... },
} as const;

/**
 * Generic queue handler that routes to appropriate consumer based on message type
 */
export async function handleQueueMessage(
  message: Message<EmailQueueMessage>,
  env: Record<string, unknown>,
  ctx: ExecutionContext,
): Promise<void> {
  // Type discrimination - route based on message.body.type
  const messageType = message.body.type;

  if (messageType !== "email") {
    console.error(`[QueueHandler] Unknown message type: ${messageType}`);
    message.ack(); // Remove unknown message types
    return;
  }

  const consumer = CONSUMER_REGISTRY[messageType];

  try {
    const result = await consumer.handler(message, env, ctx);

    switch (result.status) {
      case "success":
        message.ack();
        console.log(`[QueueHandler] Message processed successfully`, {
          type: messageType,
          messageId: message.body.messageId,
          duration: result.duration,
        });
        break;

      case "retry":
        message.retry({ delaySeconds: result.delaySeconds });
        console.log(`[QueueHandler] Message scheduled for retry`, {
          type: messageType,
          messageId: message.body.messageId,
          delaySeconds: result.delaySeconds,
          reason: result.reason,
        });
        break;

      case "failed":
        message.ack(); // Remove from queue
        console.error(`[QueueHandler] Message processing failed`, {
          type: messageType,
          messageId: message.body.messageId,
          fatal: result.fatal,
          reason: result.reason,
        });

        // TODO: Send to dead letter queue or alert
        if (result.fatal) {
          // ctx.waitUntil(sendToDLQ(message));
        }
        break;
    }
  } catch (error) {
    console.error(`[QueueHandler] Unexpected error in consumer`, {
      type: messageType,
      error: error instanceof Error ? error.message : String(error),
    });

    // Retry with exponential backoff
    if (message.attempts < (consumer.options?.maxRetries || 3)) {
      const delaySeconds = consumer.options?.retryBackoff?.(message.attempts) || 60;
      message.retry({ delaySeconds });
    } else {
      message.ack();
    }
  }
}
