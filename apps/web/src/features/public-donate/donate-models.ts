import { getDb } from "@repo/core/database/setup";
import { and, eq, isNull, sql } from "@repo/core/drizzle";
import { campaign, category, donation } from "@repo/core/drizzle/schema";

/**
 * Retrieve campaign with category from database by slug
 * @param slug - Campaign slug
 * @returns Campaign with category and total raised
 */
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
      seoTitle: campaign.seoTitle,
      seoDescription: campaign.seoDescription,
      seoImage: campaign.seoImage,
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

/**
 * Retrieve campaign from database by slug
 * @param slug - Campaign slug
 * @returns Campaign data
 */
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

/**
 * Save donation to database
 * @param data - Donation data
 * @returns Created donation
 */
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

/**
 * Retrieve donation from database by ID with campaign
 * @param donationId - Donation ID
 * @returns Donation with campaign data
 */
export async function retrieveDonationFromDatabaseByIdWithCampaign(donationId: string) {
  const db = getDb();
  const result = await db
    .select({
      id: donation.id,
      amount: donation.amount,
      currency: donation.currency,
      status: donation.status,
      donorName: donation.donorName,
      donorMessage: donation.donorMessage,
      isAnonymous: donation.isAnonymous,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      campaignSlug: campaign.slug,
    })
    .from(donation)
    .innerJoin(campaign, eq(donation.campaignId, campaign.id))
    .where(eq(donation.id, donationId))
    .limit(1);

  return result[0] || null;
}

/**
 * Update donation payment transaction in database by ID
 * @param donationId - Donation ID
 * @param paymentTransactionId - Payment transaction ID
 * @returns Updated donation
 */
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

/**
 * Update donation message in database by ID
 * @param donationId - Donation ID
 * @param message - Donor thank you message
 * @returns Updated donation
 */
export async function updateDonationMessageInDatabaseById(donationId: string, message: string) {
  const db = getDb();
  const [updated] = await db
    .update(donation)
    .set({
      donorMessage: message,
      messageStatus: "PENDING",
      showMessage: false, // Hidden until approved
      updatedAt: new Date(),
    })
    .where(eq(donation.id, donationId))
    .returning({
      id: donation.id,
      donorMessage: donation.donorMessage,
      messageStatus: donation.messageStatus,
      showMessage: donation.showMessage,
    });

  return updated || null;
}

/**
 * Retrieve donation with campaign from database by ID
 * @param donationId - Donation ID
 * @returns Donation with campaign data for sharing
 */
export async function retrieveDonationWithCampaignFromDatabaseById(donationId: string) {
  const db = getDb();
  const result = await db
    .select({
      id: donation.id,
      amount: donation.amount,
      currency: donation.currency,
      status: donation.status,
      donorName: donation.donorName,
      donorMessage: donation.donorMessage,
      messageStatus: donation.messageStatus,
      showMessage: donation.showMessage,
      isAnonymous: donation.isAnonymous,
      createdAt: donation.createdAt,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      campaignSlug: campaign.slug,
      campaignCoverImage: campaign.coverImage,
      campaignSeoTitle: campaign.seoTitle,
      campaignSeoDescription: campaign.seoDescription,
      campaignSeoImage: campaign.seoImage,
    })
    .from(donation)
    .innerJoin(campaign, eq(donation.campaignId, campaign.id))
    .where(eq(donation.id, donationId))
    .limit(1);

  return result[0] || null;
}
