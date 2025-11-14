import { formatForDashboard } from "@/lib/money";

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

export function formatMetricValue(
  value: number,
  type: "currency" | "number" = "number",
  currency = "GHS",
): string {
  if (type === "currency") {
    return formatForDashboard(value, currency);
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

export function getTrendMessage(change: number, metric: string): string {
  if (change > 0) {
    return `Up ${Math.abs(change).toFixed(1)}% this month`;
  }
  if (change < 0) {
    return `Down ${Math.abs(change).toFixed(1)}% this month`;
  }
  return `No change in ${metric}`;
}
