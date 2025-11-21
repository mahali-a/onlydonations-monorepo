import type { FinancialMetric } from "@/features/org-dashboard/hooks/use-dashboard-metrics";
import { FinancialMetrics } from "@/features/org-payments/insights/ui";

type MetricsGridProps = {
  metrics: FinancialMetric[];
};

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return <FinancialMetrics metrics={metrics} />;
}
