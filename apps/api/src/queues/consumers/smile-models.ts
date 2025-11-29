import { getDb } from "@repo/core/database/setup";
import { eq } from "@repo/core/drizzle";
import { smileWebhookEvent, userKycStatus, verificationJob } from "@repo/core/drizzle/schema";

/**
 * Retrieve smile webhook event from database by job ID
 * @param jobId - The Smile job ID
 * @returns Smile webhook event or null
 */
export async function retrieveSmileWebhookEventFromDatabaseByJobId(jobId: string) {
  const db = getDb();
  const result = await db.query.smileWebhookEvent.findFirst({
    where: eq(smileWebhookEvent.jobId, jobId),
  });
  return result ?? null;
}

/**
 * Retrieve smile webhook event from database by ID
 * @param id - The webhook event ID
 * @returns Smile webhook event or null
 */
export async function retrieveSmileWebhookEventFromDatabaseById(id: string) {
  const db = getDb();
  const result = await db.query.smileWebhookEvent.findFirst({
    where: eq(smileWebhookEvent.id, id),
  });
  return result ?? null;
}

/**
 * Save smile webhook event to database
 * @param data - Webhook event data
 * @returns Created webhook event
 */
export async function saveSmileWebhookEventToDatabase(data: {
  jobId: string;
  signature: string;
  rawPayload: string;
  eventType: string;
  status: string;
}) {
  const db = getDb();
  const [created] = await db
    .insert(smileWebhookEvent)
    .values({
      jobId: data.jobId,
      signature: data.signature,
      rawPayload: data.rawPayload,
      eventType: data.eventType,
      status: data.status,
    })
    .returning();

  return created ?? null;
}

/**
 * Update smile webhook event status in database by ID
 * @param id - Webhook event ID
 * @param status - New status
 * @param errorMessage - Optional error message
 */
export async function updateSmileWebhookEventStatusInDatabaseById(
  id: string,
  status: string,
  errorMessage?: string,
) {
  const db = getDb();
  await db
    .update(smileWebhookEvent)
    .set({
      status,
      errorMessage,
      processedAt: status === "processed" ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(smileWebhookEvent.id, id));
}

/**
 * Retrieve verification job from database by Smile job ID
 * @param smileJobId - The Smile job ID
 * @returns Verification job or null
 */
export async function retrieveVerificationJobFromDatabaseBySmileId(smileJobId: string) {
  const db = getDb();
  const result = await db.query.verificationJob.findFirst({
    where: eq(verificationJob.smileJobId, smileJobId),
  });
  return result ?? null;
}

/**
 * Update verification job in database
 * @param smileJobId - The Smile job ID
 * @param data - Data to update
 * @returns Updated verification job
 */
export async function updateVerificationJobInDatabase(
  smileJobId: string,
  data: {
    status?: "pending" | "completed" | "failed" | "cancelled";
    resultCode?: string;
    resultText?: string;
    rawResult?: Record<string, unknown>;
  },
) {
  const db = getDb();

  const [updated] = await db
    .update(verificationJob)
    .set({
      status: data.status,
      resultCode: data.resultCode,
      resultText: data.resultText,
      rawResult: data.rawResult ? JSON.stringify(data.rawResult) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(verificationJob.smileJobId, smileJobId))
    .returning();

  return updated ?? null;
}

/**
 * Retrieve user KYC status from database by user ID
 * @param userId - The user ID
 * @returns User KYC status or null
 */
export async function retrieveUserKycStatusFromDatabaseByUser(userId: string) {
  const db = getDb();
  const result = await db.query.userKycStatus.findFirst({
    where: eq(userKycStatus.userId, userId),
  });
  return result ?? null;
}

/**
 * Save user KYC status to database
 * @param userId - The user ID
 * @param data - KYC status data
 * @returns Created KYC status
 */
export async function saveUserKycStatusToDatabase(
  userId: string,
  data: {
    kycStatus: "PENDING" | "VERIFIED" | "REJECTED" | "REQUIRES_INPUT";
    kycVerifiedAt?: Date | null;
    smileJobId?: string | null;
  },
) {
  const db = getDb();

  const [created] = await db
    .insert(userKycStatus)
    .values({
      userId,
      ...data,
    })
    .returning();

  return created ?? null;
}

/**
 * Update user KYC status in database
 * @param userId - The user ID
 * @param data - KYC status data to update
 * @returns Updated KYC status
 */
export async function updateUserKycStatusInDatabase(
  userId: string,
  data: {
    kycStatus: "PENDING" | "VERIFIED" | "REJECTED" | "REQUIRES_INPUT";
    kycVerifiedAt?: Date | null;
    smileJobId?: string | null;
  },
) {
  const db = getDb();

  const [updated] = await db
    .update(userKycStatus)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(userKycStatus.userId, userId))
    .returning();

  return updated ?? null;
}
