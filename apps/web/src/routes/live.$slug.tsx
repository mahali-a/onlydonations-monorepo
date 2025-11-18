import { createFileRoute } from "@tanstack/react-router";
import { LiveCampaignComponent } from "@/features/public-live-campaign";
import { liveCampaignQueryOptions } from "@/features/public-live-campaign/server";

export const Route = createFileRoute("/live/$slug")({
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(liveCampaignQueryOptions(params.slug));
  },
  component: LiveCampaignPage,
});

function LiveCampaignPage() {
  return <LiveCampaignComponent />;
}
