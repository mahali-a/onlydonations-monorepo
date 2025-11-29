import { getDb } from "@repo/core/database/setup";
import type {
  InsertCampaign,
  InsertDonation,
  SelectCampaign,
  SelectCategory,
  SelectDonation,
} from "@repo/core/database/types";
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
  like,
  lte,
  ne,
  not,
  or,
  sum,
} from "@repo/core/drizzle";
import { campaign, category, contentModeration, donation } from "@repo/core/drizzle/schema";
import { promiseHash } from "@/lib/promise-hash";

type CampaignFilters = {
  search?: string;
  status?: SelectCampaign["status"];
  categoryId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export async function retrieveCampaignFromDatabaseById(id: string): Promise<SelectCampaign | null> {
  const db = getDb();
  const result = await db
    .select()
    .from(campaign)
    .where(and(eq(campaign.id, id), isNull(campaign.deletedAt)));
  return result[0] ?? null;
}

export async function retrieveCampaignFromDatabaseBySlug(
  slug: string,
): Promise<SelectCampaign | null> {
  const db = getDb();
  const result = await db
    .select()
    .from(campaign)
    .where(and(eq(campaign.slug, slug), isNull(campaign.deletedAt)));
  return result[0] ?? null;
}

export async function retrieveCampaignsFromDatabaseByOrganization(
  organizationId: string,
): Promise<SelectCampaign[]> {
  const db = getDb();
  return await db
    .select()
    .from(campaign)
    .where(and(eq(campaign.organizationId, organizationId), isNull(campaign.deletedAt)));
}

export async function retrieveCampaignCountFromDatabaseByOrganizationAndFilters(
  organizationId: string,
  filters: CampaignFilters = {},
): Promise<number> {
  const db = getDb();
  const conditions = buildCampaignConditions(organizationId, filters);

  const result = await db
    .select({
      count: count(),
    })
    .from(campaign)
    .where(and(...conditions));

  return Number(result[0]?.count ?? 0);
}

export async function retrieveCampaignsWithDonationStatsFromDatabaseByOrganizationAndFilters(
  organizationId: string,
  filters: CampaignFilters = {},
) {
  const db = getDb();
  const conditions = buildCampaignConditions(organizationId, filters);

  const getSortColumn = () => {
    switch (filters.sortBy) {
      case "title":
        return campaign.title;
      case "status":
        return campaign.status;
      case "goal":
        return campaign.amount;
      case "created":
        return campaign.createdAt;
      case "supporters":
        return count(donation.id);
      case "raised":
        return sum(donation.amount);
      default:
        return campaign.createdAt;
    }
  };

  const sortDirection = filters.sortOrder === "asc" ? asc : desc;
  const offset = ((filters.page || 1) - 1) * (filters.limit || 10);

  const campaignsPromise = db
    .select({
      id: campaign.id,
      slug: campaign.slug,
      status: campaign.status,
      amount: campaign.amount,
      currency: campaign.currency,
      coverImage: campaign.coverImage,
      title: campaign.title,
      beneficiaryName: campaign.beneficiaryName,
      country: campaign.country,
      description: campaign.description,
      categoryId: campaign.categoryId,
      createdBy: campaign.createdBy,
      organizationId: campaign.organizationId,
      publishedAt: campaign.publishedAt,
      endDate: campaign.endDate,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      deletedAt: campaign.deletedAt,
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
    .orderBy(sortDirection(getSortColumn()))
    .limit(filters.limit || 10)
    .offset(offset);

  const totalPromise = db
    .select({ count: count() })
    .from(campaign)
    .where(and(...conditions))
    .then((result) => result[0]?.count || 0);

  const { campaigns, total } = await promiseHash({
    campaigns: campaignsPromise,
    total: totalPromise,
  });

  const campaignsWithStats = campaigns.map((c) => ({
    ...c,
    totalRaised: Number(c.totalRaised) || 0,
    donationCount: Number(c.donationCount) || 0,
  }));

  const totalPages = Math.ceil(total / (filters.limit || 10)) || 1;

  return {
    campaigns: campaignsWithStats,
    pagination: {
      page: filters.page || 1,
      limit: filters.limit || 10,
      total,
      totalPages,
      hasNext: (filters.page || 1) < totalPages,
      hasPrev: (filters.page || 1) > 1,
    },
  };
}

export async function retrieveCampaignWithDonationStatsFromDatabaseById(
  campaignId: string,
  organizationId: string,
) {
  const db = getDb();
  const result = await db
    .select({
      id: campaign.id,
      slug: campaign.slug,
      status: campaign.status,
      amount: campaign.amount,
      currency: campaign.currency,
      coverImage: campaign.coverImage,
      title: campaign.title,
      beneficiaryName: campaign.beneficiaryName,
      country: campaign.country,
      description: campaign.description,
      categoryId: campaign.categoryId,
      createdBy: campaign.createdBy,
      organizationId: campaign.organizationId,
      publishedAt: campaign.publishedAt,
      endDate: campaign.endDate,
      seoTitle: campaign.seoTitle,
      seoDescription: campaign.seoDescription,
      seoImage: campaign.seoImage,
      thankYouMessage: campaign.thankYouMessage,
      feeHandling: campaign.feeHandling,
      donateButtonText: campaign.donateButtonText,
      isUnlisted: campaign.isUnlisted,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      deletedAt: campaign.deletedAt,
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
    .where(
      and(
        eq(campaign.id, campaignId),
        eq(campaign.organizationId, organizationId),
        isNull(campaign.deletedAt),
      ),
    )
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

export async function getIsSlugAvailableInDatabase(
  organizationId: string,
  slug: string,
  excludeCampaignId?: string,
): Promise<boolean> {
  const db = getDb();
  const existing = await db
    .select({ id: campaign.id })
    .from(campaign)
    .where(
      and(
        eq(campaign.organizationId, organizationId),
        eq(campaign.slug, slug),
        isNull(campaign.deletedAt),
      ),
    )
    .limit(1);

  if (!existing[0]) return true;
  if (excludeCampaignId && existing[0].id === excludeCampaignId) {
    return true;
  }
  return false;
}

export async function saveCampaignToDatabase(data: InsertCampaign): Promise<SelectCampaign | null> {
  const db = getDb();
  const [result] = await db.insert(campaign).values(data).returning();
  return result ?? null;
}

export async function updateCampaignInDatabase(
  id: string,
  organizationId: string,
  data: Partial<InsertCampaign>,
): Promise<SelectCampaign | null> {
  const db = getDb();
  const [result] = await db
    .update(campaign)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(campaign.id, id),
        eq(campaign.organizationId, organizationId),
        isNull(campaign.deletedAt),
      ),
    )
    .returning();
  return result ?? null;
}

export async function updateCampaignStatusInDatabase(
  id: string,
  organizationId: string,
  status: SelectCampaign["status"],
): Promise<SelectCampaign | null> {
  return updateCampaignInDatabase(id, organizationId, { status });
}

export async function publishCampaignInDatabase(
  id: string,
  organizationId: string,
): Promise<SelectCampaign | null> {
  const db = getDb();
  const [result] = await db
    .update(campaign)
    .set({
      status: "UNDER_REVIEW",
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(campaign.id, id),
        eq(campaign.organizationId, organizationId),
        isNull(campaign.deletedAt),
      ),
    )
    .returning();
  return result ?? null;
}

export async function deleteCampaignInDatabase(
  id: string,
  organizationId: string,
): Promise<boolean> {
  const db = getDb();
  const [deleted] = await db
    .update(campaign)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(campaign.id, id),
        eq(campaign.organizationId, organizationId),
        isNull(campaign.deletedAt),
      ),
    )
    .returning();

  return !!deleted;
}

export async function retrieveCampaignCountFromDatabaseByOrganization(
  organizationId: string,
): Promise<number> {
  const db = getDb();
  const result = await db
    .select({
      count: count(),
    })
    .from(campaign)
    .where(and(eq(campaign.organizationId, organizationId), isNull(campaign.deletedAt)));

  return Number(result[0]?.count ?? 0);
}

export async function retrievePublishedCampaignCountFromDatabaseByOrganization(
  organizationId: string,
): Promise<number> {
  const db = getDb();
  const result = await db
    .select({
      count: count(),
    })
    .from(campaign)
    .where(
      and(
        eq(campaign.organizationId, organizationId),
        isNull(campaign.deletedAt),
        isNotNull(campaign.publishedAt),
      ),
    );

  return Number(result[0]?.count ?? 0);
}

export async function getHasDonationsInDatabase(campaignId: string): Promise<boolean> {
  const db = getDb();
  const result = await db
    .select({ count: count() })
    .from(donation)
    .where(eq(donation.campaignId, campaignId))
    .limit(1);

  return Number(result[0]?.count ?? 0) > 0;
}

export async function retrievePublicCampaignFromDatabaseBySlug(slug: string) {
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
      donateButtonText: campaign.donateButtonText,
      thankYouMessage: campaign.thankYouMessage,
      feeHandling: campaign.feeHandling,
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

export async function retrieveRecentDonationsFromDatabaseByCampaign(
  campaignId: string,
  limit: number = 20,
) {
  const db = getDb();
  const result = await db
    .select({
      id: donation.id,
      amount: donation.amount,
      currency: donation.currency,
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      donorMessage: donation.donorMessage,
      isAnonymous: donation.isAnonymous,
      status: donation.status,
      createdAt: donation.createdAt,
    })
    .from(donation)
    .where(and(eq(donation.campaignId, campaignId), eq(donation.status, "SUCCESS")))
    .orderBy(desc(donation.createdAt))
    .limit(limit);

  return result.map((d) => ({
    ...d,
    donorName: d.isAnonymous ? null : d.donorName,
    donorEmail: d.isAnonymous ? null : d.donorEmail,
  }));
}

export async function retrieveDonationsWithMessagesFromDatabaseByCampaign(
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
      donorEmail: donation.donorEmail,
      donorMessage: donation.donorMessage,
      isAnonymous: donation.isAnonymous,
      status: donation.status,
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
    donorEmail: d.isAnonymous ? null : d.donorEmail,
  }));
}

export async function retrieveCampaignForPreviewFromDatabaseById(campaignId: string) {
  const db = getDb();
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
      organizationId: campaign.organizationId,
      seoTitle: campaign.seoTitle,
      seoDescription: campaign.seoDescription,
      seoImage: campaign.seoImage,
      donateButtonText: campaign.donateButtonText,
      thankYouMessage: campaign.thankYouMessage,
      feeHandling: campaign.feeHandling,
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
    .where(and(eq(campaign.id, campaignId), isNull(campaign.deletedAt)))
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

export async function retrieveSimilarCampaignsFromDatabaseByCategory(
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
      country: campaign.country,
      amount: campaign.amount,
      currency: campaign.currency,
      totalRaised: sum(donation.amount),
      donationCount: count(donation.id),
    })
    .from(campaign)
    .leftJoin(donation, and(eq(donation.campaignId, campaign.id), eq(donation.status, "SUCCESS")))
    .where(
      and(
        ...buildPublicCampaignConditions(now),
        eq(campaign.categoryId, categoryId),
        ne(campaign.id, excludeCampaignId),
      ),
    )
    .groupBy(campaign.id)
    .orderBy(desc(campaign.publishedAt))
    .limit(limit);

  return result.map((c) => ({
    ...c,
    totalRaised: Number(c.totalRaised) || 0,
    donationCount: Number(c.donationCount) || 0,
  }));
}

export async function retrieveOtherCampaignsFromDatabase(
  excludeCampaignIds: string[],
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
      country: campaign.country,
      amount: campaign.amount,
      currency: campaign.currency,
      totalRaised: sum(donation.amount),
      donationCount: count(donation.id),
    })
    .from(campaign)
    .leftJoin(donation, and(eq(donation.campaignId, campaign.id), eq(donation.status, "SUCCESS")))
    .where(
      and(...buildPublicCampaignConditions(now), not(inArray(campaign.id, excludeCampaignIds))),
    )
    .groupBy(campaign.id)
    .orderBy(desc(campaign.publishedAt))
    .limit(limit);

  return result.map((c) => ({
    ...c,
    totalRaised: Number(c.totalRaised) || 0,
    donationCount: Number(c.donationCount) || 0,
  }));
}

function buildCampaignConditions(organizationId: string, filters: CampaignFilters = {}) {
  const conditions = [eq(campaign.organizationId, organizationId), isNull(campaign.deletedAt)];

  if (filters.search) {
    conditions.push(like(campaign.title, `%${filters.search}%`));
  }

  if (filters.status) {
    conditions.push(eq(campaign.status, filters.status));
  }

  if (filters.categoryId) {
    conditions.push(eq(campaign.categoryId, filters.categoryId));
  }

  return conditions;
}

function buildPublicCampaignConditions(now: Date) {
  return [
    eq(campaign.status, "ACTIVE"),
    isNull(campaign.deletedAt),
    isNotNull(campaign.publishedAt),
    lte(campaign.publishedAt, now),
    or(isNull(campaign.endDate), gt(campaign.endDate, now)),
  ];
}

export async function retrieveEnabledCategoriesFromDatabase(): Promise<SelectCategory[]> {
  const db = getDb();
  return await db
    .select()
    .from(category)
    .where(eq(category.enabled, true))
    .orderBy(asc(category.name));
}

export async function retrieveCategoryFromDatabaseById(id: string): Promise<SelectCategory | null> {
  const db = getDb();
  const result = await db.select().from(category).where(eq(category.id, id));
  return result[0] ?? null;
}

export async function retrieveAllCategoriesFromDatabase(): Promise<SelectCategory[]> {
  const db = getDb();
  return await db.select().from(category).orderBy(asc(category.name));
}

/**
 * Retrieves the rejection reason for a campaign from the content moderation table.
 * @param campaignId - The campaign ID to look up
 * @returns The recommendation/rejection reason or null if not found
 */
export async function retrieveRejectionReasonFromDatabaseByCampaignId(
  campaignId: string,
): Promise<string | null> {
  const db = getDb();
  const result = await db
    .select({
      recommendation: contentModeration.recommendation,
    })
    .from(contentModeration)
    .where(
      and(
        eq(contentModeration.contentId, campaignId),
        eq(contentModeration.contentType, "campaign"),
        isNotNull(contentModeration.recommendation),
      ),
    )
    .orderBy(desc(contentModeration.createdAt))
    .limit(1);

  return result[0]?.recommendation ?? null;
}

export async function retrieveDonationFromDatabaseById(id: string): Promise<SelectDonation | null> {
  const db = getDb();
  const result = await db.select().from(donation).where(eq(donation.id, id));
  return result[0] ?? null;
}

export async function retrieveDonationFromDatabaseByReference(
  reference: string,
): Promise<SelectDonation | null> {
  const db = getDb();
  const result = await db.select().from(donation).where(eq(donation.reference, reference));
  return result[0] ?? null;
}

export async function retrieveDonationsFromDatabaseByCampaign(
  campaignId: string,
): Promise<SelectDonation[]> {
  const db = getDb();
  return await db
    .select()
    .from(donation)
    .where(eq(donation.campaignId, campaignId))
    .orderBy(desc(donation.createdAt));
}

export async function retrieveDonationsFromDatabaseByDonor(
  donorId: string,
): Promise<SelectDonation[]> {
  const db = getDb();
  return await db
    .select()
    .from(donation)
    .where(eq(donation.donorId, donorId))
    .orderBy(desc(donation.createdAt));
}

export async function retrieveSuccessfulDonationsFromDatabaseByCampaign(
  campaignId: string,
): Promise<SelectDonation[]> {
  const db = getDb();
  return await db
    .select()
    .from(donation)
    .where(and(eq(donation.campaignId, campaignId), eq(donation.status, "SUCCESS")))
    .orderBy(desc(donation.completedAt));
}

export async function saveDonationToDatabase(data: InsertDonation): Promise<SelectDonation | null> {
  const db = getDb();
  const [result] = await db.insert(donation).values(data).returning();
  return result ?? null;
}

export async function updateDonationInDatabase(
  id: string,
  data: Partial<InsertDonation>,
): Promise<SelectDonation | null> {
  const db = getDb();
  const [result] = await db.update(donation).set(data).where(eq(donation.id, id)).returning();
  return result ?? null;
}
