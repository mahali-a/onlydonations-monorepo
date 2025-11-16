import { FinancialMetrics } from "@/features/payments/insights/ui";
import type { FinancialMetric } from "@/features/dashboard/hooks/use-dashboard-metrics";

type MetricsGridProps = {
  metrics: FinancialMetric[];
};

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return <FinancialMetrics metrics={metrics} />;
}
