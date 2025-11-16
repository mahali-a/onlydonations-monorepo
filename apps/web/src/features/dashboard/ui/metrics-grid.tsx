import { FinancialMetrics } from "@/features/payments/insights/ui";
import type { FinancialMetric } from "@/features/dashboard/hooks/use-dashboard-metrics";

interface MetricsGridProps {
  metrics: FinancialMetric[];
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return <FinancialMetrics metrics={metrics} />;
}
