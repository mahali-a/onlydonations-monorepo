import type { ConsumerResult, QueueConsumer } from "@repo/core/queues/types";
import type { EmailQueueMessage } from "@repo/email/email/schema";
import { emailQueueDataSchema } from "@repo/email/email/schema";
import { sendEmail } from "@repo/email/email/setup";
import type { EmailTemplateType } from "@repo/email/email/types";

export const emailConsumer: QueueConsumer<EmailQueueMessage> = async (
  message,
  _ctx,
): Promise<ConsumerResult> => {
  const startTime = Date.now();

  try {
    const { templateId, templateData } = emailQueueDataSchema.parse(message.body.data);
    await sendEmail(templateId as EmailTemplateType, templateData as never);

    return { status: "success", duration: Date.now() - startTime };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isRetryable = isRetryableEmailError(error);

    if (isRetryable && message.attempts < 3) {
      const delaySeconds = 5 ** message.attempts * 60;

      return {
        status: "retry",
        reason: errorMessage,
        delaySeconds,
      };
    }

    return {
      status: "failed",
      reason: errorMessage,
      fatal: !isRetryable || message.attempts >= 3,
    };
  }
};

function isRetryableEmailError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();

  if (message.includes("invalid") || message.includes("validation")) {
    return false;
  }

  if (message.includes("unauthorized") || message.includes("forbidden")) {
    return false;
  }

  if (
    message.includes("rate limit") ||
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("temporary")
  ) {
    return true;
  }

  return true;
}
