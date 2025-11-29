import { env } from "cloudflare:workers";
import type { ConsumerResult, QueueConsumer } from "@repo/core/queues/types";
import type { WebhookQueueMessage } from "@repo/core/queues/webhook-schema";
import { webhookQueueDataSchema } from "@repo/core/queues/webhook-schema";
import { createEmailQueue } from "@repo/email/email/queue";
import { broadcastDonationSuccess } from "@/durable-objects/broadcast-helpers";
import {
  retrieveSmileWebhookEventFromDatabaseById,
  retrieveUserKycStatusFromDatabaseByUser,
  retrieveVerificationJobFromDatabaseBySmileId,
  saveUserKycStatusToDatabase,
  updateSmileWebhookEventStatusInDatabaseById,
  updateUserKycStatusInDatabase,
  updateVerificationJobInDatabase,
} from "./smile-models";
import {
  retrieveDonationFromDatabaseByReference,
  retrieveDonationWithCampaignFromDatabaseById,
  retrievePaymentTransactionFromDatabaseByProcessorRef,
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
        return await processSmileWebhook(data.webhookEventId, startTime);
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
      gateway_response?: string | null;
      transfer_code?: string;
      reason?: string;
    };
  };

  if (payload.event.startsWith("transfer.")) {
    return await processPaystackTransferWebhook(webhookEventId, payload, startTime);
  }

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
      const emailQueue = createEmailQueue(env.APP_QUEUE, {
        defaultSource: "api",
      });
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
      ctx.waitUntil(broadcastDonationSuccess(donationData.campaignId, donation.id, ctx));
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

type PaystackTransferPayload = {
  event: string;
  id?: string;
  data: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    gateway_response?: string | null;
    transfer_code?: string;
    reason?: string;
  };
};

async function processPaystackTransferWebhook(
  webhookEventId: string,
  payload: PaystackTransferPayload,
  startTime: number,
): Promise<ConsumerResult> {
  const transaction = await retrievePaymentTransactionFromDatabaseByProcessorRef(
    payload.data.reference,
  );

  if (!transaction) {
    await updateWebhookEventStatusInDatabaseById(
      webhookEventId,
      "FAILED",
      "Payment transaction not found",
    );
    return {
      status: "failed",
      reason: `Payment transaction not found for reference: ${payload.data.reference}`,
      fatal: true,
    };
  }

  const isFinalStatus = [
    "SUCCESS",
    "FAILED",
    "REVERSED",
    "ABANDONED",
    "BLOCKED",
    "REJECTED",
  ].includes(transaction.status);
  if (isFinalStatus) {
    await updateWebhookEventStatusInDatabaseById(webhookEventId, "PROCESSED");
    return { status: "success", duration: Date.now() - startTime };
  }

  if (payload.event === "transfer.success") {
    await updatePaymentTransactionStatusInDatabaseById(transaction.id, "SUCCESS", {
      completedAt: new Date(),
      processorTransactionId: payload.data.transfer_code || payload.data.reference,
    });

    await updateWebhookEventStatusInDatabaseById(webhookEventId, "PROCESSED");
  } else if (payload.event === "transfer.failed") {
    const failureReason = payload.data.gateway_response || payload.data.reason || "Transfer failed";

    await updatePaymentTransactionStatusInDatabaseById(transaction.id, "FAILED", {
      statusMessage: failureReason,
      processorTransactionId: payload.data.transfer_code || payload.data.reference,
    });

    await updateWebhookEventStatusInDatabaseById(webhookEventId, "PROCESSED");
  } else if (payload.event === "transfer.reversed") {
    await updatePaymentTransactionStatusInDatabaseById(transaction.id, "REVERSED", {
      statusMessage: "Transfer reversed - funds returned to balance",
      processorTransactionId: payload.data.transfer_code || payload.data.reference,
    });

    await updateWebhookEventStatusInDatabaseById(webhookEventId, "PROCESSED");
  } else {
    await updateWebhookEventStatusInDatabaseById(webhookEventId, "PROCESSED");
  }

  return { status: "success", duration: Date.now() - startTime };
}

type SmileWebhookPayload = {
  job_id: string;
  user_id: string;
  job_type: number;
  result: {
    ResultCode: string;
    ResultText: string;
    Actions: {
      Verify_ID_Number: string;
      Return_Personal_Info: string;
    };
  };
  signature: string;
  timestamp: string;
};

async function processSmileWebhook(
  webhookEventId: string,
  startTime: number,
): Promise<ConsumerResult> {
  const webhookEvent = await retrieveSmileWebhookEventFromDatabaseById(webhookEventId);

  if (!webhookEvent) {
    return {
      status: "failed",
      reason: `Smile webhook event not found: ${webhookEventId}`,
      fatal: true,
    };
  }

  const payload: SmileWebhookPayload = JSON.parse(webhookEvent.rawPayload);

  // Find the verification job
  const job = await retrieveVerificationJobFromDatabaseBySmileId(payload.job_id);

  if (!job) {
    await updateSmileWebhookEventStatusInDatabaseById(
      webhookEventId,
      "failed",
      "Verification job not found",
    );
    return {
      status: "failed",
      reason: `Verification job not found for job_id: ${payload.job_id}`,
      fatal: true,
    };
  }

  // Update verification job with results
  await updateVerificationJobInDatabase(payload.job_id, {
    status: "completed",
    resultCode: payload.result.ResultCode,
    resultText: payload.result.ResultText,
    rawResult: payload as unknown as Record<string, unknown>,
  });

  // Determine KYC status based on result code
  const isVerified = payload.result.ResultCode === "1";
  const isRejected = payload.result.ResultCode === "0";

  // Check if user already has KYC status
  const existingKycStatus = await retrieveUserKycStatusFromDatabaseByUser(job.userId);

  if (isVerified) {
    const kycData = {
      kycStatus: "VERIFIED" as const,
      kycVerifiedAt: new Date(),
      smileJobId: payload.job_id,
    };

    if (existingKycStatus) {
      await updateUserKycStatusInDatabase(job.userId, kycData);
    } else {
      await saveUserKycStatusToDatabase(job.userId, kycData);
    }
  } else if (isRejected) {
    const kycData = {
      kycStatus: "REJECTED" as const,
      smileJobId: payload.job_id,
    };

    if (existingKycStatus) {
      await updateUserKycStatusInDatabase(job.userId, kycData);
    } else {
      await saveUserKycStatusToDatabase(job.userId, kycData);
    }
  } else {
    // Unknown result - mark as requires input
    const kycData = {
      kycStatus: "REQUIRES_INPUT" as const,
      smileJobId: payload.job_id,
    };

    if (existingKycStatus) {
      await updateUserKycStatusInDatabase(job.userId, kycData);
    } else {
      await saveUserKycStatusToDatabase(job.userId, kycData);
    }
  }

  // Mark webhook as processed
  await updateSmileWebhookEventStatusInDatabaseById(webhookEventId, "processed");

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
