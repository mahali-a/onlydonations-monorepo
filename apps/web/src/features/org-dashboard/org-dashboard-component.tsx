import { useDashboardMetrics } from "./hooks/use-dashboard-metrics";
import type {
  CampaignPerformance as CampaignPerformanceType,
  ChartDataPoint,
  DashboardStats,
  RecentDonation,
} from "./org-dashboard-models";
import {
  CampaignPerformance,
  ChartsWrapper,
  MetricsGrid,
  RecentActivity,
  WelcomeHeader,
} from "./ui";

type DashboardProps = {
  user?: { name: string | null } | null;
  allTimeStats: DashboardStats | null;
  currentMonthTotal: number;
  previousMonthTotal: number;
  recentDonations: RecentDonation[];
  topCampaigns: CampaignPerformanceType[];
  chartData: ChartDataPoint[];
};

export function Dashboard({
  user,
  allTimeStats,
  currentMonthTotal,
  previousMonthTotal,
  recentDonations,
  topCampaigns,
  chartData,
}: DashboardProps) {
  const metrics = useDashboardMetrics(allTimeStats, currentMonthTotal, previousMonthTotal);

  return (
    <div className="container mx-auto  pt-6 w-full space-y-6 bg-background pb-8 overflow-x-auto">
      <WelcomeHeader userName={user?.name} />

      <MetricsGrid metrics={metrics} />

      <ChartsWrapper chartData={chartData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity donations={recentDonations} />
        <CampaignPerformance campaigns={topCampaigns} />
      </div>
    </div>
  );
}
