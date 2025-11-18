import { TrendingUp } from "lucide-react";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { formatMetricValue } from "@/lib/utils/dashboard-utils";
import type { ChartDataPoint } from "@/features/org-dashboard/dashboard-models";

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

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={formattedData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="formattedDate" axisLine={false} tickLine={false} fontSize={12} />
            <Tooltip
              formatter={(value: number) => [
                formatMetricValue(Number(value), "currency", "GHS"),
                "Amount Raised",
              ]}
              labelStyle={{ color: "#374151" }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="displayAmount"
              stroke="#f97316"
              fill="#f97316"
              fillOpacity={0.4}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>

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
