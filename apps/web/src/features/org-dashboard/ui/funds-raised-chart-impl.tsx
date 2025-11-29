import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatMetricValue } from "@/lib/dashboard-utils";

type ChartImplProps = {
  formattedData: Array<{
    formattedDate: string;
    displayAmount: number;
    amount: number;
    donors: number;
    date: string;
  }>;
};

export function FundsRaisedChartImpl({ formattedData }: ChartImplProps) {
  return (
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
  );
}
