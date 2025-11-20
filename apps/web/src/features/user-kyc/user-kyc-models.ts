import { getDb } from "@repo/core/database/setup";
import { smileWebhookEvent, userKycStatus, verificationJob } from "@repo/core/drizzle/schema";
import { eq } from "@repo/core/drizzle";

export type KycProduct = "biometric_kyc" | "doc_verification" | "authentication";

export type KycStatus = "PENDING" | "VERIFIED" | "REJECTED" | "REQUIRES_INPUT";

export type SmileIdentityConfig = {
  token: string;
  product: string;
  callback_url: string;
  environment: string;
  partner_details: {
    partner_id: string;
    name: string;
    logo_url?: string;
    policy_url?: string;
    theme_color?: string;
  };
  partner_params: {
    job_id: string;
    user_id: string;
    internal_reference: string;
  };
  document_capture_modes: string[];
  allow_agent_mode: boolean;
  onSuccess: (data: Record<string, unknown>) => void;
  onError: (error: Error | Record<string, unknown> | string) => void;
  onClose: () => void;
};

declare global {
  interface Window {
    SmileIdentity: (config: SmileIdentityConfig) => void;
  }
}

export type SmileTokenRequest = {
  user_id: string;
  job_id: string;
  product: KycProduct;
  callback_url: string;
};

export type SmileTokenResponse = {
  token: string;
  jobId: string;
  userId: string;
};

export type SmileWebhookPayload = {
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

export async function retrieveUserKycStatusFromDatabaseByUser(userId: string) {
  const db = getDb();
  const result = await db.query.userKycStatus.findFirst({
    where: eq(userKycStatus.userId, userId),
  });
  return result;
}

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

  return created;
}

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

  return updated;
}

export async function saveVerificationJobToDatabase(data: {
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
}

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

  return updated;
}

export async function retrieveVerificationJobFromDatabaseBySmileId(smileJobId: string) {
  const db = getDb();
  const result = await db.query.verificationJob.findFirst({
    where: eq(verificationJob.smileJobId, smileJobId),
  });
  return result;
}

export async function retrieveVerificationJobsFromDatabaseByUser(userId: string) {
  const db = getDb();
  const jobs = await db.query.verificationJob.findMany({
    where: eq(verificationJob.userId, userId),
    orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
  });
  return jobs;
}

export async function retrieveSmileWebhookEventFromDatabaseByJobId(jobId: string) {
  const db = getDb();
  const result = await db.query.smileWebhookEvent.findFirst({
    where: eq(smileWebhookEvent.jobId, jobId),
  });
  return result;
}

export async function saveSmileWebhookEventToDatabase(data: {
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
}

export async function updateSmileWebhookEventInDatabase(
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
}
