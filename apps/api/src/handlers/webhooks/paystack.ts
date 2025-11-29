import { createWebhookQueue } from "@repo/core/queues/webhook-queue";
import { Hono } from "hono";
import {
  retrieveWebhookEventFromDatabaseByProcessorEventId,
  saveWebhookEventToDatabase,
} from "@/models/paystack-models";

const webhooks = new Hono<{ Bindings: Cloudflare.Env }>();

type PaystackChargeData = {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  gateway_response?: string;
};

type PaystackTransferData = {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  transfer_code: string;
  reason?: string;
  gateway_response?: string | null;
  fee_charged?: number;
  recipient?: {
    recipient_code: string;
    name: string;
    type: string;
    details?: {
      account_number?: string;
      account_name?: string | null;
      bank_code?: string;
      bank_name?: string;
    };
  };
};

type PaystackEvent = {
  event: string;
  id?: string;
  data: PaystackChargeData | PaystackTransferData;
};

/**
 * Timing-safe signature verification using HMAC SHA-512
 * Prevents timing attacks by using constant-time comparison
 */
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

  // Timing-safe comparison
  if (hashHex.length !== signature.length) {
    return false;
  }

  const hashBytes = encoder.encode(hashHex);
  const signatureBytes = encoder.encode(signature);

  // Use constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < hashBytes.length; i++) {
    result |= (hashBytes[i] ?? 0) ^ (signatureBytes[i] ?? 0);
  }

  return result === 0;
}

/**
 * Paystack Webhook Handler
 *
 * Implements the "fast acknowledgment" pattern:
 * 1. Verify signature (timing-safe)
 * 2. Check for duplicates
 * 3. Store event in database
 * 4. Queue for async processing
 * 5. Return 200 immediately (< 1 second)
 *
 * This ensures Paystack doesn't retry unnecessarily while
 * allowing robust async processing with retries.
 */
webhooks.post("/", async (c) => {
  try {
    const rawBody = await c.req.text();
    const signature = c.req.header("x-paystack-signature");

    console.log("[PaystackWebhook] Received webhook request");

    // 1. Validate signature presence
    if (!signature) {
      console.error("[PaystackWebhook] Missing signature");
      return c.json({ error: "Missing signature" }, 400);
    }

    // 2. Verify signature (timing-safe)
    const isValid = await verifyPaystackSignature(rawBody, signature, c.env.PAYSTACK_SECRET_KEY);

    if (!isValid) {
      console.error("[PaystackWebhook] Invalid signature");
      return c.json({ error: "Invalid signature" }, 401);
    }

    const event: PaystackEvent = JSON.parse(rawBody);
    const processorEventId = event.id || `${event.event}-${event.data.reference}-${Date.now()}`;

    console.log("[PaystackWebhook] Event received", {
      eventType: event.event,
      eventId: event.id,
      reference: event.data.reference,
    });

    // 3. Check for duplicates (deduplication)
    if (event.id) {
      const existingEvent = await retrieveWebhookEventFromDatabaseByProcessorEventId(event.id);

      if (existingEvent) {
        console.log("[PaystackWebhook] Event already received", { eventId: event.id });
        return c.json({ success: true, message: "Event already received" }, 200);
      }
    }

    // 4. Store event with QUEUED status
    const newEvent = await saveWebhookEventToDatabase({
      processor: "paystack",
      processorEventId,
      eventType: event.event,
      signature,
      rawPayload: rawBody,
      status: "QUEUED",
    });

    if (!newEvent) {
      console.error("[PaystackWebhook] Failed to store webhook event");
      return c.json({ error: "Failed to store webhook event" }, 500);
    }

    // 5. Queue for async processing
    const webhookQueue = createWebhookQueue(c.env.APP_QUEUE, { defaultSource: "api" });

    await webhookQueue.send({
      webhookEventId: newEvent.id,
      processor: "paystack",
      eventType: event.event,
      processorEventId,
    });

    console.log("[PaystackWebhook] Event queued for processing", {
      webhookEventId: newEvent.id,
      eventType: event.event,
      processorEventId,
    });

    // 6. Return 200 immediately (fast acknowledgment)
    return c.json({ success: true, message: "Event queued for processing" }, 200);
  } catch (error) {
    console.error("[PaystackWebhook] Error handling webhook", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return 500 to trigger Paystack retry
    return c.json({ error: "Failed to handle webhook" }, 500);
  }
});

export default webhooks;
