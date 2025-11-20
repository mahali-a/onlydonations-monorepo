import { getDb } from "@repo/core/database/setup";
import type { SelectCategory } from "@repo/core/database/types";
import { campaign, category, donation } from "@repo/core/drizzle/schema";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  inArray,
  isNotNull,
  isNull,
  lte,
  ne,
  not,
  or,
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
 * Retrieve a public campaign by slug with aggregated stats
 * Includes category info, total raised, and donation count
 */
export async function retrievePublicCampaignBySlug(slug: string) {
  const db = getDb();
  const now = new Date();

  const result = await db
    .select({
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      beneficiaryName: campaign.beneficiaryName,
      description: campaign.description,
      amount: campaign.amount,
      currency: campaign.currency,
      coverImage: campaign.coverImage,
      country: campaign.country,
      endDate: campaign.endDate,
      publishedAt: campaign.publishedAt,
      status: campaign.status,
      seoTitle: campaign.seoTitle,
      seoDescription: campaign.seoDescription,
      seoImage: campaign.seoImage,
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
 * Retrieve recent donations for a campaign
 * Anonymizes donor info if isAnonymous is true
 */
export async function retrieveRecentDonationsByCampaign(campaignId: string, limit: number = 20) {
  const db = getDb();
  const result = await db
    .select({
      id: donation.id,
      amount: donation.amount,
      currency: donation.currency,
      donorName: donation.donorName,
      donorMessage: donation.donorMessage,
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

/**
 * Retrieve donations for a campaign with pagination and sorting
 */
export async function retrieveDonationsByCampaignWithPagination(
  campaignId: string,
  page: number = 1,
  limit: number = 20,
  sort: "newest" | "top" = "newest",
) {
  const db = getDb();
  const offset = (page - 1) * limit;

  const orderBy = sort === "newest" ? desc(donation.createdAt) : desc(donation.amount);

  const result = await db
    .select({
      id: donation.id,
      amount: donation.amount,
      currency: donation.currency,
      donorName: donation.donorName,
      donorMessage: donation.donorMessage,
      isAnonymous: donation.isAnonymous,
      createdAt: donation.createdAt,
    })
    .from(donation)
    .where(and(eq(donation.campaignId, campaignId), eq(donation.status, "SUCCESS")))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  return result.map((d) => ({
    ...d,
    donorName: d.isAnonymous ? null : d.donorName,
  }));
}

/**
 * Retrieve donations with messages for a campaign
 * Only returns donations that have non-empty messages
 */
export async function retrieveDonationsWithMessagesByCampaign(
  campaignId: string,
  limit: number = 10,
) {
  const db = getDb();
  const result = await db
    .select({
      id: donation.id,
      amount: donation.amount,
      currency: donation.currency,
      donorName: donation.donorName,
      donorMessage: donation.donorMessage,
      isAnonymous: donation.isAnonymous,
      createdAt: donation.createdAt,
    })
    .from(donation)
    .where(
      and(
        eq(donation.campaignId, campaignId),
        eq(donation.status, "SUCCESS"),
        isNotNull(donation.donorMessage),
        ne(donation.donorMessage, ""),
      ),
    )
    .orderBy(desc(donation.createdAt))
    .limit(limit);

  return result.map((d) => ({
    ...d,
    donorName: d.isAnonymous ? null : d.donorName,
  }));
}

/**
 * Retrieve similar campaigns from the same category
 * Excludes the current campaign
 */
export async function retrieveSimilarCampaignsByCategory(
  categoryId: string,
  excludeCampaignId: string,
  limit: number = 5,
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
    .where(
      and(
        ...buildPublicCampaignConditions(now),
        eq(campaign.categoryId, categoryId),
        ne(campaign.id, excludeCampaignId),
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
 * Retrieve other public campaigns (fallback when not enough similar campaigns)
 * Excludes specified campaign IDs
 */
export async function retrieveOtherCampaigns(excludeCampaignIds: string[], limit: number = 5) {
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
    .where(
      and(...buildPublicCampaignConditions(now), not(inArray(campaign.id, excludeCampaignIds))),
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
 * Retrieve all enabled categories
 * Used for category filters and campaign categorization
 */
export async function retrieveEnabledCategories(): Promise<SelectCategory[]> {
  const db = getDb();
  return await db
    .select()
    .from(category)
    .where(eq(category.enabled, true))
    .orderBy(asc(category.name));
}

export type PublicCampaign = NonNullable<Awaited<ReturnType<typeof retrievePublicCampaignBySlug>>>;

export type PublicDonation = Awaited<ReturnType<typeof retrieveRecentDonationsByCampaign>>[number];

export type DonationWithMessage = Awaited<
  ReturnType<typeof retrieveDonationsWithMessagesByCampaign>
>[number];

export type SimilarCampaign = Awaited<
  ReturnType<typeof retrieveSimilarCampaignsByCategory>
>[number];

export type CampaignDetailData = {
  campaign: PublicCampaign;
  donations: PublicDonation[];
  categories: SelectCategory[];
};
