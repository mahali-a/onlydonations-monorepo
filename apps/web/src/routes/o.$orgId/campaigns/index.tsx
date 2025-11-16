import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import ms from "ms";
import type { CampaignFilters } from "@/features/campaigns/org";
import { campaignFiltersSchema, CampaignsComponent } from "@/features/campaigns/org";
import { retrieveCampaignsFromServer } from "@/features/campaigns/org/server";

const campaignsQueryOptions = (orgId: string, filters: CampaignFilters) =>
  queryOptions({
    queryKey: ["campaigns", orgId, filters],
    queryFn: () => retrieveCampaignsFromServer({ data: { orgId, ...filters } }),
    staleTime: ms("5 minutes"),
  });

export const Route = createFileRoute("/o/$orgId/campaigns/")({
  component: CampaignsList,
  validateSearch: (search) => campaignFiltersSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: ({ deps, context }) => {
    const orgId = context.organization?.id;

    if (!orgId) {
      throw new Error("Organization context is required");
    }

    return context.queryClient.ensureQueryData(campaignsQueryOptions(orgId, deps));
  },
});

function CampaignsList() {
  const { organization } = Route.useRouteContext();
  const filters = Route.useSearch();

  if (!organization) {
    throw new Error("Organization context is required");
  }

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
