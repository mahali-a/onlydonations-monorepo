import type { HomePageCampaign } from "@/features/home/types";

import { HomePageContainer } from "./marketing/home-page-container";

type HomeCampaignsPageProps = {
  featuredCampaigns: HomePageCampaign[];
};

export function HomeCampaignsPage({ featuredCampaigns }: HomeCampaignsPageProps) {
  return <HomePageContainer featuredCampaigns={featuredCampaigns} />;
}
