"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { calculatePercentageChange, formatChartDate } from "@/features/org-dashboard/dashboard-utils";
import type { ChartDataPoint } from "@/features/org-dashboard/dashboard-models";

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

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDonors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "0.75rem" }} />
            <YAxis stroke="#6b7280" style={{ fontSize: "0.75rem" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
              }}
              formatter={(value: number) => [value, "Donors"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="donors"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorDonors)"
              name="Donors"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
