import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/o/$orgId/campaigns")({
  component: CampaignsLayout,
});

function CampaignsLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
