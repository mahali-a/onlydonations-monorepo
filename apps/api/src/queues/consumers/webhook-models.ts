import { getDb } from "@repo/core/database/setup";
import type { SelectPaymentTransaction } from "@repo/core/database/types";
import { eq } from "@repo/core/drizzle";
import { campaign, donation, paymentTransaction, webhookEvent } from "@repo/core/drizzle/schema";

/**
 * Retrieve webhook event from database by ID
 * @param id - Webhook event ID
 * @returns Webhook event or null
 */
export async function retrieveWebhookEventFromDatabaseById(id: string) {
  const db = getDb();
  const result = await db.select().from(webhookEvent).where(eq(webhookEvent.id, id)).limit(1);

  return result[0] || null;
}

/**
 * Update webhook event status in database by ID
 * @param id - Webhook event ID
 * @param status - New status
 * @param errorMessage - Optional error message
 */
export async function updateWebhookEventStatusInDatabaseById(
  id: string,
  status: string,
  errorMessage?: string,
) {
  const db = getDb();
  await db
    .update(webhookEvent)
    .set({
      status,
      errorMessage,
      processedAt: status === "PROCESSED" ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(webhookEvent.id, id));
}

/**
 * Retrieve donation from database by reference
 * @param reference - Payment reference
 * @returns Donation or null
 */
export async function retrieveDonationFromDatabaseByReference(reference: string) {
  const db = getDb();
  const result = await db
    .select({
      id: donation.id,
      status: donation.status,
      reference: donation.reference,
      campaignId: donation.campaignId,
      amount: donation.amount,
      currency: donation.currency,
      paymentTransactionId: donation.paymentTransactionId,
    })
    .from(donation)
    .where(eq(donation.reference, reference))
    .limit(1);

  return result[0] || null;
}

/**
 * Update donation status in database by ID
 * @param id - Donation ID
 * @param status - New status
 * @param additionalData - Optional additional data
 */
export async function updateDonationStatusInDatabaseById(
  id: string,
  status: "SUCCESS" | "FAILED" | "PENDING",
  additionalData?: {
    completedAt?: Date;
    failedAt?: Date;
    failureReason?: string;
    processorFees?: number;
    netAmount?: number;
  },
) {
  const db = getDb();
  await db
    .update(donation)
    .set({
      status,
      completedAt: additionalData?.completedAt,
      failedAt: additionalData?.failedAt,
      failureReason: additionalData?.failureReason,
      processorFees: additionalData?.processorFees,
      netAmount: additionalData?.netAmount,
      updatedAt: new Date(),
    })
    .where(eq(donation.id, id));
}

/**
 * Update payment transaction status in database by ID
 * @param id - Payment transaction ID
 * @param status - New status
 * @param additionalData - Optional additional data
 */
export async function updatePaymentTransactionStatusInDatabaseById(
  id: string,
  status:
    | "SUCCESS"
    | "FAILED"
    | "PENDING"
    | "REVERSED"
    | "OTP"
    | "ABANDONED"
    | "BLOCKED"
    | "REJECTED",
  additionalData?: {
    completedAt?: Date;
    processorTransactionId?: string;
    statusMessage?: string;
  },
) {
  const db = getDb();
  await db
    .update(paymentTransaction)
    .set({
      status,
      completedAt: additionalData?.completedAt,
      processorTransactionId: additionalData?.processorTransactionId,
      statusMessage: additionalData?.statusMessage,
      updatedAt: new Date(),
    })
    .where(eq(paymentTransaction.id, id));
}

/**
 * Retrieve payment transaction from database by processor reference
 * @param processorRef - The processor reference (e.g., withdrawal reference)
 * @returns Payment transaction or null
 */
export async function retrievePaymentTransactionFromDatabaseByProcessorRef(
  processorRef: string,
): Promise<SelectPaymentTransaction | null> {
  const db = getDb();
  const result = await db
    .select()
    .from(paymentTransaction)
    .where(eq(paymentTransaction.processorRef, processorRef))
    .limit(1);

  return result[0] || null;
}

/**
 * Retrieve donation with campaign from database by donation ID
 * @param donationId - Donation ID
 * @returns Donation with campaign data or null
 */
export async function retrieveDonationWithCampaignFromDatabaseById(donationId: string) {
  const db = getDb();
  const result = await db
    .select({
      campaignId: donation.campaignId,
      donorEmail: donation.donorEmail,
      donorName: donation.donorName,
      amount: donation.netAmount,
      currency: donation.currency,
      campaignTitle: campaign.title,
      campaignSlug: campaign.slug,
      thankYouMessage: campaign.thankYouMessage,
    })
    .from(donation)
    .innerJoin(campaign, eq(donation.campaignId, campaign.id))
    .where(eq(donation.id, donationId))
    .limit(1);

  return result[0] || null;
}
