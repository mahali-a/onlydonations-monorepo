import { campaignModel } from "@/features/campaigns/models/campaign-model";
import { formatMetricValue, getTrendMessage } from "@/lib/utils/dashboard-utils";
import { financialInsightsModel } from "../models/financial-insights-model";

export async function insightsLoader(organizationId: string, page: number = 1, limit: number = 10) {
  // Fetch raw data from database
  const [totalStats, dailyData, campaignStats, totalCampaigns] = await Promise.all([
    financialInsightsModel.getTotalDonationsByOrganization(organizationId),
    financialInsightsModel.getDailyDonationsByOrganization(organizationId),
    financialInsightsModel.getCampaignDonationStats(organizationId, page, limit),
    campaignModel.getCount(organizationId),
  ]);

  // Calculate current month stats for trends
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

  // Calculate fees and metrics
  const totalRaised = totalStats.totalRaised;
  const totalFees = Math.round(totalRaised * 0.0295); // 2.95% platform + payment fees
  const netEarnings = totalRaised - totalFees;
  const avgDonation =
    totalStats.donationCount > 0 ? Math.round(totalRaised / totalStats.donationCount) : 0;

  // Calculate trends
  const totalRaisedChange =
    previousMonthTotal > 0
      ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
      : 0;
  const feesChange = totalRaisedChange; // Fees follow the same trend as total raised
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

  // Format metrics for the cards
  const metrics = [
    {
      title: "Total Raised",
      value: formatMetricValue(totalRaised, "currency", "GHS"),
      change: totalRaisedChange,
      metric: "total raised",
      trendMessage: getTrendMessage(totalRaisedChange, "total raised"),
    },
    {
      title: "Total Fees Deducted",
      value: formatMetricValue(totalFees, "currency", "GHS"),
      change: feesChange,
      metric: "fees deducted",
      trendMessage: getTrendMessage(feesChange, "fees deducted"),
    },
    {
      title: "Net Earnings",
      value: formatMetricValue(netEarnings, "currency", "GHS"),
      change: netEarningsChange,
      metric: "net earnings",
      trendMessage: getTrendMessage(netEarningsChange, "net earnings"),
    },
    {
      title: "Average Donation",
      value: formatMetricValue(avgDonation, "currency", "GHS"),
      change: avgDonationChange,
      metric: "average donation",
      trendMessage: getTrendMessage(avgDonationChange, "average donation"),
    },
  ];

  // Chart data (all time, formatted for recharts)
  const chartData = dailyData;

  // Calculate campaign performance (business logic)
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
      const feesDeducted = Math.round(campaign.totalRaised * 0.0295);
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

  // Pagination metadata
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
