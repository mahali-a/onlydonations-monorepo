import { getDb } from "@repo/core/database/setup";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  like,
  lt,
  lte,
  or,
  type SQL,
  sum,
} from "@repo/core/drizzle";
import { campaign, donation } from "@repo/core/drizzle/schema";
import type { CreateDonation, DonationFilters } from "./org-donations-schemas";

export type DonorRow = {
  id: string;
  donorName: string | null;
  donorEmail: string | null;
  isAnonymous: boolean;
  amount: number;
  currency: string;
  status: string;
  campaignTitle: string | null;
  createdAt: Date;
  completedAt: Date | null;
};

export type DonationStats = {
  totalDonors: number;
  totalDonorsPrevious: number;
  totalAmount: number;
  totalAmountPrevious: number;
  returningDonors: number;
  returningDonorsPrevious: number;
  averageDonation: number;
  averageDonationPrevious: number;
  topDonor: {
    name: string | null;
    email: string | null;
    totalContribution: number;
    isAnonymous: boolean;
  } | null;
  currency: string;
};

type TopDonor = {
  name: string | null;
  email: string | null;
  totalContribution: number;
  isAnonymous: boolean;
};

export const donationModel = {
  async retrieveDonationsFromDatabaseByOrganization(
    organizationId: string,
    filters: DonationFilters,
  ): Promise<DonorRow[]> {
    const db = getDb();
    const {
      page = 1,
      limit = 50,
      search,
      status,
      dateFrom,
      dateTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const conditions: SQL[] = [eq(campaign.organizationId, organizationId)];

    if (status) {
      conditions.push(eq(donation.status, status));
    } else {
      conditions.push(eq(donation.status, "SUCCESS"));
    }

    if (search) {
      const searchCondition = or(
        like(donation.donorName, `%${search}%`),
        like(donation.donorEmail, `%${search}%`),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    if (dateFrom) {
      conditions.push(gte(donation.createdAt, new Date(dateFrom)));
    }

    if (dateTo) {
      conditions.push(lte(donation.createdAt, new Date(dateTo)));
    }

    const orderByColumn =
      sortBy === "amount"
        ? donation.amount
        : sortBy === "donorName"
          ? donation.donorName
          : sortBy === "campaignTitle"
            ? campaign.title
            : donation.createdAt;

    const orderByDirection = sortOrder === "asc" ? asc : desc;

    const results = await db
      .select({
        id: donation.id,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        isAnonymous: donation.isAnonymous,
        amount: donation.amount,
        currency: donation.currency,
        status: donation.status,
        campaignTitle: campaign.title,
        createdAt: donation.createdAt,
        completedAt: donation.completedAt,
      })
      .from(donation)
      .leftJoin(campaign, eq(donation.campaignId, campaign.id))
      .where(and(...conditions))
      .orderBy(orderByDirection(orderByColumn))
      .limit(limit)
      .offset((page - 1) * limit);

    return results;
  },

  async retrieveDonationCountFromDatabaseByOrganization(
    organizationId: string,
    search?: string,
  ): Promise<number> {
    const db = getDb();
    const conditions = [
      eq(campaign.organizationId, organizationId),
      eq(donation.status, "SUCCESS"),
    ];

    if (search) {
      const searchCondition = or(
        like(donation.donorName, `%${search}%`),
        like(donation.donorEmail, `%${search}%`),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const [result] = await db
      .select({ value: count() })
      .from(donation)
      .leftJoin(campaign, eq(donation.campaignId, campaign.id))
      .where(and(...conditions));

    return Number(result?.value ?? 0);
  },

  async retrieveDonationStatsFromDatabaseByOrganizationAndDateRange(
    organizationId: string,
    dateRange: { startDate: Date; endDate: Date },
  ): Promise<
    Omit<
      DonationStats,
      "totalDonorsPrevious" | "returningDonorsPrevious" | "averageDonationPrevious"
    >
  > {
    const db = getDb();
    const { startDate, endDate } = dateRange;

    const statsResult = await db
      .select({
        totalDonors: count(donation.donorEmail).mapWith(Number),
        totalAmount: sum(donation.amount).mapWith(Number),
        donationCount: count(donation.id).mapWith(Number),
      })
      .from(donation)
      .leftJoin(campaign, eq(donation.campaignId, campaign.id))
      .where(
        and(
          eq(campaign.organizationId, organizationId),
          eq(donation.status, "SUCCESS"),
          gte(donation.createdAt, startDate),
          lte(donation.createdAt, endDate),
        ),
      );

    const stats = statsResult[0] ?? null;
    const totalDonors = stats?.totalDonors ?? 0;
    const donationCount = stats?.donationCount ?? 0;
    const totalAmount = stats?.totalAmount ?? 0;
    const averageDonation = donationCount > 0 ? totalAmount / donationCount : 0;

    const topDonorResult = await db
      .select({
        name: donation.donorName,
        email: donation.donorEmail,
        isAnonymous: donation.isAnonymous,
        totalContribution: sum(donation.amount).mapWith(Number),
      })
      .from(donation)
      .leftJoin(campaign, eq(donation.campaignId, campaign.id))
      .where(
        and(
          eq(campaign.organizationId, organizationId),
          eq(donation.status, "SUCCESS"),
          gte(donation.createdAt, startDate),
          lte(donation.createdAt, endDate),
        ),
      )
      .groupBy(donation.donorEmail, donation.donorName, donation.isAnonymous)
      .orderBy(desc(sum(donation.amount)))
      .limit(1);

    const topDonor = topDonorResult[0]
      ? {
          name: topDonorResult[0].name,
          email: topDonorResult[0].email,
          totalContribution: topDonorResult[0].totalContribution ?? 0,
          isAnonymous: topDonorResult[0].isAnonymous,
        }
      : null;

    return {
      totalDonors,
      totalAmount,
      totalAmountPrevious: 0,
      returningDonors: 0,
      averageDonation,
      topDonor,
      currency: "GHS",
    };
  },

  async retrieveReturningDonorsCountFromDatabaseByOrganizationAndDateRange(
    organizationId: string,
    dateRange: { startDate: Date; endDate: Date },
  ): Promise<number> {
    const db = getDb();
    const { startDate, endDate } = dateRange;

    const currentDonors = await db
      .selectDistinct({
        email: donation.donorEmail,
      })
      .from(donation)
      .leftJoin(campaign, eq(donation.campaignId, campaign.id))
      .where(
        and(
          eq(campaign.organizationId, organizationId),
          eq(donation.status, "SUCCESS"),
          gte(donation.createdAt, startDate),
          lte(donation.createdAt, endDate),
        ),
      );

    if (currentDonors.length === 0) {
      return 0;
    }

    const previousDonors = await db
      .selectDistinct({
        email: donation.donorEmail,
      })
      .from(donation)
      .leftJoin(campaign, eq(donation.campaignId, campaign.id))
      .where(
        and(
          eq(campaign.organizationId, organizationId),
          eq(donation.status, "SUCCESS"),
          lt(donation.createdAt, startDate),
        ),
      );

    const previousEmails = new Set(previousDonors.map((d) => d.email));
    const returningCount = currentDonors.filter((d) => previousEmails.has(d.email)).length;

    return returningCount;
  },

  async retrieveTopDonorsFromDatabaseByOrganization(
    organizationId: string,
    limit: number = 5,
  ): Promise<TopDonor[]> {
    const db = getDb();

    type TopDonorRow = {
      name: string | null;
      email: string | null;
      isAnonymous: boolean;
      totalContribution: number | null;
    };

    const results = await db
      .select({
        name: donation.donorName,
        email: donation.donorEmail,
        isAnonymous: donation.isAnonymous,
        totalContribution: sum(donation.amount).mapWith(Number),
      })
      .from(donation)
      .leftJoin(campaign, eq(donation.campaignId, campaign.id))
      .where(and(eq(campaign.organizationId, organizationId), eq(donation.status, "SUCCESS")))
      .groupBy(donation.donorEmail, donation.donorName, donation.isAnonymous)
      .orderBy(desc(sum(donation.amount)))
      .limit(limit);

    return (results as TopDonorRow[]).map((row) => ({
      name: row.name,
      email: row.email,
      isAnonymous: row.isAnonymous,
      totalContribution: row.totalContribution ?? 0,
    }));
  },

  async retrieveDonationsFromDatabaseByOrganizationAndCampaign(
    organizationId: string,
    campaignId: string,
    filters: DonationFilters,
  ): Promise<DonorRow[]> {
    const db = getDb();
    const { page = 1, limit = 50, search, sortBy = "createdAt", sortOrder = "desc" } = filters;

    const conditions: SQL[] = [
      eq(campaign.organizationId, organizationId),
      eq(donation.campaignId, campaignId),
      eq(donation.status, "SUCCESS"),
    ];

    if (search) {
      const searchCondition = or(
        like(donation.donorName, `%${search}%`),
        like(donation.donorEmail, `%${search}%`),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const orderByColumn = sortBy === "amount" ? donation.amount : donation.createdAt;
    const orderByDirection = sortOrder === "asc" ? asc : desc;

    const results = await db
      .select({
        id: donation.id,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        isAnonymous: donation.isAnonymous,
        amount: donation.amount,
        currency: donation.currency,
        status: donation.status,
        campaignTitle: campaign.title,
        createdAt: donation.createdAt,
        completedAt: donation.completedAt,
      })
      .from(donation)
      .leftJoin(campaign, eq(donation.campaignId, campaign.id))
      .where(and(...conditions))
      .orderBy(orderByDirection(orderByColumn))
      .limit(limit)
      .offset((page - 1) * limit);

    return results;
  },

  async retrieveDonationFromDatabaseById(id: string) {
    const db = getDb();
    const result = await db
      .select({
        id: donation.id,
        campaignId: donation.campaignId,
        amount: donation.amount,
        currency: donation.currency,
        reference: donation.reference,
        status: donation.status,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        donorMessage: donation.donorMessage,
        isAnonymous: donation.isAnonymous,
        showMessage: donation.showMessage,
        createdAt: donation.createdAt,
        completedAt: donation.completedAt,
        campaignTitle: campaign.title,
      })
      .from(donation)
      .leftJoin(campaign, eq(donation.campaignId, campaign.id))
      .where(eq(donation.id, id))
      .limit(1);

    return result[0] ?? null;
  },

  async retrieveDonationFromDatabaseByReference(reference: string) {
    const db = getDb();
    const result = await db
      .select()
      .from(donation)
      .where(eq(donation.reference, reference))
      .limit(1);

    return result[0] ?? null;
  },

  async saveDonationToDatabase(data: CreateDonation & { id: string; reference: string }) {
    const db = getDb();
    const result = await db.insert(donation).values({
      id: data.id,
      campaignId: data.campaignId,
      amount: data.amount,
      currency: data.currency,
      reference: data.reference,
      donorName: data.donorName || null,
      donorEmail: data.donorEmail,
      donorMessage: data.donorMessage || null,
      isAnonymous: data.isAnonymous || false,
      showMessage: data.showMessage || false,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result;
  },

  async updateDonationInDatabaseById(
    id: string,
    updates: Partial<CreateDonation & { status?: string; completedAt?: Date }>,
  ) {
    const db = getDb();
    const result = await db
      .update(donation)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(donation.id, id));

    return result;
  },

  async updateDonationStatusInDatabaseById(
    id: string,
    status: "PENDING" | "SUCCESS" | "FAILED",
    completedAt?: Date,
  ) {
    const db = getDb();
    const result = await db
      .update(donation)
      .set({
        status,
        completedAt: completedAt || (status !== "PENDING" ? new Date() : null),
        updatedAt: new Date(),
      })
      .where(eq(donation.id, id));

    return result;
  },

  async deleteDonationFromDatabaseById(id: string) {
    const db = getDb();
    const result = await db.delete(donation).where(eq(donation.id, id));

    return result;
  },
};
