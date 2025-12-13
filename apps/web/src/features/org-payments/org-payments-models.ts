import { getDb } from "@repo/core/database/setup";
import type {
  InsertPaymentTransaction,
  InsertWithdrawalAccount,
  SelectPaymentTransaction,
  SelectWithdrawalAccount,
} from "@repo/core/database/types";
import { and, desc, eq, gte, isNull, lte, sql, sum } from "@repo/core/drizzle";
import {
  campaign,
  donation,
  paymentTransaction,
  withdrawalAccount,
} from "@repo/core/drizzle/schema";

/**
 * Retrieve total raised by organization across all donations
 */
export async function retrieveTotalRaisedFromDatabaseByOrganization(
  organizationId: string,
): Promise<{
  totalRaised: number;
  currency: string | null;
}> {
  const db = getDb();

  const result = await db
    .select({
      totalRaised: sum(donation.netAmount),
      currency: donation.currency,
    })
    .from(donation)
    .innerJoin(campaign, eq(donation.campaignId, campaign.id))
    .where(
      and(
        eq(campaign.organizationId, organizationId),
        eq(donation.status, "SUCCESS"),
        isNull(campaign.deletedAt),
      ),
    )
    .groupBy(donation.currency);

  if (result.length === 0) {
    return { totalRaised: 0, currency: null };
  }

  const totalRaised = result.reduce((sum, row) => sum + Number(row.totalRaised ?? 0), 0);
  const primaryCurrency = result[0]?.currency ?? null;

  return {
    totalRaised,
    currency: primaryCurrency,
  };
}

/**
 * Retrieve total raised by organization within a specific date range
 */
export async function retrieveTotalRaisedFromDatabaseByOrganizationAndPeriod(
  organizationId: string,
  startDate: Date,
  endDate: Date,
): Promise<number> {
  const db = getDb();

  const result = await db
    .select({
      totalRaised: sum(donation.netAmount),
    })
    .from(donation)
    .innerJoin(campaign, eq(donation.campaignId, campaign.id))
    .where(
      and(
        eq(campaign.organizationId, organizationId),
        eq(donation.status, "SUCCESS"),
        isNull(campaign.deletedAt),
        gte(donation.createdAt, startDate),
        lte(donation.createdAt, endDate),
      ),
    )
    .limit(1);

  return Number(result[0]?.totalRaised) || 0;
}

/**
 * Retrieve donation aggregate (total raised and count) by organization
 */
export async function retrieveDonationAggregateFromDatabaseByOrganization(
  organizationId: string,
): Promise<{
  totalRaised: number;
  donationCount: number;
}> {
  const db = getDb();
  const result = await db
    .select({
      totalRaised: sum(donation.netAmount),
      donationCount: sql<number>`CAST(COUNT(${donation.id}) AS INTEGER)`,
    })
    .from(donation)
    .innerJoin(campaign, eq(donation.campaignId, campaign.id))
    .where(
      and(
        eq(campaign.organizationId, organizationId),
        eq(donation.status, "SUCCESS"),
        isNull(campaign.deletedAt),
      ),
    )
    .limit(1);

  return {
    totalRaised: Number(result[0]?.totalRaised ?? 0),
    donationCount: Number(result[0]?.donationCount ?? 0),
  };
}

/**
 * Retrieve daily donation aggregate by organization
 */
export async function retrieveDailyDonationAggregateFromDatabaseByOrganization(
  organizationId: string,
): Promise<Array<{ date: string; amount: number; count: number }>> {
  const db = getDb();

  const result = await db
    .select({
      date: sql<string>`DATE(datetime(${donation.createdAt}, 'unixepoch'))`.as("date"),
      amount: sum(donation.netAmount),
      count: sql<number>`CAST(COUNT(${donation.id}) AS INTEGER)`.as("count"),
    })
    .from(donation)
    .innerJoin(campaign, eq(donation.campaignId, campaign.id))
    .where(
      and(
        eq(campaign.organizationId, organizationId),
        eq(donation.status, "SUCCESS"),
        isNull(campaign.deletedAt),
      ),
    )
    .groupBy(sql`DATE(datetime(${donation.createdAt}, 'unixepoch'))`)
    .orderBy(sql`DATE(datetime(${donation.createdAt}, 'unixepoch'))`);

  return result.map((row) => ({
    date: row.date,
    amount: Number(row.amount ?? 0),
    count: Number(row.count ?? 0),
  }));
}

/**
 * Retrieve campaign donation stats by organization with pagination
 */
export async function retrieveCampaignDonationStatsFromDatabaseByOrganization(
  organizationId: string,
  page: number = 1,
  limit: number = 10,
): Promise<
  Array<{
    campaignId: string;
    campaignTitle: string;
    campaignSlug: string;
    campaignStatus: string;
    goalAmount: number;
    currency: string;
    totalRaised: number;
    donationCount: number;
  }>
> {
  const db = getDb();
  const offset = (page - 1) * limit;

  const result = await db
    .select({
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      campaignSlug: campaign.slug,
      campaignStatus: campaign.status,
      goalAmount: campaign.amount,
      currency: campaign.currency,
      totalRaised: sum(donation.netAmount),
      donationCount: sql<number>`CAST(COUNT(${donation.id}) AS INTEGER)`,
    })
    .from(campaign)
    .leftJoin(donation, and(eq(donation.campaignId, campaign.id), eq(donation.status, "SUCCESS")))
    .where(and(eq(campaign.organizationId, organizationId), isNull(campaign.deletedAt)))
    .groupBy(
      campaign.id,
      campaign.title,
      campaign.slug,
      campaign.status,
      campaign.amount,
      campaign.currency,
    )
    .orderBy(desc(sql`${sum(donation.netAmount)}`))
    .limit(limit)
    .offset(offset);

  return result.map((row) => ({
    campaignId: row.campaignId,
    campaignTitle: row.campaignTitle,
    campaignSlug: row.campaignSlug,
    campaignStatus: row.campaignStatus ?? "DRAFT",
    goalAmount: row.goalAmount,
    currency: row.currency,
    totalRaised: Number(row.totalRaised ?? 0),
    donationCount: Number(row.donationCount ?? 0),
  }));
}

/**
 * Retrieve total campaign count by organization
 */
export async function retrieveTotalCampaignCountFromDatabaseByOrganization(
  organizationId: string,
): Promise<number> {
  const db = getDb();
  const result = await db
    .select({
      count: sql<number>`CAST(COUNT(${campaign.id}) AS INTEGER)`,
    })
    .from(campaign)
    .where(and(eq(campaign.organizationId, organizationId), isNull(campaign.deletedAt)));

  return Number(result[0]?.count ?? 0);
}

/**
 * Retrieve payment transaction by ID
 */
export async function retrievePaymentTransactionFromDatabaseById(
  id: string,
): Promise<SelectPaymentTransaction | null> {
  const db = getDb();
  const result = await db.select().from(paymentTransaction).where(eq(paymentTransaction.id, id));
  return result[0] ?? null;
}

/**
 * Retrieve payment transaction by processor reference
 */
export async function retrievePaymentTransactionFromDatabaseByProcessorRef(
  processorRef: string,
): Promise<SelectPaymentTransaction | null> {
  const db = getDb();
  const result = await db
    .select()
    .from(paymentTransaction)
    .where(eq(paymentTransaction.processorRef, processorRef));
  return result[0] ?? null;
}

/**
 * Save payment transaction to database
 */
export async function savePaymentTransactionToDatabase(
  data: InsertPaymentTransaction,
): Promise<SelectPaymentTransaction | null> {
  const db = getDb();
  const [result] = await db.insert(paymentTransaction).values(data).returning();
  return result ?? null;
}

/**
 * Update payment transaction in database
 */
export async function updatePaymentTransactionInDatabase(
  id: string,
  data: Partial<InsertPaymentTransaction>,
): Promise<SelectPaymentTransaction | null> {
  const db = getDb();
  const [result] = await db
    .update(paymentTransaction)
    .set(data)
    .where(eq(paymentTransaction.id, id))
    .returning();
  return result ?? null;
}

/**
 * Update payment transaction status in database by ID.
 * Marks payment transaction as completed, failed, or other status.
 *
 * @param id - Payment transaction ID
 * @param status - New status (SUCCESS, FAILED, PENDING, etc.)
 * @param additionalData - Optional completed timestamp, status message, and processor transaction ID
 * @returns The updated payment transaction record
 */
export async function updatePaymentTransactionStatusInDatabaseById(
  id: string,
  status: string,
  additionalData?: {
    completedAt?: Date;
    statusMessage?: string;
    processorTransactionId?: string;
  },
) {
  const db = getDb();
  const updateData: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };

  if (additionalData?.completedAt) {
    updateData.completedAt = additionalData.completedAt;
  }
  if (additionalData?.statusMessage) {
    updateData.statusMessage = additionalData.statusMessage;
  }
  if (additionalData?.processorTransactionId) {
    updateData.processorTransactionId = additionalData.processorTransactionId;
  }

  const [updated] = await db
    .update(paymentTransaction)
    .set(updateData)
    .where(eq(paymentTransaction.id, id))
    .returning({
      id: paymentTransaction.id,
      status: paymentTransaction.status,
    });

  return updated || null;
}

/**
 * Retrieve payment transaction withdrawals by organization
 */
export async function retrievePaymentTransactionWithdrawalsFromDatabaseByOrganization(
  organizationId: string,
): Promise<SelectPaymentTransaction[]> {
  const db = getDb();
  const result = await db
    .select()
    .from(paymentTransaction)
    .where(
      and(
        eq(paymentTransaction.organizationId, organizationId),
        eq(paymentTransaction.processor, "paystack_transfer"),
      ),
    )
    .orderBy(desc(paymentTransaction.createdAt));
  return result;
}

/**
 * Retrieve withdrawal aggregate by organization and status
 */
export async function retrieveWithdrawalAggregateFromDatabaseByOrganizationAndStatus(
  organizationId: string,
  status: "SUCCESS" | "PENDING",
): Promise<number> {
  const db = getDb();
  const result = await db
    .select({
      total: sum(paymentTransaction.amount),
    })
    .from(paymentTransaction)
    .where(
      and(
        eq(paymentTransaction.organizationId, organizationId),
        eq(paymentTransaction.processor, "paystack_transfer"),
        eq(paymentTransaction.status, status),
      ),
    );

  return Number(result[0]?.total) || 0;
}

export async function retrieveWithdrawalAccountFromDatabaseById(
  id: string,
  organizationId: string,
): Promise<SelectWithdrawalAccount | null> {
  const db = getDb();
  const result = await db
    .select()
    .from(withdrawalAccount)
    .where(
      and(
        eq(withdrawalAccount.id, id),
        eq(withdrawalAccount.organizationId, organizationId),
        isNull(withdrawalAccount.deletedAt),
      ),
    );
  return result[0] ?? null;
}

export async function retrieveWithdrawalAccountsFromDatabaseByOrganization(
  organizationId: string,
): Promise<SelectWithdrawalAccount[]> {
  const db = getDb();
  return await db
    .select()
    .from(withdrawalAccount)
    .where(
      and(
        eq(withdrawalAccount.organizationId, organizationId),
        isNull(withdrawalAccount.deletedAt),
      ),
    );
}

export async function saveWithdrawalAccountToDatabase(
  data: InsertWithdrawalAccount,
): Promise<SelectWithdrawalAccount | null> {
  const db = getDb();
  const [result] = await db.insert(withdrawalAccount).values(data).returning();
  return result ?? null;
}

export async function deleteWithdrawalAccountInDatabase(
  id: string,
  organizationId: string,
): Promise<boolean> {
  const db = getDb();
  const [result] = await db
    .update(withdrawalAccount)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(withdrawalAccount.id, id),
        eq(withdrawalAccount.organizationId, organizationId),
        isNull(withdrawalAccount.deletedAt),
      ),
    )
    .returning({ id: withdrawalAccount.id });
  return !!result;
}
