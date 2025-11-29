export type HomePageCampaign = {
  id: string;
  slug: string;
  title: string;
  location: string;
  supporters: string;
  raised: number;
  target: number;
  currency: string;
  imageUrl: string;
};

export type HomeSuccessStory = {
  id: string;
  slug: string;
  title: string;
  currency: string;
  raisedAmount: number;
  donationsCount: number;
  coverImageUrl: string;
  country: string;
};

export type HomeMarketingPayload = {
  featuredCampaigns: HomePageCampaign[];
};

export type HomeCampaignFilterType =
  | "all"
  | "category"
  | "new"
  | "donation-count"
  | "close-to-goal"
  | "charities";

export type HomeCampaignFilterResponse = {
  campaigns: HomePageCampaign[];
};
