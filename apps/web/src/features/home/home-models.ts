import { getDb } from "@repo/core/database/setup";
import { and, count, desc, eq, gt, isNotNull, isNull, lte, or, sum } from "@repo/core/drizzle";
import { campaign, countries, donation } from "@repo/core/drizzle/schema";

import type { HomePageCampaign } from "./types";

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
 * Retrieve featured campaigns for the home page
 * Returns campaigns with aggregated donation stats
 * @param limit - Maximum number of campaigns to return (default 6)
 * @returns Array of campaigns formatted for the home page
 */
export async function retrieveFeaturedCampaignsFromDatabase(
  limit: number = 6,
): Promise<HomePageCampaign[]> {
  const db = getDb();
  const now = new Date();

  const result = await db
    .select({
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      coverImage: campaign.coverImage,
      amount: campaign.amount,
      currency: campaign.currency,
      beneficiaryName: campaign.beneficiaryName,
      countryName: countries.name,
      totalRaised: sum(donation.amount),
      supporterCount: count(donation.id),
    })
    .from(campaign)
    .leftJoin(countries, eq(campaign.country, countries.code))
    .leftJoin(donation, and(eq(donation.campaignId, campaign.id), eq(donation.status, "SUCCESS")))
    .where(and(...buildPublicCampaignConditions(now)))
    .groupBy(campaign.id, countries.name)
    .orderBy(desc(campaign.publishedAt))
    .limit(limit);

  return result.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    location: c.countryName || c.beneficiaryName || "Unknown",
    supporters: String(c.supporterCount || 0),
    raised: Number(c.totalRaised) || 0,
    target: c.amount,
    currency: c.currency,
    imageUrl: c.coverImage || "/images/marketing/home/campaign.png",
  }));
}
