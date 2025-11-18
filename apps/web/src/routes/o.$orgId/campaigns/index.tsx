import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-adapter";
import ms from "ms";
import type { CampaignFilters } from "@/features/org-campaigns";
import { campaignFiltersSchema, CampaignsComponent } from "@/features/org-campaigns";
import { retrieveCampaignsFromServer } from "@/features/org-campaigns/server";

const campaignsQueryOptions = (orgId: string, filters: CampaignFilters) =>
  queryOptions({
    queryKey: ["campaigns", orgId, filters],
    queryFn: () => retrieveCampaignsFromServer({ data: { orgId, ...filters } }),
    staleTime: ms("5 minutes"),
  });

export const Route = createFileRoute("/o/$orgId/campaigns/")({
  component: CampaignsList,
  validateSearch: zodValidator(campaignFiltersSchema),
  loaderDeps: ({ search }) => search,
  loader: ({ deps, context }) => {
    const orgId = context.organization?.id;

    if (!orgId) {
      throw new Error("Organization context is required");
    }

    const filters = campaignFiltersSchema.parse(deps ?? {});
    return context.queryClient.ensureQueryData(campaignsQueryOptions(orgId, filters));
  },
});

function CampaignsList() {
  const { organization } = Route.useRouteContext();
  const search = Route.useSearch();

  if (!organization) {
    throw new Error("Organization context is required");
  }

  const filters = campaignFiltersSchema.parse(search ?? {});
  const { data } = useSuspenseQuery(campaignsQueryOptions(organization.id, filters));

  return (
    <CampaignsComponent
      campaigns={data.campaigns}
      categories={data.categories}
      filters={data.filters}
      pagination={data.pagination}
    />
  );
}
