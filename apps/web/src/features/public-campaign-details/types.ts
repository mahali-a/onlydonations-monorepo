import type { SelectCategory } from "@repo/core/database/types";
import type {
  retrievePublicCampaignBySlug,
  retrieveRecentDonationsByCampaign,
  retrieveSimilarCampaignsByCategory,
  retrieveDonationsWithMessagesByCampaign,
} from "./public-campaign-models";

export type PublicCampaign = NonNullable<Awaited<ReturnType<typeof retrievePublicCampaignBySlug>>>;

export type PublicDonation = Awaited<ReturnType<typeof retrieveRecentDonationsByCampaign>>[number];

export type DonationWithMessage = Awaited<ReturnType<typeof retrieveDonationsWithMessagesByCampaign>>[number];

export type SimilarCampaign = Awaited<ReturnType<typeof retrieveSimilarCampaignsByCategory>>[number];

export type CampaignDetailData = {
  campaign: PublicCampaign;
  donations: PublicDonation[];
  categories: SelectCategory[];
};
