import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DonorGrowthChartImplProps = {
  chartData: Array<{ date: string; donors: number }>;
};

export function DonorGrowthChartImpl({ chartData }: DonorGrowthChartImplProps) {
  return (
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
  );
}
