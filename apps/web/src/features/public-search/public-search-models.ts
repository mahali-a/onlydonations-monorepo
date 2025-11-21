import { getDb } from "@repo/core/database/setup";
import {
  and,
  count,
  desc,
  eq,
  gt,
  isNotNull,
  isNull,
  like,
  lte,
  or,
  sum,
} from "@repo/core/drizzle";
import { campaign, category, donation } from "@repo/core/drizzle/schema";
import type { SearchFilters } from "./public-search-schemas";

/**
 * Build conditions for filtering public campaigns
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
 * Retrieve public campaigns with category and donation stats by filters
 */
export async function retrievePublicCampaignsWithCategoryFromDatabaseByFilters(
  filters: SearchFilters,
) {
  const db = getDb();
  const now = new Date();
  const { query, categoryId, country, page, limit, sortBy } = filters;

  const conditions = [...buildPublicCampaignConditions(now)];

  // Full-text search on title, beneficiary name, and description
  if (query?.trim()) {
    const searchTerm = `%${query.trim()}%`;
    const searchCondition = or(
      like(campaign.title, searchTerm),
      like(campaign.beneficiaryName, searchTerm),
      like(campaign.description, searchTerm),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  // Category filter
  if (categoryId) {
    conditions.push(eq(campaign.categoryId, categoryId));
  }

  // Country filter
  if (country) {
    conditions.push(eq(campaign.country, country));
  }

  // Determine sort order
  const orderBy = sortBy === "raised" ? desc(sum(donation.amount)) : desc(campaign.publishedAt);

  const results = await db
    .select({
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      beneficiaryName: campaign.beneficiaryName,
      coverImage: campaign.coverImage,
      amount: campaign.amount,
      currency: campaign.currency,
      country: campaign.country,
      publishedAt: campaign.publishedAt,
      category: {
        id: category.id,
        name: category.name,
      },
      totalRaised: sum(donation.amount),
      donationCount: count(donation.id),
    })
    .from(campaign)
    .innerJoin(category, eq(campaign.categoryId, category.id))
    .leftJoin(donation, and(eq(donation.campaignId, campaign.id), eq(donation.status, "SUCCESS")))
    .where(and(...conditions))
    .groupBy(campaign.id, category.id)
    .orderBy(orderBy)
    .limit(limit)
    .offset((page - 1) * limit);

  return results.map((r) => ({
    ...r,
    totalRaised: Number(r.totalRaised) || 0,
    donationCount: Number(r.donationCount) || 0,
  }));
}

/**
 * Retrieve total count of public campaigns by filters for pagination
 */
export async function retrievePublicCampaignCountFromDatabaseByFilters(
  filters: SearchFilters,
): Promise<number> {
  const db = getDb();
  const now = new Date();
  const { query, categoryId, country } = filters;

  const conditions = [...buildPublicCampaignConditions(now)];

  if (query?.trim()) {
    const searchTerm = `%${query.trim()}%`;
    const searchCondition = or(
      like(campaign.title, searchTerm),
      like(campaign.beneficiaryName, searchTerm),
      like(campaign.description, searchTerm),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (categoryId) {
    conditions.push(eq(campaign.categoryId, categoryId));
  }

  if (country) {
    conditions.push(eq(campaign.country, country));
  }

  const result = await db
    .select({ value: count() })
    .from(campaign)
    .where(and(...conditions));

  return Number(result[0]?.value ?? 0);
}
