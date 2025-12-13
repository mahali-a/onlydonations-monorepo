import { getDb } from "@repo/core/database/setup";
import { sql } from "@repo/core/drizzle";

export type DashboardStats = {
  totalRaised: number;
  totalDonors: number;
  activeCampaigns: number;
  currency: string | null;
};

export type MonthlyData = {
  totalRaised: number;
  totalDonors: number;
};

export type ChartDataPoint = {
  date: string;
  amount: number;
  donors: number;
};

export type RecentDonation = {
  id: string;
  donorName: string | null;
  donorEmail: string | null;
  isAnonymous: boolean;
  amount: number;
  currency: string;
  campaignTitle: string | null;
  createdAt: Date;
};

export type CampaignPerformance = {
  id: string;
  title: string;
  status: string;
  goal: number;
  currency: string;
  totalRaised: number;
  donationCount: number;
};

export const dashboardModel = {
  async retrieveAllTimeStatsFromDatabaseByOrganization(
    organizationId: string,
  ): Promise<DashboardStats> {
    const db = getDb();

    const statsResult = (await db.all(
      sql`
      SELECT
        COALESCE(SUM(d.net_amount), 0) as totalRaised,
        COUNT(DISTINCT d.donor_email) as totalDonors,
        d.currency
      FROM donation d
      LEFT JOIN campaign c ON d.campaign_id = c.id
      WHERE c.organization_id = ${organizationId}
        AND d.status = 'SUCCESS'
        AND c.deleted_at IS NULL
      GROUP BY d.currency
      ORDER BY totalRaised DESC
      LIMIT 1
    `,
    )) as Array<Record<string, unknown>>;

    const stats = statsResult[0];
    const totalRaised = Number(stats?.totalRaised ?? 0);
    const totalDonors = Number(stats?.totalDonors ?? 0);
    const currency = (stats?.currency as string) ?? null;

    const campaignsResult = (await db.all(
      sql`
      SELECT COUNT(*) as count
      FROM campaign
      WHERE organization_id = ${organizationId}
        AND status = 'ACTIVE'
        AND deleted_at IS NULL
    ` as any,
    )) as Array<Record<string, unknown>>;

    const activeCampaigns = Number(campaignsResult[0]?.count ?? 0);

    return {
      totalRaised,
      totalDonors,
      activeCampaigns,
      currency,
    };
  },

  async retrievePeriodStatsFromDatabaseByOrganizationAndDateRange(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DashboardStats> {
    const db = getDb();
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    const statsResult = (await db.all(
      sql`
      SELECT
        COALESCE(SUM(d.net_amount), 0) as totalRaised,
        COUNT(DISTINCT d.donor_email) as totalDonors,
        d.currency
      FROM donation d
      LEFT JOIN campaign c ON d.campaign_id = c.id
      WHERE c.organization_id = ${organizationId}
        AND d.status = 'SUCCESS'
        AND c.deleted_at IS NULL
        AND d.created_at >= ${startTimestamp}
        AND d.created_at <= ${endTimestamp}
      GROUP BY d.currency
      ORDER BY totalRaised DESC
      LIMIT 1
    `,
    )) as Array<Record<string, unknown>>;

    const stats = statsResult[0];
    const totalRaised = Number(stats?.totalRaised ?? 0);
    const totalDonors = Number(stats?.totalDonors ?? 0);
    const currency = (stats?.currency as string) ?? null;

    const campaignsResult = (await db.all(
      sql`
      SELECT COUNT(*) as count
      FROM campaign
      WHERE organization_id = ${organizationId}
        AND status = 'ACTIVE'
        AND deleted_at IS NULL
    `,
    )) as Array<Record<string, unknown>>;

    const activeCampaigns = Number(campaignsResult[0]?.count ?? 0);

    return {
      totalRaised,
      totalDonors,
      activeCampaigns,
      currency,
    };
  },

  async retrieveActiveCampaignsCountFromDatabaseByOrganization(
    organizationId: string,
  ): Promise<number> {
    const db = getDb();
    const result = (await db.all(
      sql`
      SELECT COUNT(*) as count
      FROM campaign
      WHERE organization_id = ${organizationId}
        AND status = 'ACTIVE'
        AND deleted_at IS NULL
    `,
    )) as Array<Record<string, unknown>>;

    return Number(result[0]?.count ?? 0);
  },

  async retrieveRecentDonationsFromDatabaseByOrganization(
    organizationId: string,
    limit: number = 10,
  ): Promise<RecentDonation[]> {
    const db = getDb();

    const results = (await db.all(
      sql`
      SELECT
        d.id,
        CASE WHEN d.is_anonymous = 1 THEN NULL ELSE d.donor_name END as donorName,
        CASE WHEN d.is_anonymous = 1 THEN NULL ELSE d.donor_email END as donorEmail,
        d.is_anonymous as isAnonymous,
        d.amount,
        d.currency,
        c.title as campaignTitle,
        d.created_at as createdAt
      FROM donation d
      LEFT JOIN campaign c ON d.campaign_id = c.id
      WHERE c.organization_id = ${organizationId}
        AND d.status = 'SUCCESS'
        AND c.deleted_at IS NULL
      ORDER BY d.created_at DESC
      LIMIT ${limit}
    `,
    )) as Array<Record<string, unknown>>;

    return results.map((row) => ({
      id: row.id as string,
      donorName: (row.donorName as string) ?? null,
      donorEmail: (row.donorEmail as string) ?? null,
      isAnonymous: Boolean(row.isAnonymous),
      amount: Number(row.amount),
      currency: row.currency as string,
      campaignTitle: (row.campaignTitle as string) ?? null,
      createdAt: new Date(Number(row.createdAt) * 1000),
    }));
  },

  async retrieveTopCampaignsFromDatabaseByOrganization(
    organizationId: string,
    limit: number = 5,
  ): Promise<CampaignPerformance[]> {
    const db = getDb();

    const results = (await db.all(
      sql`
      SELECT
        c.id,
        c.title,
        COALESCE(c.status, 'DRAFT') as status,
        c.goal_amount as goal,
        c.currency,
        COALESCE(SUM(d.net_amount), 0) as totalRaised,
        COUNT(d.id) as donationCount
      FROM campaign c
      LEFT JOIN donation d ON d.campaign_id = c.id AND d.status = 'SUCCESS'
      WHERE c.organization_id = ${organizationId}
        AND c.status = 'ACTIVE'
        AND c.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY totalRaised DESC
      LIMIT ${limit}
    `,
    )) as Array<Record<string, unknown>>;

    return results.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      status: (row.status as string) ?? "DRAFT",
      goal: Number(row.goal),
      currency: row.currency as string,
      totalRaised: Number(row.totalRaised),
      donationCount: Number(row.donationCount),
    }));
  },

  async retrieveDailyDonationChartDataFromDatabaseByOrganization(
    organizationId: string,
    days: number = 30,
  ): Promise<ChartDataPoint[]> {
    const db = getDb();
    const cutoffTimestamp = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);

    const results = (await db.all(
      sql`
      SELECT
        DATE(datetime(d.created_at, 'unixepoch')) as date,
        COALESCE(SUM(d.net_amount), 0) as amount,
        COUNT(DISTINCT d.donor_email) as donors
      FROM donation d
      LEFT JOIN campaign c ON d.campaign_id = c.id
      WHERE c.organization_id = ${organizationId}
        AND d.status = 'SUCCESS'
        AND c.deleted_at IS NULL
        AND d.created_at >= ${cutoffTimestamp}
      GROUP BY DATE(datetime(d.created_at, 'unixepoch'))
      ORDER BY date ASC
    `,
    )) as Array<Record<string, unknown>>;

    return results
      .filter((row) => row.date != null && row.date !== "")
      .map((row) => ({
        date: row.date as string,
        amount: Number(row.amount),
        donors: Number(row.donors),
      }));
  },
};
