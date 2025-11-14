import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/o/$orgId/campaigns/$campaignId/")({
  component: CampaignOverview,
});

function CampaignOverview() {
  return (
    <div>
      <h1>Campaign Overview</h1>
    </div>
  );
}
