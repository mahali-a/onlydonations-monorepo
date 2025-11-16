import { createFileRoute } from "@tanstack/react-router";
import { CampaignDetails } from "@/features/campaigns/org/details";

export const Route = createFileRoute("/o/$orgId/campaigns/$campaignId/")({
  component: CampaignDetails,
});
