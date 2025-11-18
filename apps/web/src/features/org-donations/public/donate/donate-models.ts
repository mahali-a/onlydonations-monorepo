import { getDb } from "@repo/core/database/setup";
import { campaign, category, donation } from "@repo/core/drizzle/schema";
import { and, eq, isNull, sql } from "@repo/core/drizzle";

export async function retrieveCampaignWithCategoryFromDatabaseBySlug(slug: string) {
  const db = getDb();
  const result = await db
    .select({
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      beneficiaryName: campaign.beneficiaryName,
      coverImage: campaign.coverImage,
      currency: campaign.currency,
      amount: campaign.amount,
      status: campaign.status,
      endDate: campaign.endDate,
      feeHandling: campaign.feeHandling,
      donateButtonText: campaign.donateButtonText,
      categoryId: campaign.categoryId,
      categoryName: category.name,
      totalRaised:
        sql<number>`COALESCE((SELECT SUM(${donation.amount}) FROM ${donation} WHERE ${donation.campaignId} = ${campaign.id} AND ${donation.status} = 'SUCCESS'), 0)`.as(
          "totalRaised",
        ),
    })
    .from(campaign)
    .leftJoin(category, eq(campaign.categoryId, category.id))
    .where(and(eq(campaign.slug, slug), isNull(campaign.deletedAt)))
    .limit(1);

  const row = result[0];
  if (!row) return null;

  return {
    ...row,
    totalRaised: Number(row.totalRaised) || 0,
    feeHandling: row.feeHandling as "DONOR_ASK_COVER" | "DONOR_REQUIRE_COVER" | "CAMPAIGN_ABSORB",
  };
}

export async function retrieveCampaignFromDatabaseBySlug(slug: string) {
  const db = getDb();
  const result = await db
    .select({
      id: campaign.id,
      feeHandling: campaign.feeHandling,
      status: campaign.status,
      endDate: campaign.endDate,
      organizationId: campaign.organizationId,
    })
    .from(campaign)
    .where(and(eq(campaign.slug, slug), isNull(campaign.deletedAt)))
    .limit(1);

  return result[0] || null;
}

export async function saveDonationToDatabase(data: {
  id: string;
  campaignId: string;
  amount: number;
  currency: string;
  reference: string;
  donorId: string | null;
  donorName: string | null;
  donorEmail: string;
  donorMessage: string | null;
  isAnonymous: boolean;
  coverFees: boolean;
}) {
  const db = getDb();
  const [created] = await db
    .insert(donation)
    .values({
      ...data,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({
      id: donation.id,
      reference: donation.reference,
    });

  return created || null;
}

export async function retrieveDonationFromDatabaseByIdWithCampaign(donationId: string) {
  const db = getDb();
  const result = await db
    .select({
      id: donation.id,
      amount: donation.amount,
      currency: donation.currency,
      status: donation.status,
      donorName: donation.donorName,
      isAnonymous: donation.isAnonymous,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt,
      campaignTitle: campaign.title,
      campaignSlug: campaign.slug,
    })
    .from(donation)
    .innerJoin(campaign, eq(donation.campaignId, campaign.id))
    .where(eq(donation.id, donationId))
    .limit(1);

  return result[0] || null;
}

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

export async function updateDonationStatusInDatabaseById(
  donationId: string,
  status: "SUCCESS" | "FAILED" | "PENDING",
  additionalData?: {
    completedAt?: Date;
    failedAt?: Date;
    failureReason?: string;
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
  if (additionalData?.failedAt) {
    updateData.failedAt = additionalData.failedAt;
  }
  if (additionalData?.failureReason) {
    updateData.failureReason = additionalData.failureReason;
  }

  const [updated] = await db
    .update(donation)
    .set(updateData)
    .where(eq(donation.id, donationId))
    .returning({
      id: donation.id,
      status: donation.status,
    });

  return updated || null;
}

export async function updateDonationPaymentTransactionInDatabaseById(
  donationId: string,
  paymentTransactionId: string,
) {
  const db = getDb();
  const [updated] = await db
    .update(donation)
    .set({
      paymentTransactionId,
      updatedAt: new Date(),
    })
    .where(eq(donation.id, donationId))
    .returning({
      id: donation.id,
      paymentTransactionId: donation.paymentTransactionId,
    });

  return updated || null;
}
