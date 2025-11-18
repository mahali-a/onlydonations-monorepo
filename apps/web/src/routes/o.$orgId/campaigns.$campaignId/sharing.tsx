import { createFileRoute } from "@tanstack/react-router";
import { CampaignSharing } from "@/features/org-campaign-details/sharing";

export const Route = createFileRoute("/o/$orgId/campaigns/$campaignId/sharing")({
  component: CampaignSharing,
});
