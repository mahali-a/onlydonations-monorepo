import type { DonationStats } from "../donations-models";

type MetricItem = {
  title: string;
  value: string | number;
  change: number;
  isIncrease: boolean;
  metric: string;
  trendMessage?: string;
};

const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
};

const formatMetricValue = (value: number, type: "currency" | "count" = "count"): string => {
  if (type === "currency") {
    return `GHS ${(value / 100).toFixed(2)}`;
  }
  return value.toString();
};

export function useDonationMetrics(stats: DonationStats | null): MetricItem[] {
  if (!stats) {
    return [
      {
        title: "Total Donors",
        value: "0",
        change: 0,
        isIncrease: false,
        metric: "donors",
        trendMessage: "No data yet",
      },
      {
        title: "Returning Donors",
        value: "0",
        change: 0,
        isIncrease: false,
        metric: "returning",
        trendMessage: "No data yet",
      },
      {
        title: "Average Donation",
        value: "GHS 0.00",
        change: 0,
        isIncrease: false,
        metric: "average",
        trendMessage: "No data yet",
      },
      {
        title: "Total Raised",
        value: "GHS 0.00",
        change: 0,
        isIncrease: false,
        metric: "total",
        trendMessage: "No data yet",
      },
    ];
  }

  const totalDonorsChange = calculatePercentageChange(stats.totalDonors, stats.totalDonorsPrevious);

  const returningDonorsChange = calculatePercentageChange(
    stats.returningDonors,
    stats.returningDonorsPrevious,
  );

  const averageDonationChange = calculatePercentageChange(
    Math.round(stats.averageDonation),
    Math.round(stats.averageDonationPrevious),
  );

  const totalAmount = stats.totalAmount;
  const totalAmountPrevious = stats.totalAmountPrevious;
  const totalAmountChange = calculatePercentageChange(totalAmount, totalAmountPrevious);

  return [
    {
      title: "Total Donors",
      value: stats.totalDonors.toLocaleString(),
      change: totalDonorsChange,
      isIncrease: totalDonorsChange >= 0,
      metric: "donors",
      trendMessage:
        totalDonorsChange > 0
          ? `${Math.abs(totalDonorsChange)}% more donors`
          : totalDonorsChange < 0
            ? `${Math.abs(totalDonorsChange)}% fewer donors`
            : "Same as last month",
    },
    {
      title: "Returning Donors",
      value: stats.returningDonors.toLocaleString(),
      change: returningDonorsChange,
      isIncrease: returningDonorsChange >= 0,
      metric: "returning",
      trendMessage:
        returningDonorsChange > 0
          ? `${Math.abs(returningDonorsChange)}% more repeat donors`
          : returningDonorsChange < 0
            ? `${Math.abs(returningDonorsChange)}% fewer repeat donors`
            : "Same as last month",
    },
    {
      title: "Average Donation",
      value: formatMetricValue(stats.averageDonation, "currency"),
      change: averageDonationChange,
      isIncrease: averageDonationChange >= 0,
      metric: "average",
      trendMessage:
        averageDonationChange > 0
          ? `${Math.abs(averageDonationChange)}% higher average`
          : averageDonationChange < 0
            ? `${Math.abs(averageDonationChange)}% lower average`
            : "Same as last month",
    },
    {
      title: "Total Raised",
      value: formatMetricValue(totalAmount, "currency"),
      change: totalAmountChange,
      isIncrease: totalAmountChange >= 0,
      metric: "total",
      trendMessage:
        totalAmountChange > 0
          ? `${Math.abs(totalAmountChange)}% more raised`
          : totalAmountChange < 0
            ? `${Math.abs(totalAmountChange)}% less raised`
            : "Same as last month",
    },
  ];
}
