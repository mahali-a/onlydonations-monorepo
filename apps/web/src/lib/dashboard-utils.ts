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

export function formatTrendMessage(change: number, metric: string): string {
  if (change > 0) {
    return `Up ${Math.abs(change).toFixed(1)}% this month`;
  }
  if (change < 0) {
    return `Down ${Math.abs(change).toFixed(1)}% this month`;
  }
  return `No change in ${metric}`;
}

export function classifyTrend(percentageChange: number): {
  color: "green" | "red";
  direction: "up" | "down";
} {
  if (percentageChange > 0) {
    return { color: "green", direction: "up" };
  }
  return { color: "red", direction: "down" };
}

export function formatDashboardDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatChartDate(date: string | Date | null | undefined): string {
  if (!date) {
    return "";
  }
  const d = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
