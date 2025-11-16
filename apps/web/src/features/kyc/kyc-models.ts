import { getDb } from "@repo/core/database/setup";
import { smileWebhookEvent, userKycStatus, verificationJob } from "@repo/core/drizzle/schema";
import { eq } from "@repo/core/drizzle";

export const kycModel = {
  async retrieveUserKycStatusFromDatabaseByUser(userId: string) {
    const db = getDb();
    const result = await db.query.userKycStatus.findFirst({
      where: eq(userKycStatus.userId, userId),
    });
    return result;
  },

  async saveUserKycStatusToDatabase(
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

    return created;
  },

  async updateUserKycStatusInDatabase(
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

    return updated;
  },

  async saveVerificationJobToDatabase(data: {
    userId: string;
    smileJobId: string;
    product: "biometric_kyc" | "doc_verification" | "authentication";
  }) {
    const db = getDb();

    const [job] = await db
      .insert(verificationJob)
      .values({
        userId: data.userId,
        smileJobId: data.smileJobId,
        product: data.product,
        status: "pending",
      })
      .returning();

    return job;
  },

  async updateVerificationJobInDatabase(
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

    return updated;
  },

  async retrieveVerificationJobFromDatabaseBySmileId(smileJobId: string) {
    const db = getDb();
    const result = await db.query.verificationJob.findFirst({
      where: eq(verificationJob.smileJobId, smileJobId),
    });
    return result;
  },

  async retrieveVerificationJobsFromDatabaseByUser(userId: string) {
    const db = getDb();
    const jobs = await db.query.verificationJob.findMany({
      where: eq(verificationJob.userId, userId),
      orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
    });
    return jobs;
  },

  async retrieveSmileWebhookEventFromDatabaseByJobId(jobId: string) {
    const db = getDb();
    const result = await db.query.smileWebhookEvent.findFirst({
      where: eq(smileWebhookEvent.jobId, jobId),
    });
    return result;
  },

  async saveSmileWebhookEventToDatabase(data: {
    jobId: string;
    signature: string;
    rawPayload: Record<string, unknown>;
    eventType?: string;
  }) {
    const db = getDb();

    const [event] = await db
      .insert(smileWebhookEvent)
      .values({
        jobId: data.jobId,
        signature: data.signature,
        rawPayload: JSON.stringify(data.rawPayload),
        eventType: data.eventType || "verification_complete",
        status: "pending",
      })
      .returning();

    return event;
  },

  async updateSmileWebhookEventInDatabase(
    id: string,
    data: {
      status?: "pending" | "processed" | "failed";
      processedAt?: Date;
      errorMessage?: string;
    },
  ) {
    const db = getDb();

    const [updated] = await db
      .update(smileWebhookEvent)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(smileWebhookEvent.id, id))
      .returning();

    return updated;
  },
};
