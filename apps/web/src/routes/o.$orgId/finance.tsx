import { queryOptions } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import ms from "ms";
import { z } from "zod";
import { retrieveFinancialInsightsFromServer } from "@/features/org-payments/insights/server";

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
  validateSearch: financeSearchSchema,
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
