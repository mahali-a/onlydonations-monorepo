import crypto from "node:crypto";
import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { logger } from "@/lib/logger";
import {
  retrieveDonationFromDatabaseByReference,
  updateDonationStatusInDatabaseById,
} from "@/features/org-donations/public/donate/donate-models";
import {
  retrieveWebhookEventFromDatabaseByProcessorEventId,
  saveWebhookEventToDatabase,
  updateWebhookEventStatusInDatabaseById,
} from "@/features/webhooks/server";
import { updatePaymentTransactionStatusInDatabaseById } from "@/features/org-payments/server";

const webhookLogger = logger.createChildLogger("paystack-webhook");

type PaystackEvent = {
  event: string;
  id?: string;
  data: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    gateway_response?: string;
    paid_at?: string;
    metadata?: {
      donationId?: string;
      campaignId?: string;
    };
  };
};

function verifyPaystackSignature(body: string, signature: string): boolean {
  const hash = crypto.createHmac("sha512", env.PAYSTACK_SECRET_KEY).update(body).digest("hex");

  // Use timing-safe comparison to prevent timing attacks
  const hashBuffer = Buffer.from(hash);
  const signatureBuffer = Buffer.from(signature);

  if (hashBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashBuffer, signatureBuffer);
}

export const Route = createFileRoute("/api/webhooks/paystack")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let webhookEventId: string | null = null;

        try {
          const rawBody = await request.text();
          const signature = request.headers.get("x-paystack-signature");

          if (!signature) {
            webhookLogger.error("Missing signature in webhook");
            return json({ error: "Missing signature" }, { status: 400 });
          }

          const isValid = verifyPaystackSignature(rawBody, signature);

          if (!isValid) {
            webhookLogger.error("Invalid webhook signature");
            return json({ error: "Invalid signature" }, { status: 401 });
          }

          const event: PaystackEvent = JSON.parse(rawBody);

          webhookLogger.info("webhook.received", {
            event: event.event,
            reference: event.data.reference,
            eventId: event.id,
          });

          // Idempotency check: Check if we've already processed this webhook event
          if (event.id) {
            const existingWebhookEvent = await retrieveWebhookEventFromDatabaseByProcessorEventId(
              event.id,
            );

            if (existingWebhookEvent) {
              webhookLogger.info("webhook.duplicate_event", {
                eventId: event.id,
                status: existingWebhookEvent.status,
              });
              return json({ success: true, message: "Event already processed" }, { status: 200 });
            }
          }

          // Store webhook event for audit trail and idempotency
          const webhookEvent = await saveWebhookEventToDatabase({
            processor: "paystack",
            processorEventId: event.id || `${event.event}-${event.data.reference}-${Date.now()}`,
            eventType: event.event,
            signature,
            rawPayload: rawBody,
            status: "PENDING",
          });

          if (!webhookEvent) {
            webhookLogger.error("webhook.failed_to_store");
            return json({ error: "Failed to store webhook event" }, { status: 500 });
          }

          webhookEventId = webhookEvent.id;

          const existingDonation = await retrieveDonationFromDatabaseByReference(
            event.data.reference,
          );

          if (!existingDonation) {
            await updateWebhookEventStatusInDatabaseById(
              webhookEventId,
              "FAILED",
              "Donation not found",
            );
            webhookLogger.error("webhook.donation_not_found", {
              reference: event.data.reference,
            });
            return json({ error: "Donation not found" }, { status: 404 });
          }

          // Handle different webhook events
          if (event.event === "charge.success") {
            // Amount verification: Ensure Paystack amount matches expected donation amount
            // Both Paystack (kobo) and donation.amount are stored in minor units (pesewas/kobo)
            const paystackAmountInMinorUnits = event.data.amount;

            if (paystackAmountInMinorUnits !== existingDonation.amount) {
              const expectedInMajor = existingDonation.amount / 100;
              const actualInMajor = paystackAmountInMinorUnits / 100;

              await updateWebhookEventStatusInDatabaseById(
                webhookEventId,
                "FAILED",
                `Amount mismatch: expected ${existingDonation.amount} minor units, got ${paystackAmountInMinorUnits} minor units`,
              );
              await updateDonationStatusInDatabaseById(existingDonation.id, "FAILED", {
                failedAt: new Date(),
                failureReason: `Amount mismatch: expected ${expectedInMajor} ${existingDonation.currency}, but payment processor charged ${actualInMajor} ${existingDonation.currency}`,
              });

              webhookLogger.error("webhook.amount_mismatch", {
                donationId: existingDonation.id,
                expectedAmountMinor: existingDonation.amount,
                actualAmountMinor: paystackAmountInMinorUnits,
                expectedAmountMajor: expectedInMajor,
                actualAmountMajor: actualInMajor,
              });

              return json({ error: "Amount mismatch detected" }, { status: 400 });
            }

            await updateDonationStatusInDatabaseById(existingDonation.id, "SUCCESS", {
              completedAt: new Date(),
            });

            // Update payment transaction status
            if (existingDonation.paymentTransactionId) {
              await updatePaymentTransactionStatusInDatabaseById(
                existingDonation.paymentTransactionId,
                "SUCCESS",
                {
                  completedAt: new Date(),
                  processorTransactionId: event.id || event.data.reference,
                },
              );
            }

            await updateWebhookEventStatusInDatabaseById(webhookEventId, "PROCESSED");

            webhookLogger.info("webhook.donation_success", {
              donationId: existingDonation.id,
              reference: event.data.reference,
              amount: event.data.amount,
            });
          } else if (event.event === "charge.failed") {
            await updateDonationStatusInDatabaseById(existingDonation.id, "FAILED", {
              failedAt: new Date(),
              failureReason: event.data.gateway_response || "Payment failed",
            });

            // Update payment transaction status
            if (existingDonation.paymentTransactionId) {
              await updatePaymentTransactionStatusInDatabaseById(
                existingDonation.paymentTransactionId,
                "FAILED",
                {
                  statusMessage: event.data.gateway_response || "Payment failed",
                },
              );
            }

            await updateWebhookEventStatusInDatabaseById(webhookEventId, "PROCESSED");

            webhookLogger.error("webhook.donation_failed", {
              donationId: existingDonation.id,
              reference: event.data.reference,
              reason: event.data.gateway_response,
            });
          } else if (event.event === "charge.dispute.create") {
            // Mark donation as disputed
            await updateDonationStatusInDatabaseById(existingDonation.id, "FAILED", {
              failedAt: new Date(),
              failureReason: "Payment disputed by donor",
            });

            await updateWebhookEventStatusInDatabaseById(webhookEventId, "PROCESSED");

            webhookLogger.error("webhook.donation_disputed", {
              donationId: existingDonation.id,
              reference: event.data.reference,
            });
          } else if (event.event === "charge.dispute.resolve") {
            // If dispute is resolved in merchant's favor, mark as success
            if (event.data.status === "resolved") {
              await updateDonationStatusInDatabaseById(existingDonation.id, "SUCCESS", {
                completedAt: new Date(),
              });

              await updateWebhookEventStatusInDatabaseById(webhookEventId, "PROCESSED");

              webhookLogger.info("webhook.dispute_resolved", {
                donationId: existingDonation.id,
                reference: event.data.reference,
              });
            } else {
              // Dispute lost, keep as failed
              await updateWebhookEventStatusInDatabaseById(webhookEventId, "PROCESSED");

              webhookLogger.error("webhook.dispute_lost", {
                donationId: existingDonation.id,
                reference: event.data.reference,
              });
            }
          } else if (event.event === "refund.processed") {
            // Mark donation as refunded
            await updateDonationStatusInDatabaseById(existingDonation.id, "FAILED", {
              failedAt: new Date(),
              failureReason: "Payment refunded",
            });

            await updateWebhookEventStatusInDatabaseById(webhookEventId, "PROCESSED");

            webhookLogger.error("webhook.donation_refunded", {
              donationId: existingDonation.id,
              reference: event.data.reference,
            });
          } else {
            // Unknown event type - log but mark as processed
            await updateWebhookEventStatusInDatabaseById(webhookEventId, "PROCESSED");

            webhookLogger.info("webhook.unhandled_event", {
              event: event.event,
              reference: event.data.reference,
            });
          }

          return json({ success: true }, { status: 200 });
        } catch (error) {
          if (webhookEventId) {
            await updateWebhookEventStatusInDatabaseById(
              webhookEventId,
              "FAILED",
              error instanceof Error ? error.message : "Unknown error",
            );
          }

          webhookLogger.error("webhook.error", {
            error: error instanceof Error ? error.message : "Unknown error",
          });
          return json(
            {
              error: "Failed to process webhook",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
