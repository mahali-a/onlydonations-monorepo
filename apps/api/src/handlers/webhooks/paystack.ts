import { Hono } from "hono";
import { createEmailQueue } from "@repo/email/email/queue";
import {
  retrieveWebhookEventFromDatabaseByProcessorEventId,
  saveWebhookEventToDatabase,
  updateWebhookEventStatusInDatabaseById,
  retrieveDonationFromDatabaseByReference,
  updateDonationStatusInDatabaseById,
  updatePaymentTransactionStatusInDatabaseById,
  retrieveDonationWithCampaignFromDatabaseById,
} from "@/models/paystack-models";
import { broadcastDonationSuccess } from "@/durable-objects/broadcast-helpers";

const webhooks = new Hono<{ Bindings: Env }>();

type PaystackEvent = {
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

async function verifyPaystackSignature(
  body: string,
  signature: string,
  secretKey: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );

  const hash = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return hashHex === signature;
}

webhooks.post("/", async (c) => {
  let webhookEventId: string | null = null;

  try {
    const rawBody = await c.req.text();
    const signature = c.req.header("x-paystack-signature");

    console.log("[PaystackWebhook] Received webhook request");

    if (!signature) {
      console.error("[PaystackWebhook] Missing signature");
      return c.json({ error: "Missing signature" }, 400);
    }

    const isValid = await verifyPaystackSignature(rawBody, signature, c.env.PAYSTACK_SECRET_KEY);

    if (!isValid) {
      console.error("[PaystackWebhook] Invalid signature");
      return c.json({ error: "Invalid signature" }, 401);
    }

    const event: PaystackEvent = JSON.parse(rawBody);

    console.log("[PaystackWebhook] Event received", {
      eventType: event.event,
      eventId: event.id,
      reference: event.data.reference,
      payload: event,
    });

    if (event.id) {
      const existingEvent = await retrieveWebhookEventFromDatabaseByProcessorEventId(event.id);

      if (existingEvent) {
        console.log("[PaystackWebhook] Event already processed", { eventId: event.id });
        return c.json({ success: true, message: "Event already processed" }, 200);
      }
    }

    const newEvent = await saveWebhookEventToDatabase({
      processor: "paystack",
      processorEventId: event.id || `${event.event}-${event.data.reference}-${Date.now()}`,
      eventType: event.event,
      signature,
      rawPayload: rawBody,
      status: "PENDING",
    });

    if (!newEvent) {
      return c.json({ error: "Failed to store webhook event" }, 500);
    }

    webhookEventId = newEvent.id;

    const existingDonation = await retrieveDonationFromDatabaseByReference(event.data.reference);

    if (!existingDonation) {
      console.error("[PaystackWebhook] Donation not found", {
        reference: event.data.reference,
        webhookEventId,
      });
      await updateWebhookEventStatusInDatabaseById(webhookEventId, "FAILED", "Donation not found");
      return c.json({ error: "Donation not found" }, 404);
    }

    console.log("[PaystackWebhook] Donation found", {
      donationId: existingDonation.id,
      currentStatus: existingDonation.status,
      expectedAmount: existingDonation.amount,
      webhookAmount: event.data.amount,
    });

    if (event.event === "charge.success") {
      const paystackAmount = event.data.amount;

      if (paystackAmount !== existingDonation.amount) {
        console.error("[PaystackWebhook] Amount mismatch", {
          expected: existingDonation.amount,
          received: paystackAmount,
          donationId: existingDonation.id,
        });
        await updateWebhookEventStatusInDatabaseById(webhookEventId, "FAILED", "Amount mismatch");
        await updateDonationStatusInDatabaseById(existingDonation.id, "FAILED", {
          failedAt: new Date(),
          failureReason: "Amount mismatch",
        });
        return c.json({ error: "Amount mismatch detected" }, 400);
      }

      console.log("[PaystackWebhook] Marking donation as successful", {
        donationId: existingDonation.id,
        amount: existingDonation.amount,
      });

      await updateDonationStatusInDatabaseById(existingDonation.id, "SUCCESS", {
        completedAt: new Date(),
      });

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

      const donationData = await retrieveDonationWithCampaignFromDatabaseById(existingDonation.id);

      if (donationData?.donorEmail && donationData.donorName) {
        console.log("[PaystackWebhook] Sending thank you email", {
          donationId: existingDonation.id,
          email: donationData.donorEmail,
          campaign: donationData.campaignTitle,
        });

        const emailQueue = createEmailQueue(c.env.APP_QUEUE, { defaultSource: "api" });
        const amount = (donationData.amount / 100).toFixed(2);
        const campaignUrl = `${c.env.WEB_BASE_URL}/campaigns/${donationData.campaignSlug}`;
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
        });

        console.log("[PaystackWebhook] Thank you email queued successfully");
      } else {
        console.log("[PaystackWebhook] Skipping thank you email - missing donor data", {
          donationId: existingDonation.id,
          hasEmail: !!donationData?.donorEmail,
          hasName: !!donationData?.donorName,
        });
      }

      if (donationData?.campaignId) {
        await broadcastDonationSuccess(
          c.env,
          donationData.campaignId,
          existingDonation.id,
          c.executionCtx,
        );
      }
    } else if (event.event === "charge.failed") {
      console.log("[PaystackWebhook] Charge failed", {
        donationId: existingDonation.id,
        reason: event.data.gateway_response || "Payment failed",
      });

      await updateDonationStatusInDatabaseById(existingDonation.id, "FAILED", {
        failedAt: new Date(),
        failureReason: event.data.gateway_response || "Payment failed",
      });

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
    } else {
      console.log("[PaystackWebhook] Unhandled event type", { eventType: event.event });
      await updateWebhookEventStatusInDatabaseById(webhookEventId, "PROCESSED");
    }

    console.log("[PaystackWebhook] Webhook processed successfully", {
      eventType: event.event,
      donationId: existingDonation.id,
      webhookEventId,
    });

    return c.json({ success: true }, 200);
  } catch (error) {
    console.error("[PaystackWebhook] Error processing webhook", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      webhookEventId,
    });

    if (webhookEventId) {
      await updateWebhookEventStatusInDatabaseById(
        webhookEventId,
        "FAILED",
        error instanceof Error ? error.message : "Unknown error",
      );
    }

    return c.json({ error: "Failed to process webhook" }, 500);
  }
});

export default webhooks;
