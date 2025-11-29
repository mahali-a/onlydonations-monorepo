import type { DashboardStats } from "@/features/org-dashboard/org-dashboard-models";
import { formatMetricValue, formatTrendMessage } from "@/lib/dashboard-utils";

export type FinancialMetric = {
  title: string;
  value: string;
  change: number;
  metric: string;
  trendMessage: string;
};

export function useDashboardMetrics(
  allTimeStats: DashboardStats | null,
  currentMonthTotal: number,
  previousMonthTotal: number,
): FinancialMetric[] {
  if (!allTimeStats) {
    return [];
  }

  const totalRaisedChange =
    previousMonthTotal > 0
      ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
      : 0;

  return [
    {
      title: "Total Raised",
      value: formatMetricValue(allTimeStats.totalRaised, "currency", "GHS"),
      change: totalRaisedChange,
      metric: "total raised",
      trendMessage: formatTrendMessage(totalRaisedChange, "total raised"),
    },
    {
      title: "Total Donors",
      value: formatMetricValue(allTimeStats.totalDonors, "number"),
      change: 0,
      metric: "total donors",
      trendMessage: formatTrendMessage(0, "total donors"),
    },
    {
      title: "Active Campaigns",
      value: formatMetricValue(allTimeStats.activeCampaigns, "number"),
      change: 0,
      metric: "active campaigns",
      trendMessage: formatTrendMessage(0, "active campaigns"),
    },
  ];
}
