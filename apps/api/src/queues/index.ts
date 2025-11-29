import type { ModerationQueueMessage } from "@repo/core/queues/moderation-schema";
import { moderationQueueDataSchema } from "@repo/core/queues/moderation-schema";
import type { SMSQueueMessage } from "@repo/core/queues/sms-schema";
import { smsQueueDataSchema } from "@repo/core/queues/sms-schema";
import type { ConsumerResult } from "@repo/core/queues/types";
import type { WebhookQueueMessage } from "@repo/core/queues/webhook-schema";
import { webhookQueueDataSchema } from "@repo/core/queues/webhook-schema";
import type { EmailQueueMessage } from "@repo/email/email/schema";
import { emailQueueDataSchema } from "@repo/email/email/schema";
import { emailConsumer } from "./consumers/email.consumer";
import { moderationConsumer } from "./consumers/moderation.consumer";
import { smsConsumer } from "./consumers/sms.consumer";
import { webhookConsumer } from "./consumers/webhook.consumer";

type AppQueueMessage =
  | EmailQueueMessage
  | ModerationQueueMessage
  | SMSQueueMessage
  | WebhookQueueMessage;
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
  sms: {
    name: string;
    schema: typeof smsQueueDataSchema;
    handler: typeof smsConsumer;
    options: { maxRetries: number; retryBackoff: (attempt: number) => number };
  };
  webhook: {
    name: string;
    schema: typeof webhookQueueDataSchema;
    handler: typeof webhookConsumer;
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
  sms: {
    name: "sms",
    schema: smsQueueDataSchema,
    handler: smsConsumer,
    options: {
      maxRetries: 3,
      retryBackoff: (attempt: number) => 2 ** attempt * 30,
    },
  },
  webhook: {
    name: "webhook",
    schema: webhookQueueDataSchema,
    handler: webhookConsumer,
    options: {
      maxRetries: 5,
      retryBackoff: (attempt: number) => 3 ** attempt * 60,
    },
  },
};

export async function handleQueueMessage(
  message: Message<AppQueueMessage>,
  ctx: ExecutionContext,
): Promise<void> {
  const messageType = message.body.type;

  if (
    messageType !== "email" &&
    messageType !== "moderation" &&
    messageType !== "sms" &&
    messageType !== "webhook"
  ) {
    console.error(`[QueueHandler] Unknown message type: ${messageType}`);
    message.ack();
    return;
  }

  const consumer = CONSUMER_REGISTRY[messageType as "email" | "moderation" | "sms" | "webhook"];

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
    case "sms":
      return smsConsumer(message as Message<RouteMessage<"sms">>, ctx);
    case "webhook":
      return webhookConsumer(message as Message<RouteMessage<"webhook">>, ctx);
    default: {
      const _exhaustive: never = messageType;
      throw new Error(`Unhandled message type: ${_exhaustive}`);
    }
  }
}
