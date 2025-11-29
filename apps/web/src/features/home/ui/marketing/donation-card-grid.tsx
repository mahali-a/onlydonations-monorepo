import { Button } from "@/components/ui/button";

import type { HomePageCampaign } from "@/features/home/types";

import { DonationCard } from "./donation-card";

type DonationCardGridProps = {
  campaigns: HomePageCampaign[];
  displayCount: number;
  showViewMore?: boolean;
  variant?: "button" | "text-link";
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
};

export function DonationCardGrid({
  campaigns,
  displayCount,
  showViewMore = true,
  variant = "button",
  onLoadMore,
  isLoadingMore = false,
  hasMore = true,
}: DonationCardGridProps) {
  return (
    <div className="mx-auto mb-10 w-full max-w-[1440px]">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.slice(0, displayCount).map((campaign) => (
          <DonationCard key={campaign.id} {...campaign} />
        ))}
      </div>

      {showViewMore &&
        hasMore &&
        (variant === "button" ? (
          onLoadMore ? (
            <Button
              className="mx-auto mt-8 block rounded-xl text-gray-600 hover:text-gray-800"
              disabled={isLoadingMore}
              onClick={onLoadMore}
              type="button"
              variant="outline"
            >
              {isLoadingMore ? "Loading..." : "Load More Campaigns"}
            </Button>
          ) : (
            <Button
              asChild
              className="mx-auto mt-8 block rounded-xl text-gray-600 hover:text-gray-800"
              variant="outline"
            >
              <a href="/f">View More</a>
            </Button>
          )
        ) : (
          <div className="mt-8 text-center">
            <a className="text-sm text-gray-500 transition-colors hover:text-gray-700" href="/f">
              Browse all campaigns →
            </a>
          </div>
        ))}
    </div>
  );
}
