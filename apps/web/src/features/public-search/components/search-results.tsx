import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { FundraiserCard } from "@/components/cards/fundraiser-card";
import type { SearchResult } from "../public-search-loaders";

type SearchResultsProps = {
  campaigns: SearchResult[];
};

export function SearchResults({ campaigns }: SearchResultsProps) {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-foreground mb-2">No campaigns found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {campaigns.map((campaign) => (
        <motion.div
          key={campaign.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <Link to="/f/$slug" params={{ slug: campaign.slug }} className="block h-full">
            <FundraiserCard
              image={campaign.coverImage}
              title={campaign.title}
              category={campaign.category.name}
              raised={campaign.totalRaised}
              goal={campaign.amount}
              organizer={campaign.beneficiaryName}
              currency={campaign.currency}
            />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
