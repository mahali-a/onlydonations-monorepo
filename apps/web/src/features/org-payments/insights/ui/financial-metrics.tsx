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

type FinancialMetricsProps = {
  metrics: Array<{
    title: string;
    value: string;
    change: number;
    metric: string;
    trendMessage: string;
  }>;
};

export function FinancialMetrics({ metrics }: FinancialMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
      {metrics.map((metric) => (
        <Card className="@container/card" key={metric.title}>
          <CardHeader>
            <CardDescription>{metric.title}</CardDescription>
            <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
              {metric.value}
            </CardTitle>
            <CardAction>
              <Badge
                className={cn({
                  "border-green-600 bg-green-100 text-green-600": metric.change > 0,
                  "border-red-600 bg-red-100 text-red-600": metric.change < 0,
                })}
                variant="outline"
              >
                {metric.change >= 0 ? (
                  <TrendingUpIcon className="h-3 w-3" />
                ) : (
                  <TrendingDownIcon className="h-3 w-3" />
                )}
                {metric.change >= 0 && "+"}
                {metric.change.toFixed(1)}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {metric.trendMessage}
              {metric.change > 0 && <TrendingUpIcon className="size-4" />}
              {metric.change < 0 && <TrendingDownIcon className="size-4" />}
            </div>
            <div className="text-muted-foreground">vs previous month</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
