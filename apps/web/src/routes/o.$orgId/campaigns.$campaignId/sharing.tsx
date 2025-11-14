import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/o/$orgId/campaigns/$campaignId/sharing")({
  component: CampaignSharing,
});

function CampaignSharing() {
  return (
    <div>
      <h1>Campaign Sharing</h1>
    </div>
  );
}
