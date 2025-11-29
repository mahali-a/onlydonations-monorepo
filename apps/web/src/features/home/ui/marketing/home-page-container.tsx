import type { HomePageCampaign } from "@/features/home/types";

// import { CampaignHero } from "./campaign-hero";
// import { FeaturedCampaigns } from "./featured-campaigns";
import { Hero } from "./hero";

// import { KeyBenefits } from "./key-benefits";
// import { StartRaisingFunds } from "./start-raising-funds";
// import { Testimonials } from "./testimonials";

type HomePageContainerProps = {
  featuredCampaigns: HomePageCampaign[];
};

export function HomePageContainer(_: HomePageContainerProps) {
  return (
    <div className="flex flex-col justify-center gap-20 px-0">
      <Hero />
      {/* <KeyBenefits /> */}
      {/* <StartRaisingFunds /> */}
      {/* <FeaturedCampaigns initialCampaigns={featuredCampaigns} /> */}
      {/* <Testimonials /> */}
      {/* <CampaignHero /> */}
    </div>
  );
}
