import { getDb } from "@repo/core/database/setup";
import { campaign, donation } from "@repo/core/drizzle/schema";
import { and, desc, eq, gte, isNull, lte, sql, sum } from "drizzle-orm";

/**
 * Financial Insights Model
 * Payments feature's database API for financial insights
 * Pure data access - no business logic
 */
export const financialInsightsModel = {
  /**
   * Get total raised amount and currency for an organization
   * Pure data access - returns raw aggregation
   */
  async getTotalRaisedByOrganization(organizationId: string): Promise<{
    totalRaised: number;
    currency: string | null;
  }> {
    const db = getDb();
    const result = await db
      .select({
        totalRaised: sum(donation.amount),
        currency: donation.currency,
      })
      .from(donation)
      .leftJoin(campaign, eq(donation.campaignId, campaign.id))
      .where(
        and(
          eq(campaign.organizationId, organizationId),
          eq(donation.status, "SUCCESS"),
          isNull(campaign.deletedAt),
        ),
      )
      .groupBy(donation.currency)
      .limit(1);

    return {
      totalRaised: Number(result[0]?.totalRaised) || 0,
      currency: result[0]?.currency || null,
    };
  },

  /**
   * Get total raised amount for an organization within a date period
   * Pure data access - returns raw aggregation
   */
  async getTotalRaisedByOrganizationForPeriod(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const db = getDb();
    const result = await db
      .select({
        totalRaised: sum(donation.amount),
      })
      .from(donation)
      .leftJoin(campaign, eq(donation.campaignId, campaign.id))
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
  },

  /**
   * Get total donations and count for an organization
   * Pure data access - returns raw aggregation
   */
  async getTotalDonationsByOrganization(organizationId: string): Promise<{
    totalRaised: number;
    donationCount: number;
  }> {
    const db = getDb();
    const result = await db
      .select({
        totalRaised: sum(donation.amount),
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
  },

  /**
   * Get daily donation data grouped by date for an organization
   * Pure data access - returns formatted data (date grouping is data formatting)
   */
  async getDailyDonationsByOrganization(
    organizationId: string,
  ): Promise<Array<{ date: string; amount: number; count: number }>> {
    const db = getDb();
    const donationsData = await db
      .select({
        createdAt: donation.createdAt,
        amount: donation.amount,
      })
      .from(donation)
      .leftJoin(campaign, eq(donation.campaignId, campaign.id))
      .where(
        and(
          eq(campaign.organizationId, organizationId),
          eq(donation.status, "SUCCESS"),
          isNull(campaign.deletedAt),
        ),
      )
      .orderBy(donation.createdAt);

    const dailyData = new Map<string, { amount: number; count: number }>();

    for (const item of donationsData) {
      const dateStr = item.createdAt.toISOString().split("T")[0] ?? "";
      if (!dateStr) continue;

      if (!dailyData.has(dateStr)) {
        dailyData.set(dateStr, { amount: 0, count: 0 });
      }
      const dayData = dailyData.get(dateStr);
      if (dayData) {
        dayData.amount += Number(item.amount);
        dayData.count += 1;
      }
    }

    const result: Array<{ date: string; amount: number; count: number }> = [];
    for (const [date, data] of dailyData) {
      result.push({ date, amount: data.amount, count: data.count });
    }

    return result;
  },

  /**
   * Get donation statistics grouped by campaign with pagination
   * Pure data access - returns raw aggregation
   */
  async getCampaignDonationStats(
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
        totalRaised: sum(donation.amount),
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
      .orderBy(desc(sql`${sum(donation.amount)}`))
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
  },
};
