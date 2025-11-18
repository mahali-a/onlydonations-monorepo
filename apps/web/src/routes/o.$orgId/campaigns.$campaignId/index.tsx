import { createFileRoute } from "@tanstack/react-router";
import { CampaignDetails } from "@/features/org-campaign-details/details";

export const Route = createFileRoute("/o/$orgId/campaigns/$campaignId/")({
  component: CampaignDetails,
});
