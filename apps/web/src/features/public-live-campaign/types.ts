import type {
  retrieveLiveCampaignBySlug,
  retrieveRecentLiveDonations,
} from "./live-campaign-models";

export type LiveCampaign = NonNullable<Awaited<ReturnType<typeof retrieveLiveCampaignBySlug>>>;

export type LiveDonation = Awaited<ReturnType<typeof retrieveRecentLiveDonations>>[number];

export type LiveCampaignData = {
  campaign: LiveCampaign;
  donations: LiveDonation[];
};
