"use client";

import { lazy, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { calculatePercentageChange, formatChartDate } from "@/lib/utils/dashboard-utils";
import type { ChartDataPoint } from "@/features/org-dashboard/org-dashboard-models";

const DonorGrowthChartImpl = lazy(() =>
  import("./donor-growth-chart-impl").then((m) => ({ default: m.DonorGrowthChartImpl })),
);

type DonorGrowthChartProps = {
  data: ChartDataPoint[];
};

export function DonorGrowthChart({ data }: DonorGrowthChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">No donation data available</p>
        </div>
      </Card>
    );
  }

  const totalDonors = data.reduce((sum, d) => sum + d.donors, 0);
  const firstDayDonors = data[0]?.donors ?? 0;
  const lastDayDonors = data[data.length - 1]?.donors ?? 0;
  const newDonors = lastDayDonors;
  const growthRate = calculatePercentageChange(lastDayDonors, firstDayDonors);

  const chartData = data.map((d) => ({
    date: formatChartDate(d.date),
    donors: d.donors,
  }));

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Donor Growth (30 Days)</h2>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Donors</p>
              <p className="text-lg font-bold">{totalDonors}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Donors</p>
              <p className="text-lg font-bold">{newDonors}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Growth Rate</p>
              <p
                className={`text-lg font-bold ${growthRate >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {growthRate >= 0 ? "+" : ""}
                {growthRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="w-full h-[300px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
              <span className="text-sm text-muted-foreground">Loading chart...</span>
            </div>
          }
        >
          <DonorGrowthChartImpl chartData={chartData} />
        </Suspense>
      </div>
    </Card>
  );
}
