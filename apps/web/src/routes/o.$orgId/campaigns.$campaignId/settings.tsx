import { createFileRoute } from "@tanstack/react-router";
import { CampaignSettings } from "@/features/org-campaign-details/settings";

export const Route = createFileRoute("/o/$orgId/campaigns/$campaignId/settings")({
  component: CampaignSettings,
});
