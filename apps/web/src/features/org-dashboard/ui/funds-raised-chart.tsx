import { TrendingUp } from "lucide-react";
import * as React from "react";
import { lazy, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { formatMetricValue } from "@/lib/utils/dashboard-utils";
import type { ChartDataPoint } from "@/features/org-dashboard/org-dashboard-models";

const FundsRaisedChartImpl = lazy(() =>
  import("./funds-raised-chart-impl").then((m) => ({ default: m.FundsRaisedChartImpl })),
);

type FundsRaisedChartProps = {
  data: ChartDataPoint[];
};

function formatDateForChart(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function FundsRaisedChart({ data }: FundsRaisedChartProps) {
  const formattedData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      formattedDate: formatDateForChart(item.date),
      displayAmount: item.amount,
    }));
  }, [data]);

  const totalRaised = React.useMemo(() => {
    return data.reduce((sum: number, item) => sum + item.amount, 0);
  }, [data]);

  const totalDonations = React.useMemo(() => {
    return data.reduce((sum: number, item) => sum + item.donors, 0);
  }, [data]);

  const averagePerDay = React.useMemo(() => {
    if (data.length === 0) {
      return 0;
    }
    return totalRaised / data.length;
  }, [totalRaised, data.length]);

  const hasData = formattedData.some((item) => item.amount > 0);

  return (
    <Card className="p-6 flex flex-col">
      <div className="space-y-4 flex-1 flex flex-col">
        <div>
          <h2 className="text-lg font-semibold">Funds Raised Over Time</h2>
        </div>

        <Suspense
          fallback={
            <div className="w-full h-[300px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
              <span className="text-sm text-muted-foreground">Loading chart...</span>
            </div>
          }
        >
          <FundsRaisedChartImpl formattedData={formattedData} />
        </Suspense>

        {hasData ? (
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                {formatMetricValue(totalRaised, "currency", "GHS")} raised from {totalDonations}{" "}
                donations
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground leading-none">
                Average: {formatMetricValue(averagePerDay, "currency", "GHS")} per day
              </div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            No donations received in the selected period
          </div>
        )}
      </div>
    </Card>
  );
}
