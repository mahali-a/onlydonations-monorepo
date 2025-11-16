import { createFileRoute } from "@tanstack/react-router";
import { CampaignSharing } from "@/features/campaigns/org/details/sharing";

export const Route = createFileRoute("/o/$orgId/campaigns/$campaignId/sharing")({
  component: CampaignSharing,
});
