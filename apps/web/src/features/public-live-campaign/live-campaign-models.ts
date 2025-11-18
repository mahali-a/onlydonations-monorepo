import { getDb } from "@repo/core/database/setup";
import { campaign, category, donation } from "@repo/core/drizzle/schema";
import { and, count, desc, eq, gt, isNotNull, isNull, lte, or, sum } from "@repo/core/drizzle";

/**
 * Build conditions for filtering public campaigns
 * - Must be ACTIVE status
 * - Not deleted
 * - Published
 * - Not ended (or no end date)
 */
function buildPublicCampaignConditions(now: Date) {
  return [
    eq(campaign.status, "ACTIVE"),
    isNull(campaign.deletedAt),
    isNotNull(campaign.publishedAt),
    lte(campaign.publishedAt, now),
    or(isNull(campaign.endDate), gt(campaign.endDate, now)),
  ];
}

/**
 * Retrieve a live campaign by slug with aggregated stats
 * Optimized for live display with minimal fields
 * @param slug - Campaign slug
 * @returns Campaign with totalRaised and donationCount
 */
export async function retrieveLiveCampaignBySlug(slug: string) {
  const db = getDb();
  const now = new Date();

  const result = await db
    .select({
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      beneficiaryName: campaign.beneficiaryName,
      amount: campaign.amount,
      currency: campaign.currency,
      coverImage: campaign.coverImage,
      categoryName: category.name,
      totalRaised: sum(donation.amount),
      donationCount: count(donation.id),
    })
    .from(campaign)
    .innerJoin(category, eq(campaign.categoryId, category.id))
    .leftJoin(donation, and(eq(donation.campaignId, campaign.id), eq(donation.status, "SUCCESS")))
    .where(and(...buildPublicCampaignConditions(now), eq(campaign.slug, slug)))
    .groupBy(campaign.id, category.id)
    .limit(1);

  if (!result[0]) {
    return null;
  }

  return {
    ...result[0],
    totalRaised: Number(result[0].totalRaised) || 0,
    donationCount: Number(result[0].donationCount) || 0,
  };
}

/**
 * Retrieve recent donations for live feed
 * Anonymizes donor info if isAnonymous is true
 * @param campaignId - Campaign ID
 * @param limit - Number of donations to retrieve
 * @returns Array of recent donations
 */
export async function retrieveRecentLiveDonations(campaignId: string, limit: number = 10) {
  const db = getDb();

  const result = await db
    .select({
      id: donation.id,
      amount: donation.amount,
      currency: donation.currency,
      donorName: donation.donorName,
      isAnonymous: donation.isAnonymous,
      createdAt: donation.createdAt,
    })
    .from(donation)
    .where(and(eq(donation.campaignId, campaignId), eq(donation.status, "SUCCESS")))
    .orderBy(desc(donation.createdAt))
    .limit(limit);

  return result.map((d) => ({
    ...d,
    donorName: d.isAnonymous ? null : d.donorName,
  }));
}
