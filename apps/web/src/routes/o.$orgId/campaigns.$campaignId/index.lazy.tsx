import { createLazyFileRoute } from "@tanstack/react-router";
import { CampaignDetails } from "@/features/org-campaign-details/details";

export const Route = createLazyFileRoute("/o/$orgId/campaigns/$campaignId/")({
  component: CampaignDetails,
});
