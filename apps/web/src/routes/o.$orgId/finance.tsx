import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import ms from "ms";
import { z } from "zod";
import { retrieveFinancialInsightsFromServer } from "@/features/payments/insights/server";
import { CampaignTable, FinancialMetrics, FundsChart } from "@/features/payments/insights/ui";

const financeSearchSchema = z.object({
  page: z.number().int().positive().default(1).catch(1),
  limit: z.number().int().positive().default(10).catch(10),
});

const financialInsightsQueryOptions = (orgId: string, page: number, limit: number) =>
  queryOptions({
    queryKey: ["financial-insights", orgId, page, limit],
    queryFn: () =>
      retrieveFinancialInsightsFromServer({ data: { organizationId: orgId, page, limit } }),
    staleTime: ms("5 minutes"),
  });

export const Route = createFileRoute("/o/$orgId/finance")({
  component: FinancialInsights,
  validateSearch: (search) => financeSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({
    page: search.page,
    limit: search.limit,
  }),
  loader: ({ deps, context }) => {
    const orgId = context.organization?.id;

    if (!orgId) {
      throw new Error("Organization context is required");
    }

    return context.queryClient.ensureQueryData(
      financialInsightsQueryOptions(orgId, deps.page, deps.limit),
    );
  },
});

function FinancialInsights() {
  const { organization } = Route.useRouteContext();
  const { page, limit } = Route.useSearch();
  const navigate = useNavigate();

  if (!organization) {
    throw new Error("Organization context is required");
  }

  const { data } = useSuspenseQuery(financialInsightsQueryOptions(organization.id, page, limit));
  const { metrics, chartData, campaigns, currency, pagination } = data;

  const handlePageChange = (newPage: number) => {
    navigate({ search: { page: newPage, limit } as any });
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 pt-6 w-full space-y-6 bg-background pb-8 overflow-x-auto">
      <div className="w-full flex flex-col md:flex-row items-start md:items-center gap-4 md:justify-between">
        <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Financial Insights</h1>
          <p className="text-muted-foreground">
            Track {organization.name}'s fundraising performance and campaign financial analytics
          </p>
        </div>
      </div>

      <FinancialMetrics metrics={metrics} />

      <FundsChart data={chartData} currency={currency} />

      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Campaign Financial Performance</h2>
          <p className="text-sm text-muted-foreground">
            Detailed breakdown of earnings and fees by campaign
          </p>
        </div>
        <CampaignTable
          campaigns={campaigns}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
