import { env } from "cloudflare:workers";
import type { SMSQueueMessage } from "@repo/core/queues/sms-schema";
import { smsQueueDataSchema } from "@repo/core/queues/sms-schema";
import type { ConsumerResult, QueueConsumer } from "@repo/core/queues/types";
import { createSMSClient } from "@/lib/sms/client";

export const smsConsumer: QueueConsumer<SMSQueueMessage> = async (
  message,
  _ctx,
): Promise<ConsumerResult> => {
  const startTime = Date.now();

  try {
    const data = smsQueueDataSchema.parse(message.body.data);

    const smsClient = createSMSClient({
      routes: "default:pilo",
      fallbackProvider: "pilo",
      pilo: {
        apiKey: env.PILO_SMS_API_KEY,
        senderId: env.PILO_SMS_SENDER_ID,
      },
      telnyx: {
        apiKey: env.TELNYX_API_KEY,
        fromNumber: env.TELNYX_FROM_NUMBER,
      },
    });

    const result = await smsClient.send({
      to: data.to,
      message: data.message,
    });

    if (result.success) {
      console.log("[SMSConsumer] SMS sent successfully", {
        messageId: message.body.messageId,
        to: data.to,
        provider: result.provider,
        smsId: result.id,
      });

      return { status: "success", duration: Date.now() - startTime };
    }

    console.error("[SMSConsumer] SMS send failed", {
      messageId: message.body.messageId,
      to: data.to,
      code: result.code,
      error: result.message,
    });

    if (result.retryable && message.attempts < 3) {
      const delaySeconds = 2 ** message.attempts * 30;
      return {
        status: "retry",
        reason: result.message,
        delaySeconds,
      };
    }

    return {
      status: "failed",
      reason: result.message,
      fatal: !result.retryable,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (message.attempts < 3) {
      return {
        status: "retry",
        reason: errorMessage,
        delaySeconds: 2 ** message.attempts * 30,
      };
    }

    return {
      status: "failed",
      reason: errorMessage,
      fatal: true,
    };
  }
};
