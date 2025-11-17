import { getDb } from "@repo/core/database/setup";
import { webhookEvent } from "@repo/core/drizzle/schema";
import { eq } from "@repo/core/drizzle";

/**
 * Retrieve webhook event from database by processor event ID.
 * Used for idempotency checks to prevent duplicate webhook processing.
 *
 * @param processorEventId - The unique event ID from the payment processor
 * @returns The webhook event record or null if not found
 */
export async function retrieveWebhookEventFromDatabaseByProcessorEventId(processorEventId: string) {
  const db = getDb();
  const result = await db
    .select({
      id: webhookEvent.id,
      status: webhookEvent.status,
      processedAt: webhookEvent.processedAt,
      eventType: webhookEvent.eventType,
    })
    .from(webhookEvent)
    .where(eq(webhookEvent.processorEventId, processorEventId))
    .limit(1);

  return result[0] || null;
}

/**
 * Save webhook event to database.
 * Creates a new webhook event record for audit trail and idempotency.
 *
 * @param data - Webhook event data
 * @returns The created webhook event record
 */
export async function saveWebhookEventToDatabase(data: {
  processor: string;
  processorEventId: string;
  eventType: string;
  signature: string;
  rawPayload: string;
  status: string;
}) {
  const db = getDb();
  const [created] = await db
    .insert(webhookEvent)
    .values({
      ...data,
      receivedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({
      id: webhookEvent.id,
      processorEventId: webhookEvent.processorEventId,
      status: webhookEvent.status,
    });

  return created || null;
}

/**
 * Update webhook event status in database by ID.
 * Marks webhook as processed, failed, or other status.
 *
 * @param id - Webhook event ID
 * @param status - New status (PROCESSED, FAILED, etc.)
 * @param errorMessage - Optional error message if status is FAILED
 * @returns The updated webhook event record
 */
export async function updateWebhookEventStatusInDatabaseById(
  id: string,
  status: string,
  errorMessage?: string,
) {
  const db = getDb();
  const updateData: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };

  if (status === "PROCESSED") {
    updateData.processedAt = new Date();
  }

  if (errorMessage) {
    updateData.errorMessage = errorMessage;
  }

  const [updated] = await db
    .update(webhookEvent)
    .set(updateData)
    .where(eq(webhookEvent.id, id))
    .returning({
      id: webhookEvent.id,
      status: webhookEvent.status,
    });

  return updated || null;
}
