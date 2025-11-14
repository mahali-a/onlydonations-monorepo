import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FinancialMetric = {
  title: string;
  value: string;
  change: number;
  description: string;
};

type FinancialMetricsProps = {
  metrics: FinancialMetric[];
};

function getTrendMessage(change: number): string {
  if (change > 0) return `Up ${change.toFixed(1)}% this month`;
  if (change < 0) return `Down ${Math.abs(change).toFixed(1)}% this month`;
  return "No change this month";
}

export function FinancialMetrics({ metrics }: FinancialMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
      {metrics.map((metric) => (
        <Card className="@container/card overflow-hidden" key={metric.title}>
          <CardHeader>
            <CardDescription>{metric.title}</CardDescription>
            <CardTitle className="font-semibold text-xl sm:text-2xl @[250px]/card:text-3xl tabular-nums truncate">
              {metric.value}
            </CardTitle>
            <CardAction>
              <Badge
                className={cn({
                  "border-green-600 bg-green-100 text-green-600": metric.change > 0,
                  "border-red-600 bg-red-100 text-red-600": metric.change < 0,
                  "border-gray-600 bg-gray-100 text-gray-600": metric.change === 0,
                })}
                variant="outline"
              >
                {metric.change > 0 ? (
                  <TrendingUpIcon className="h-3 w-3" />
                ) : metric.change < 0 ? (
                  <TrendingDownIcon className="h-3 w-3" />
                ) : null}
                {metric.change > 0 && "+"}
                {metric.change.toFixed(1)}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="flex items-center gap-2 font-medium w-full">
              <span className="truncate">{getTrendMessage(metric.change)}</span>
              {metric.change > 0 && <TrendingUpIcon className="size-4 flex-shrink-0" />}
              {metric.change < 0 && <TrendingDownIcon className="size-4 flex-shrink-0" />}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
