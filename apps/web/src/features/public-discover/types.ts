import type {
  retrieveCategoriesWithCampaignCountsFromDatabase,
  retrieveCampaignsByCategoryIdFromDatabase,
  retrieveTrendingCampaignsFromDatabase,
  retrieveDiscoverPageDataFromDatabase,
  retrieveCategoryByNameFromDatabase,
} from "./public-discover-models";

export type CategoryWithCount = Awaited<
  ReturnType<typeof retrieveCategoriesWithCampaignCountsFromDatabase>
>[number];

export type DiscoverCampaign = Awaited<
  ReturnType<typeof retrieveCampaignsByCategoryIdFromDatabase>
>[number];

export type TrendingCampaign = Awaited<
  ReturnType<typeof retrieveTrendingCampaignsFromDatabase>
>[number];

export type CategoryWithCampaigns = {
  id: string;
  name: string;
  campaigns: DiscoverCampaign[];
};

export type DiscoverPageData = Awaited<ReturnType<typeof retrieveDiscoverPageDataFromDatabase>>;

export type Category = NonNullable<Awaited<ReturnType<typeof retrieveCategoryByNameFromDatabase>>>;
