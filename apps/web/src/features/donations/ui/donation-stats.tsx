import { FinancialMetrics } from "@/features/payments/insights/ui/financial-metrics";
import { useDonationMetrics } from "../hooks/use-donation-metrics";
import type { DonationStats } from "../donations-models";
import { formatCurrency } from "@/lib/money";

type DonationStatsProps = {
  stats: DonationStats | null;
};

export function DonationStatsCard({ stats }: DonationStatsProps) {
  const metrics = useDonationMetrics(stats);

  const formattedMetrics = metrics.map((metric) => ({
    title: metric.title,
    value: metric.value.toString(),
    change: metric.change,
    metric: metric.metric,
    trendMessage: metric.trendMessage || "No change",
  }));

  if (stats?.topDonor) {
    formattedMetrics.push({
      title: "Top Donor",
      value: stats.topDonor.isAnonymous ? "Anonymous" : stats.topDonor.name || "Unknown",
      change: 0,
      metric: "topDonor",
      trendMessage: `Contributed ${formatCurrency(stats.topDonor.totalContribution, "GHS")}`,
    });
  }

  return <FinancialMetrics metrics={formattedMetrics} />;
}
