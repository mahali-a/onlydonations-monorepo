import { getDb } from "@repo/core/database/setup";
import { campaign, category, donation } from "@repo/core/drizzle/schema";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
  sum,
} from "@repo/core/drizzle";

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
 * Retrieve all enabled categories with their campaign counts
 * Only returns categories that have at least one active public campaign
 * @returns Array of categories with campaign counts, sorted by name
 */
export async function retrieveCategoriesWithCampaignCountsFromDatabase() {
  const db = getDb();
  const now = new Date();

  const result = await db
    .select({
      id: category.id,
      name: category.name,
      campaignCount: count(campaign.id),
    })
    .from(category)
    .leftJoin(
      campaign,
      and(eq(campaign.categoryId, category.id), ...buildPublicCampaignConditions(now)),
    )
    .where(eq(category.enabled, true))
    .groupBy(category.id)
    .having(gt(count(campaign.id), 0))
    .orderBy(asc(category.name));

  return result;
}

/**
 * Retrieve campaigns by category ID with aggregated stats
 * @param categoryId - The category ID to filter by
 * @param limit - Maximum number of campaigns to return
 * @returns Array of campaigns with total raised amounts
 */
export async function retrieveCampaignsByCategoryIdFromDatabase(
  categoryId: string,
  limit: number = 10,
) {
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
      categoryName: category.name,
      totalRaised: sum(donation.amount),
    })
    .from(campaign)
    .innerJoin(category, eq(campaign.categoryId, category.id))
    .leftJoin(donation, and(eq(donation.campaignId, campaign.id), eq(donation.status, "SUCCESS")))
    .where(and(...buildPublicCampaignConditions(now), eq(campaign.categoryId, categoryId)))
    .groupBy(campaign.id, category.id)
    .orderBy(desc(campaign.publishedAt))
    .limit(limit);

  return result.map((c) => ({
    ...c,
    totalRaised: Number(c.totalRaised) || 0,
  }));
}

/**
 * Retrieve campaigns by category name (slug)
 * @param categoryName - The category name to filter by (case-insensitive)
 * @param limit - Maximum number of campaigns to return
 * @returns Array of campaigns with total raised amounts
 */
export async function retrieveCampaignsByCategoryNameFromDatabase(
  categoryName: string,
  limit: number = 20,
) {
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
      categoryId: category.id,
      categoryName: category.name,
      totalRaised: sum(donation.amount),
    })
    .from(campaign)
    .innerJoin(category, eq(campaign.categoryId, category.id))
    .leftJoin(donation, and(eq(donation.campaignId, campaign.id), eq(donation.status, "SUCCESS")))
    .where(
      and(
        ...buildPublicCampaignConditions(now),
        eq(sql`lower(${category.name})`, categoryName.toLowerCase()),
      ),
    )
    .groupBy(campaign.id, category.id)
    .orderBy(desc(campaign.publishedAt))
    .limit(limit);

  return result.map((c) => ({
    ...c,
    totalRaised: Number(c.totalRaised) || 0,
  }));
}

/**
 * Retrieve trending campaigns (most recently donated to)
 * @param limit - Maximum number of campaigns to return
 * @returns Array of campaigns ordered by recent donation activity
 */
export async function retrieveTrendingCampaignsFromDatabase(limit: number = 10) {
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
      categoryName: category.name,
      totalRaised: sum(donation.amount),
      lastDonation: sql<Date>`max(${donation.completedAt})`.as("lastDonation"),
    })
    .from(campaign)
    .innerJoin(category, eq(campaign.categoryId, category.id))
    .leftJoin(donation, and(eq(donation.campaignId, campaign.id), eq(donation.status, "SUCCESS")))
    .where(and(...buildPublicCampaignConditions(now)))
    .groupBy(campaign.id, category.id)
    .orderBy(desc(sql`max(${donation.completedAt})`), desc(campaign.publishedAt))
    .limit(limit);

  return result.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    coverImage: c.coverImage,
    amount: c.amount,
    currency: c.currency,
    beneficiaryName: c.beneficiaryName,
    categoryName: c.categoryName,
    totalRaised: Number(c.totalRaised) || 0,
  }));
}

/**
 * Retrieve category details by name
 * @param categoryName - The category name (case-insensitive)
 * @returns Category details or null if not found
 */
export async function retrieveCategoryByNameFromDatabase(categoryName: string) {
  const db = getDb();

  const result = await db
    .select({
      id: category.id,
      name: category.name,
    })
    .from(category)
    .where(
      and(eq(category.enabled, true), eq(sql`lower(${category.name})`, categoryName.toLowerCase())),
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Retrieve discover page data with categories and their campaigns
 * @param campaignsPerCategory - Number of campaigns to show per category
 * @returns Object with trending campaigns and categories with their campaigns
 */
export async function retrieveDiscoverPageDataFromDatabase(campaignsPerCategory: number = 3) {
  // Get categories with campaigns
  const categoriesWithCounts = await retrieveCategoriesWithCampaignCountsFromDatabase();

  // Get trending campaigns
  const trending = await retrieveTrendingCampaignsFromDatabase(campaignsPerCategory);

  // Get campaigns for each category
  const categoriesWithCampaigns = await Promise.all(
    categoriesWithCounts.map(async (cat) => {
      const campaigns = await retrieveCampaignsByCategoryIdFromDatabase(
        cat.id,
        campaignsPerCategory,
      );
      return {
        id: cat.id,
        name: cat.name,
        campaigns,
      };
    }),
  );

  // Filter out categories with no campaigns
  const filteredCategories = categoriesWithCampaigns.filter((cat) => cat.campaigns.length > 0);

  return {
    trending,
    categories: filteredCategories,
    allCategories: categoriesWithCounts,
  };
}

export type CategoryWithCount = Awaited<
  ReturnType<typeof retrieveCategoriesWithCampaignCountsFromDatabase>
>[number];

export type DiscoverCampaign = Awaited<
  ReturnType<typeof retrieveCampaignsByCategoryIdFromDatabase>
>[number];

export type TrendingCampaign = Awaited<
  ReturnType<typeof retrieveTrendingCampaignsFromDatabase>
>[number];

export type CategoryWithCampaigns = {
  id: string;
  name: string;
  campaigns: DiscoverCampaign[];
};

export type DiscoverPageData = Awaited<ReturnType<typeof retrieveDiscoverPageDataFromDatabase>>;

export type Category = NonNullable<Awaited<ReturnType<typeof retrieveCategoryByNameFromDatabase>>>;
