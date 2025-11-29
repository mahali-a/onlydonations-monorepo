import { createWebhookQueue } from "@repo/core/queues/webhook-queue";
import { Hono } from "hono";
import {
  retrieveSmileWebhookEventFromDatabaseByJobId,
  saveSmileWebhookEventToDatabase,
} from "@/queues/consumers/smile-models";

const webhooks = new Hono<{ Bindings: Cloudflare.Env }>();

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

/**
 * Timing-safe signature verification using HMAC SHA-256
 * Prevents timing attacks by using constant-time comparison
 */
async function verifySmileSignature(
  body: string,
  signature: string,
  apiKey: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiKey);
  const messageData = encoder.encode(body);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const expectedSignature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const expectedHex = Array.from(new Uint8Array(expectedSignature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Timing-safe comparison
  if (expectedHex.length !== signature.length) {
    return false;
  }

  const expectedBytes = encoder.encode(expectedHex);
  const signatureBytes = encoder.encode(signature);

  let result = 0;
  for (let i = 0; i < expectedBytes.length; i++) {
    result |= (expectedBytes[i] ?? 0) ^ (signatureBytes[i] ?? 0);
  }

  return result === 0;
}

/**
 * Smile Webhook Handler
 *
 * Implements the "fast acknowledgment" pattern:
 * 1. Verify signature (timing-safe)
 * 2. Check for duplicates
 * 3. Store event in database
 * 4. Queue for async processing
 * 5. Return 200 immediately (< 1 second)
 *
 * This ensures Smile doesn't retry unnecessarily while
 * allowing robust async processing with retries.
 */
webhooks.post("/", async (c) => {
  try {
    const rawBody = await c.req.text();
    const signature = c.req.header("x-signature");

    console.log("[SmileWebhook] Received webhook request");

    // 1. Validate signature presence
    if (!signature) {
      console.error("[SmileWebhook] Missing signature");
      return c.json({ error: "Missing signature" }, 400);
    }

    // 2. Verify signature (timing-safe)
    const isValid = await verifySmileSignature(rawBody, signature, c.env.SMILE_API_KEY);

    if (!isValid) {
      console.error("[SmileWebhook] Invalid signature");
      return c.json({ error: "Invalid signature" }, 401);
    }

    const payload: SmileWebhookPayload = JSON.parse(rawBody);
    const processorEventId = payload.job_id;

    console.log("[SmileWebhook] Event received", {
      jobId: payload.job_id,
      userId: payload.user_id,
      resultCode: payload.result?.ResultCode,
    });

    // 3. Check for duplicates (deduplication)
    const existingEvent = await retrieveSmileWebhookEventFromDatabaseByJobId(payload.job_id);

    if (existingEvent) {
      console.log("[SmileWebhook] Event already received", { jobId: payload.job_id });
      return c.json({ success: true, message: "Event already received" }, 200);
    }

    // 4. Store event with QUEUED status
    const newEvent = await saveSmileWebhookEventToDatabase({
      jobId: payload.job_id,
      signature,
      rawPayload: rawBody,
      eventType: "verification_complete",
      status: "queued",
    });

    if (!newEvent) {
      console.error("[SmileWebhook] Failed to store webhook event");
      return c.json({ error: "Failed to store webhook event" }, 500);
    }

    // 5. Queue for async processing
    const webhookQueue = createWebhookQueue(c.env.APP_QUEUE, { defaultSource: "api" });

    await webhookQueue.send({
      webhookEventId: newEvent.id,
      processor: "smile",
      eventType: "verification_complete",
      processorEventId,
    });

    console.log("[SmileWebhook] Event queued for processing", {
      webhookEventId: newEvent.id,
      jobId: payload.job_id,
    });

    // 6. Return 200 immediately (fast acknowledgment)
    return c.json({ success: true, message: "Event queued for processing" }, 200);
  } catch (error) {
    console.error("[SmileWebhook] Error handling webhook", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return 500 to trigger Smile retry
    return c.json({ error: "Failed to handle webhook" }, 500);
  }
});

export default webhooks;
