import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/o/$orgId/campaigns/")({
  component: CampaignsList,
});

function CampaignsList() {
  return (
    <div>
      <h1>Campaigns</h1>
    </div>
  );
}
