import { initEmail, sendEmail } from "@repo/email/email/setup";
import { emailQueueDataSchema } from "@repo/email/email/schema";
import type { EmailTemplateType } from "@repo/email/email/types";
import type { ConsumerResult, QueueConsumer } from "@repo/core/queues/types";
import type { EmailQueueMessage } from "@repo/email/email/schema";

/**
 * Email queue consumer
 * Processes email messages from the queue
 */
export const emailConsumer: QueueConsumer<EmailQueueMessage> = async (
  message,
  env,
  _ctx,
): Promise<ConsumerResult> => {
  const startTime = Date.now();

  try {
    // Initialize email service (idempotent)
    initEmail(
      (env as { RESEND_API_KEY: string }).RESEND_API_KEY,
      (env as { EMAIL_FROM: string }).EMAIL_FROM,
      {
        isDev: (env as { ENVIRONMENT?: string }).ENVIRONMENT !== "production",
      },
    );

    // Validate message data
    const { templateId, templateData } = emailQueueDataSchema.parse(message.body.data);

    // Send email using existing service
    const _result = await sendEmail(templateId as EmailTemplateType, templateData as never);

    const duration = Date.now() - startTime;

    return { status: "success", duration };
  } catch (error) {
    const _duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Determine if error is retryable
    const isRetryable = isRetryableEmailError(error);

    if (isRetryable && message.attempts < 3) {
      // Exponential backoff: 60s, 300s, 900s
      const delaySeconds = 5 ** message.attempts * 60;

      return {
        status: "retry",
        reason: errorMessage,
        delaySeconds,
      };
    }

    // Max retries or fatal error
    return {
      status: "failed",
      reason: errorMessage,
      fatal: !isRetryable || message.attempts >= 3,
    };
  }
};

/**
 * Determine if an email error should be retried
 */
function isRetryableEmailError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();

  // Don't retry validation errors
  if (message.includes("invalid") || message.includes("validation")) {
    return false;
  }

  // Don't retry authentication errors
  if (message.includes("unauthorized") || message.includes("forbidden")) {
    return false;
  }

  // Retry rate limits and temporary failures
  if (
    message.includes("rate limit") ||
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("temporary")
  ) {
    return true;
  }

  // Default: retry
  return true;
}
