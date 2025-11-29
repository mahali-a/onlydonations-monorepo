import { env } from "cloudflare:workers";
import type { ConsumerResult, QueueConsumer } from "@repo/core/queues/types";
import type { WebhookQueueMessage } from "@repo/core/queues/webhook-schema";
import { webhookQueueDataSchema } from "@repo/core/queues/webhook-schema";
import { createEmailQueue } from "@repo/email/email/queue";
import { broadcastDonationSuccess } from "@/durable-objects/broadcast-helpers";
import {
  retrieveDonationFromDatabaseByReference,
  retrieveDonationWithCampaignFromDatabaseById,
  retrieveWebhookEventFromDatabaseById,
  updateDonationStatusInDatabaseById,
  updatePaymentTransactionStatusInDatabaseById,
  updateWebhookEventStatusInDatabaseById,
} from "./webhook-models";

export const webhookConsumer: QueueConsumer<WebhookQueueMessage> = async (
  message,
  ctx,
): Promise<ConsumerResult> => {
  const startTime = Date.now();

  try {
    const data = webhookQueueDataSchema.parse(message.body.data);

    // Update status to PROCESSING
    await updateWebhookEventStatusInDatabaseById(data.webhookEventId, "PROCESSING");

    // Route to appropriate processor
    switch (data.processor) {
      case "paystack":
        return await processPaystackWebhook(data.webhookEventId, ctx, startTime);
      case "smile":
        // Smile webhooks are handled in the web app for now
        // This is a placeholder for future migration
        return {
          status: "failed",
          reason: "Smile webhooks are not yet supported in the queue consumer",
          fatal: true,
        };
      default: {
        const _exhaustive: never = data.processor;
        return {
          status: "failed",
          reason: `Unknown processor: ${_exhaustive}`,
          fatal: true,
        };
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isRetryable = isRetryableWebhookError(error);

    // Update webhook event status on failure
    const data = message.body.data;
    if (data.webhookEventId) {
      await updateWebhookEventStatusInDatabaseById(
        data.webhookEventId,
        message.attempts >= 5 ? "FAILED" : "PENDING",
        errorMessage,
      );
    }

    if (isRetryable && message.attempts < 5) {
      // Exponential backoff: 60s, 300s, 900s, 2700s, 8100s
      const delaySeconds = 3 ** message.attempts * 60;

      return {
        status: "retry",
        reason: errorMessage,
        delaySeconds,
      };
    }

    return {
      status: "failed",
      reason: errorMessage,
      fatal: !isRetryable || message.attempts >= 5,
    };
  }
};

async function processPaystackWebhook(
  webhookEventId: string,
  ctx: ExecutionContext,
  startTime: number,
): Promise<ConsumerResult> {
  const webhookEvent = await retrieveWebhookEventFromDatabaseById(webhookEventId);

  if (!webhookEvent) {
    return {
      status: "failed",
      reason: `Webhook event not found: ${webhookEventId}`,
      fatal: true,
    };
  }

  const payload = JSON.parse(webhookEvent.rawPayload) as {
    event: string;
    id?: string;
    data: {
      reference: string;
      amount: number;
      currency: string;
      status: string;
      gateway_response?: string;
    };
  };

  const donation = await retrieveDonationFromDatabaseByReference(payload.data.reference);

  if (!donation) {
    await updateWebhookEventStatusInDatabaseById(webhookEventId, "FAILED", "Donation not found");
    return {
      status: "failed",
      reason: `Donation not found for reference: ${payload.data.reference}`,
      fatal: true,
    };
  }

  if (payload.event === "charge.success") {
    // Verify amount matches
    if (payload.data.amount !== donation.amount) {
      await updateWebhookEventStatusInDatabaseById(webhookEventId, "FAILED", "Amount mismatch");
      await updateDonationStatusInDatabaseById(donation.id, "FAILED", {
        failedAt: new Date(),
        failureReason: "Amount mismatch",
      });
      return {
        status: "failed",
        reason: `Amount mismatch: expected ${donation.amount}, got ${payload.data.amount}`,
        fatal: true,
      };
    }

    // Update donation status
    await updateDonationStatusInDatabaseById(donation.id, "SUCCESS", {
      completedAt: new Date(),
    });

    // Update payment transaction status
    if (donation.paymentTransactionId) {
      await updatePaymentTransactionStatusInDatabaseById(donation.paymentTransactionId, "SUCCESS", {
        completedAt: new Date(),
        processorTransactionId: payload.id || payload.data.reference,
      });
    }

    // Mark webhook as processed
    await updateWebhookEventStatusInDatabaseById(webhookEventId, "PROCESSED");

    // Send thank you email
    const donationData = await retrieveDonationWithCampaignFromDatabaseById(donation.id);

    if (donationData?.donorEmail && donationData.donorName) {
      const emailQueue = createEmailQueue(env.APP_QUEUE, { defaultSource: "api" });
      const amount = (donationData.amount / 100).toFixed(2);
      const campaignUrl = `${env.WEB_BASE_URL}/f/${donationData.campaignSlug}`;
      const donationShareUrl = `${env.WEB_BASE_URL}/d/${donation.id}`;
      const donatedAt = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      await emailQueue.send("donation-thank-you", {
        email: donationData.donorEmail,
        donorName: donationData.donorName,
        amount,
        currency: donationData.currency,
        campaignTitle: donationData.campaignTitle,
        campaignUrl,
        customThankYouMessage: donationData.thankYouMessage || undefined,
        donatedAt,
        donationShareUrl,
      });
    }

    // Broadcast to realtime
    if (donationData?.campaignId) {
      ctx.waitUntil(broadcastDonationSuccess(env, donationData.campaignId, donation.id, ctx));
    }
  } else if (payload.event === "charge.failed") {
    await updateDonationStatusInDatabaseById(donation.id, "FAILED", {
      failedAt: new Date(),
      failureReason: payload.data.gateway_response || "Payment failed",
    });

    if (donation.paymentTransactionId) {
      await updatePaymentTransactionStatusInDatabaseById(donation.paymentTransactionId, "FAILED", {
        statusMessage: payload.data.gateway_response || "Payment failed",
      });
    }

    await updateWebhookEventStatusInDatabaseById(webhookEventId, "PROCESSED");
  } else {
    // Unknown event type - mark as processed
    await updateWebhookEventStatusInDatabaseById(webhookEventId, "PROCESSED");
  }

  return { status: "success", duration: Date.now() - startTime };
}

function isRetryableWebhookError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();

  // Non-retryable errors
  if (
    message.includes("not found") ||
    message.includes("invalid") ||
    message.includes("mismatch")
  ) {
    return false;
  }

  // Retryable errors
  return (
    message.includes("rate limit") ||
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("connection") ||
    message.includes("429") ||
    message.includes("503") ||
    message.includes("502") ||
    message.includes("database")
  );
}
