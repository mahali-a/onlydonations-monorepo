import type { EmailQueueMessage } from "@repo/email/email/schema";
import { emailQueueDataSchema } from "@repo/email/email/schema";
import type { ModerationQueueMessage } from "@repo/core/queues/moderation-schema";
import { moderationQueueDataSchema } from "@repo/core/queues/moderation-schema";
import type { ConsumerResult } from "@repo/core/queues/types";
import { emailConsumer } from "./consumers/email.consumer";
import { moderationConsumer } from "./consumers/moderation.consumer";

type AppQueueMessage = EmailQueueMessage | ModerationQueueMessage;
type MessageType = AppQueueMessage["type"];
type RouteMessage<T extends MessageType> = Extract<AppQueueMessage, { type: T }>;

const CONSUMER_REGISTRY: {
  email: {
    name: string;
    schema: typeof emailQueueDataSchema;
    handler: typeof emailConsumer;
    options: { maxRetries: number; retryBackoff: (attempt: number) => number };
  };
  moderation: {
    name: string;
    schema: typeof moderationQueueDataSchema;
    handler: typeof moderationConsumer;
    options: { maxRetries: number; retryBackoff: (attempt: number) => number };
  };
} = {
  email: {
    name: "email",
    schema: emailQueueDataSchema,
    handler: emailConsumer,
    options: {
      maxRetries: 3,
      retryBackoff: (attempt: number) => 5 ** attempt * 60,
    },
  },
  moderation: {
    name: "moderation",
    schema: moderationQueueDataSchema,
    handler: moderationConsumer,
    options: {
      maxRetries: 3,
      retryBackoff: (attempt: number) => 5 ** attempt * 60,
    },
  },
};

export async function handleQueueMessage(
  message: Message<AppQueueMessage>,
  ctx: ExecutionContext,
): Promise<void> {
  const messageType = message.body.type;

  if (messageType !== "email" && messageType !== "moderation") {
    console.error(`[QueueHandler] Unknown message type: ${messageType}`);
    message.ack();
    return;
  }

  const consumer = CONSUMER_REGISTRY[messageType];

  try {
    const result = await routeMessage(message, messageType, ctx);

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
        message.ack();
        console.error(`[QueueHandler] Message processing failed`, {
          type: messageType,
          messageId: message.body.messageId,
          fatal: result.fatal,
          reason: result.reason,
        });
        break;
    }
  } catch (error) {
    console.error(`[QueueHandler] Unexpected error in consumer`, {
      type: messageType,
      error: error instanceof Error ? error.message : String(error),
    });

    if (message.attempts < (consumer.options?.maxRetries || 3)) {
      const delaySeconds = consumer.options?.retryBackoff?.(message.attempts) || 60;
      message.retry({ delaySeconds });
    } else {
      message.ack();
    }
  }
}

function routeMessage(
  message: Message<AppQueueMessage>,
  messageType: MessageType,
  ctx: ExecutionContext,
): Promise<ConsumerResult> {
  switch (messageType) {
    case "email":
      return emailConsumer(message as Message<RouteMessage<"email">>, ctx);
    case "moderation":
      return moderationConsumer(message as Message<RouteMessage<"moderation">>, ctx);
    default: {
      const _exhaustive: never = messageType;
      throw new Error(`Unhandled message type: ${_exhaustive}`);
    }
  }
}
