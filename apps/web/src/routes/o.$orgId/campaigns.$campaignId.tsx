import { createFileRoute } from "@tanstack/react-router";
import { CampaignDetailsLayout } from "@/features/org-campaign-details/details/layout";
import { campaignDetailQueryOptions } from "@/features/org-campaigns/server";

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
  return <CampaignDetailsLayout />;
}
