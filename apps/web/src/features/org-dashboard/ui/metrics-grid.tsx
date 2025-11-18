import { FinancialMetrics } from "@/features/org-payments/insights/ui";
import type { FinancialMetric } from "@/features/org-dashboard/hooks/use-dashboard-metrics";

type MetricsGridProps = {
  metrics: FinancialMetric[];
};

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return <FinancialMetrics metrics={metrics} />;
}
