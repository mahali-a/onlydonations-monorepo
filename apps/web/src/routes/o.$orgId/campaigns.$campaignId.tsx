import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/o/$orgId/campaigns/$campaignId")({
  component: CampaignLayout,
});

function CampaignLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
