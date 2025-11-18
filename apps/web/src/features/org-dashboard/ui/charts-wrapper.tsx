import { FundsRaisedChart } from "./funds-raised-chart";
import { DonorGrowthChart } from "./donor-growth-chart";
import type { ChartDataPoint } from "@/features/org-dashboard/dashboard-models";

type ChartsWrapperProps = {
  chartData: ChartDataPoint[];
};

export function ChartsWrapper({ chartData }: ChartsWrapperProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <FundsRaisedChart data={chartData} />
      <DonorGrowthChart data={chartData} />
    </div>
  );
}
