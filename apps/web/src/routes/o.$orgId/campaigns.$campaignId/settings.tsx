import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/o/$orgId/campaigns/$campaignId/settings")({
  component: CampaignSettings,
});

function CampaignSettings() {
  return (
    <div>
      <h1>Campaign Settings</h1>
    </div>
  );
}
