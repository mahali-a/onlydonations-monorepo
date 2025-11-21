import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { FundraiserCard } from "@/components/fundraiser-card";
import { Button } from "@/components/ui/button";
import type { DiscoverCampaign } from "../public-discover-models";

interface FundraiserSectionProps {
  title: string;
  campaigns: DiscoverCampaign[];
  categorySlug?: string;
}

export function FundraiserSection({ title, campaigns, categorySlug }: FundraiserSectionProps) {
  if (campaigns.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        {categorySlug && (
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80 hover:bg-transparent p-0 font-semibold"
            asChild
          >
            <Link to="/discover/$category" params={{ category: categorySlug }}>
              See all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <Link key={campaign.id} to="/f/$slug" params={{ slug: campaign.slug }} className="block">
            <FundraiserCard
              image={campaign.coverImage || "/placeholder-campaign.jpg"}
              title={campaign.title}
              category={campaign.categoryName}
              raised={campaign.totalRaised}
              goal={campaign.amount}
              organizer={campaign.beneficiaryName}
              currency={campaign.currency}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
