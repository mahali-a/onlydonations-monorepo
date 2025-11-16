import { createFileRoute } from "@tanstack/react-router";
import { CampaignSettings } from "@/features/campaigns/org/details/settings";

export const Route = createFileRoute("/o/$orgId/campaigns/$campaignId/settings")({
  component: CampaignSettings,
});
