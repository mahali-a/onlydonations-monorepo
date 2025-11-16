import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import ms from "ms";
import { CampaignDetailsLayout } from "@/features/campaigns/org/details/layout";
import { retrieveCampaignDetailFromServer } from "@/features/campaigns/org/server";

const campaignDetailQueryOptions = (orgId: string, campaignId: string) =>
  queryOptions({
    queryKey: ["campaign-detail", orgId, campaignId],
    queryFn: () => retrieveCampaignDetailFromServer({ data: { orgId, campaignId } }),
    staleTime: ms("5 minutes"),
  });

export const Route = createFileRoute("/o/$orgId/campaigns/$campaignId")({
  component: CampaignLayout,
  beforeLoad: async ({ params, context }) => {
    const orgId = context.organization?.id;

    if (!orgId) {
      throw new Error("Organization context is required");
    }

    const data = await context.queryClient.ensureQueryData(
      campaignDetailQueryOptions(orgId, params.campaignId),
    );

    return {
      campaign: data.campaign,
      categories: data.categories,
    };
  },
  loader: async ({ params, context }) => {
    const orgId = context.organization?.id;

    if (!orgId) {
      throw new Error("Organization context is required");
    }

    const data = await context.queryClient.ensureQueryData(
      campaignDetailQueryOptions(orgId, params.campaignId),
    );

    return data;
  },
});

function CampaignLayout() {
  const data = Route.useLoaderData();

  return <CampaignDetailsLayout campaign={data.campaign} />;
}
