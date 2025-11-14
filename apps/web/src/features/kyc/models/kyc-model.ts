import { getDb } from "@repo/core/database/setup";
import { smileWebhookEvent, userKycStatus, verificationJob } from "@repo/core/drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * KYC Model
 * KYC feature's database API
 * Pure data access - no business logic
 */
export const kycModel = {
  async getUserKycStatus(userId: string) {
    const db = getDb();
    const result = await db.query.userKycStatus.findFirst({
      where: eq(userKycStatus.userId, userId),
    });
    return result;
  },

  async createKycStatus(
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

  async updateKycStatus(
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

  async createVerificationJob(data: {
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

  async updateVerificationJob(
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
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(verificationJob.smileJobId, smileJobId))
      .returning();

    return updated;
  },

  async getVerificationJobBySmileId(smileJobId: string) {
    const db = getDb();
    const result = await db.query.verificationJob.findFirst({
      where: eq(verificationJob.smileJobId, smileJobId),
    });
    return result;
  },

  async getUserVerificationJobs(userId: string): Promise<
    Array<
      Omit<typeof verificationJob.$inferSelect, "rawResult"> & {
        rawResult: Record<string, unknown> | null;
      }
    >
  > {
    const db = getDb();
    const jobs = await db.query.verificationJob.findMany({
      where: eq(verificationJob.userId, userId),
      orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
    });
    return jobs.map((job) => ({
      ...job,
      rawResult: (job.rawResult ?? null) as Record<string, unknown> | null,
    }));
  },

  async getWebhookEventByJobId(jobId: string) {
    const db = getDb();
    const result = await db.query.smileWebhookEvent.findFirst({
      where: eq(smileWebhookEvent.jobId, jobId),
    });
    return result;
  },

  async createWebhookEvent(data: {
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
        rawPayload: data.rawPayload,
        eventType: data.eventType || "verification_complete",
        status: "pending",
      })
      .returning();

    return event;
  },

  async updateWebhookEvent(
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
