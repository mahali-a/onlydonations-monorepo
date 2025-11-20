import { createLazyFileRoute } from "@tanstack/react-router";
import { CampaignSettings } from "@/features/org-campaign-details/settings";

export const Route = createLazyFileRoute("/o/$orgId/campaigns/$campaignId/settings")({
  component: CampaignSettings,
});
