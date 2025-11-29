import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { formatMetricValue, formatTrendMessage } from "@/lib/dashboard-utils";
import { FEE_CONFIG } from "@/lib/fees/config";
import { promiseHash } from "@/lib/promise-hash";
import { requireOrganizationAccess } from "@/server/middleware/access-control";
import { authMiddleware } from "@/server/middleware/auth";
import {
  retrieveCampaignDonationStatsFromDatabaseByOrganization,
  retrieveDailyDonationAggregateFromDatabaseByOrganization,
  retrieveDonationAggregateFromDatabaseByOrganization,
  retrieveTotalCampaignCountFromDatabaseByOrganization,
} from "../org-payments-models";

const WITHDRAWAL_FEE_PERCENTAGE = FEE_CONFIG.withdrawal.platformPercentage;

export const retrieveFinancialInsightsFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      organizationId: z.string(),
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(100).default(10),
    }),
  )
  .handler(async ({ data, context }) => {
    const { organizationId, page, limit } = data;

    await requireOrganizationAccess(organizationId, context.user.id);

    return await retrieveFinancialInsightsUtil(organizationId, page, limit);
  });

async function retrieveFinancialInsightsUtil(
  organizationId: string,
  page: number = 1,
  limit: number = 10,
) {
  const { totalStats, dailyData, campaignStats, totalCampaigns } = await promiseHash({
    totalStats: retrieveDonationAggregateFromDatabaseByOrganization(organizationId),
    dailyData: retrieveDailyDonationAggregateFromDatabaseByOrganization(organizationId),
    campaignStats: retrieveCampaignDonationStatsFromDatabaseByOrganization(
      organizationId,
      page,
      limit,
    ),
    totalCampaigns: retrieveTotalCampaignCountFromDatabaseByOrganization(organizationId),
  });

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const currentMonthData = dailyData.filter((d) => new Date(d.date) >= currentMonthStart);
  const previousMonthData = dailyData.filter(
    (d) => new Date(d.date) >= previousMonthStart && new Date(d.date) <= previousMonthEnd,
  );

  const currentMonthTotal = currentMonthData.reduce((sum: number, d) => sum + d.amount, 0);
  const previousMonthTotal = previousMonthData.reduce((sum: number, d) => sum + d.amount, 0);

  const totalRaised = totalStats.totalRaised;
  const totalFees = Math.round(totalRaised * WITHDRAWAL_FEE_PERCENTAGE);
  const netEarnings = totalRaised - totalFees;
  const avgDonation =
    totalStats.donationCount > 0 ? Math.round(totalRaised / totalStats.donationCount) : 0;

  const totalRaisedChange =
    previousMonthTotal > 0
      ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
      : 0;
  const feesChange = totalRaisedChange;
  const netEarningsChange = totalRaisedChange;

  const currentAvg =
    currentMonthData.reduce((sum: number, d) => sum + d.count, 0) > 0
      ? currentMonthTotal / currentMonthData.reduce((sum: number, d) => sum + d.count, 0)
      : 0;
  const previousAvg =
    previousMonthData.reduce((sum: number, d) => sum + d.count, 0) > 0
      ? previousMonthTotal / previousMonthData.reduce((sum: number, d) => sum + d.count, 0)
      : 0;
  const avgDonationChange = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;

  const metrics = [
    {
      title: "Total Raised",
      value: formatMetricValue(totalRaised, "currency", "GHS"),
      change: totalRaisedChange,
      metric: "total raised",
      trendMessage: formatTrendMessage(totalRaisedChange, "total raised"),
    },
    {
      title: "Est. Withdrawal Fees",
      value: formatMetricValue(totalFees, "currency", "GHS"),
      change: feesChange,
      metric: "fees deducted",
      trendMessage: formatTrendMessage(feesChange, "fees deducted"),
    },
    {
      title: "Net Earnings",
      value: formatMetricValue(netEarnings, "currency", "GHS"),
      change: netEarningsChange,
      metric: "net earnings",
      trendMessage: formatTrendMessage(netEarningsChange, "net earnings"),
    },
    {
      title: "Average Donation",
      value: formatMetricValue(avgDonation, "currency", "GHS"),
      change: avgDonationChange,
      metric: "average donation",
      trendMessage: formatTrendMessage(avgDonationChange, "average donation"),
    },
  ];

  const chartData = dailyData;

  const campaigns = campaignStats.map(
    (campaign: {
      campaignId: string;
      campaignTitle: string;
      campaignSlug: string;
      campaignStatus: string;
      goalAmount: number;
      currency: string;
      totalRaised: number;
      donationCount: number;
    }) => {
      const feesDeducted = Math.round(campaign.totalRaised * WITHDRAWAL_FEE_PERCENTAGE);
      const netEarnings = campaign.totalRaised - feesDeducted;
      const avgDonation =
        campaign.donationCount > 0 ? Math.round(campaign.totalRaised / campaign.donationCount) : 0;

      return {
        id: campaign.campaignId,
        title: campaign.campaignTitle,
        slug: campaign.campaignSlug,
        status: campaign.campaignStatus as
          | "DRAFT"
          | "UNDER_REVIEW"
          | "COMPLETED"
          | "REJECTED"
          | "ACTIVE"
          | "CANCELLED",
        totalRaised: campaign.totalRaised,
        feesDeducted,
        netEarnings,
        avgDonation,
        donationCount: campaign.donationCount,
        goalAmount: campaign.goalAmount,
        currency: campaign.currency,
      };
    },
  );

  const totalPages = Math.ceil(totalCampaigns / limit);
  const pagination = {
    page,
    limit,
    total: totalCampaigns,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  return {
    metrics,
    chartData,
    campaigns,
    currency: "GHS",
    pagination,
  };
}
