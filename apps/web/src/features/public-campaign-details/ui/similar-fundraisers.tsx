import { useRef, Suspense } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuspenseQuery } from "@tanstack/react-query";
import { similarCampaignsQueryOptions } from "../server";
import type { SimilarCampaign } from "../types";
import { Money } from "@/lib/money";

type SimilarFundraisersProps = {
  categoryId: string;
  excludeCampaignId: string;
};

function SimilarFundraisersContent({ categoryId, excludeCampaignId }: SimilarFundraisersProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: campaigns } = useSuspenseQuery(
    similarCampaignsQueryOptions(categoryId, excludeCampaignId),
  );

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#024126] py-16 text-white">
      <div className="mx-auto max-w-[1152px] px-4 sm:px-4">
        <div className="mb-8">
          <h2 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
            More ways to make a difference. Find fundraisers inspired by what you care about.
          </h2>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            Nearby
            <span className="ml-2">▼</span>
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {campaigns.map((campaign) => (
            <SimilarCampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SimilarFundraisersLoading() {
  return (
    <div className="bg-[#024126] py-16 text-white">
      <div className="mx-auto max-w-[1152px] px-4 sm:px-4">
        <div className="mb-8">
          <Skeleton className="h-10 w-2/3 bg-white/10" />
        </div>
        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[280px]">
              <Skeleton className="aspect-[1.6] rounded-xl mb-4 bg-white/10" />
              <Skeleton className="h-4 w-3/4 mb-2 bg-white/10" />
              <Skeleton className="h-3 w-1/2 bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SimilarFundraisers({ categoryId, excludeCampaignId }: SimilarFundraisersProps) {
  return (
    <Suspense fallback={<SimilarFundraisersLoading />}>
      <SimilarFundraisersContent categoryId={categoryId} excludeCampaignId={excludeCampaignId} />
    </Suspense>
  );
}

function SimilarCampaignCard({ campaign }: { campaign: SimilarCampaign }) {
  const progress = Math.min((campaign.totalRaised / campaign.amount) * 100, 100);

  return (
    <Link
      to="/f/$slug"
      params={{ slug: campaign.slug }}
      className="group min-w-[280px] max-w-[280px] snap-start rounded-xl bg-transparent transition-transform hover:-translate-y-1 cursor-pointer block"
    >
      <div className="aspect-[1.6] w-full overflow-hidden rounded-xl bg-white/10 relative">
        <img
          src={campaign.coverImage || "/placeholder-campaign.jpg"}
          alt={campaign.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Location badge placeholder - if we had location data */}
        {/* <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    4 kms away
                </div> */}
      </div>
      <div className="pt-4">
        <h3 className="mb-1 font-bold text-white line-clamp-2 h-12 leading-tight">
          {campaign.title}
        </h3>

        <div className="mb-3 text-sm text-white/80 line-clamp-1">
          by {campaign.beneficiaryName || "Organizer"} for {campaign.categoryName || "Cause"}
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-2 flex items-baseline gap-1 text-sm text-white">
          <span className="font-bold">
            {Money.fromMinor(campaign.totalRaised, campaign.currency).format()}
          </span>
          <span className="text-white/80">raised</span>
        </div>
      </div>
    </Link>
  );
}
