import { FundsRaisedChart } from "./funds-raised-chart";
import { DonorGrowthChart } from "./donor-growth-chart";
import type { ChartDataPoint } from "@/features/dashboard/dashboard-models";

interface ChartsWrapperProps {
  chartData: ChartDataPoint[];
}

export function ChartsWrapper({ chartData }: ChartsWrapperProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <FundsRaisedChart data={chartData} />
      <DonorGrowthChart data={chartData} />
    </div>
  );
}
