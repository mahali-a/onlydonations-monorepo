import { TrendingUp } from "lucide-react";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMetricValue } from "@/lib/utils/dashboard-utils";

type ChartData = Array<{ date: string; amount: number; count: number }>;

type FundsChartProps = {
  data: ChartData;
  currency: string;
};

function formatDateForChart(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function FundsChart({ data, currency }: FundsChartProps) {
  const formattedData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      formattedDate: formatDateForChart(item.date),
      displayAmount: item.amount / 100,
    }));
  }, [data]);

  const totalRaised = React.useMemo(() => {
    return data.reduce((sum: number, item) => sum + item.amount, 0);
  }, [data]);

  const totalDonations = React.useMemo(() => {
    return data.reduce((sum: number, item) => sum + item.count, 0);
  }, [data]);

  const averagePerDay = React.useMemo(() => {
    if (data.length === 0) {
      return 0;
    }
    return totalRaised / data.length;
  }, [totalRaised, data.length]);

  const hasData = formattedData.some((item) => item.amount > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funds Raised Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
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
                  formatMetricValue(Number(value) * 100, "currency", currency),
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
        </div>
      </CardContent>
      <CardFooter>
        {hasData ? (
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                {formatMetricValue(totalRaised, "currency", currency)} raised from {totalDonations}{" "}
                donations
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground leading-none">
                Average: {formatMetricValue(averagePerDay, "currency", currency)} per day
              </div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            No donations received in the selected period
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
