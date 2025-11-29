import { useState } from "react";

import { Featured } from "@/components/icons/marketing";
import type { HomeCampaignFilterType, HomePageCampaign } from "@/features/home/types";

import { DonationCardGrid } from "./donation-card-grid";

const DEFAULT_FILTER: HomeCampaignFilterType = "close-to-goal";
const FILTERS: HomeCampaignFilterType[] = ["close-to-goal", "new", "charities"];

type FeaturedCampaignsProps = {
  initialCampaigns: HomePageCampaign[];
};

export function FeaturedCampaigns({ initialCampaigns }: FeaturedCampaignsProps) {
  const [campaigns] = useState<HomePageCampaign[]>(initialCampaigns);
  const [activeFilter, setActiveFilter] = useState<HomeCampaignFilterType>(DEFAULT_FILTER);

  // TODO: Implement filter functionality with server function
  const handleFilterChange = (filter: HomeCampaignFilterType) => {
    if (filter === activeFilter) return;
    setActiveFilter(filter);
    // Will be implemented with server function
  };

  return (
    <section className="mx-auto max-w-[1440px] py-14">
      <div className="mb-2 flex items-center justify-center gap-2">
        <Featured />
        <span className="text-xs font-normal uppercase text-[#6C7A93]">Featured Campaigns</span>
      </div>

      <h1 className="relative z-10 mb-10 text-center font-eudoxus text-[34px] font-bold leading-10 lg:text-[58px] lg:leading-tight">
        Fundraisers that can{" "}
        <span className="relative font-eudoxus">
          Benefit
          <span className="absolute inset-x-0 bottom-2 z-[-10] h-3 bg-[#FDBE7F] md:h-6" />
        </span>
        <br />
        from your Generosity
      </h1>

      <div className="mb-8 flex flex-wrap justify-start gap-4">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            className={`rounded-full border px-4 py-2 text-center font-geist text-sm transition-all ${
              activeFilter === filter
                ? "bg-[#FDBE7F] font-medium text-[#8A4603]"
                : "hover:bg-[#FDBE7F] hover:font-medium hover:text-[#8A4603]"
            }`}
            onClick={() => handleFilterChange(filter)}
            type="button"
          >
            {formatFilterLabel(filter)}
          </button>
        ))}
      </div>

      <DonationCardGrid campaigns={campaigns} displayCount={6} showViewMore variant="text-link" />
    </section>
  );
}

function formatFilterLabel(filter: HomeCampaignFilterType) {
  switch (filter) {
    case "close-to-goal":
      return "Close to Goal";
    case "new":
      return "New Campaigns";
    case "charities":
      return "Charities";
    case "donation-count":
      return "Top Supported";
    case "category":
      return "Category";
    default:
      return "All";
  }
}
