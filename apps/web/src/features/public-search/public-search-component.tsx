import type { SelectCategory } from "@repo/core/database/types";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Suspense } from "react";
import { FilterBar } from "./components/filter-bar";
import { SearchHero } from "./components/search-hero";
import { SearchPagination } from "./components/search-pagination";
import { SearchResults } from "./components/search-results";
import { publicCampaignsInfiniteQueryOptions } from "./public-search-loaders";
import type { SearchFilters } from "./public-search-schemas";

function SearchResultsSection() {
  const search = useSearch({ from: "/_public/s" }) as Partial<SearchFilters>;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(
    publicCampaignsInfiniteQueryOptions(search),
  );

  const campaigns = data.pages.flatMap((page) => page.campaigns);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <SearchResults campaigns={campaigns} />
      <SearchPagination
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
      />
    </motion.div>
  );
}

function SearchResultsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }, (_, i) => `loading-skeleton-${i}`).map((key) => (
        <div key={key} className="animate-pulse">
          <div className="aspect-[16/10] bg-gray-200 rounded-xl mb-4" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function SearchComponent() {
  const categories: SelectCategory[] = [];

  return (
    <div className="bg-white flex flex-col">
      <div className="flex-1 pb-16">
        <SearchHero />
        <FilterBar categories={categories} />

        <div className="container mx-auto px-4 py-8 space-y-12">
          <Suspense fallback={<SearchResultsLoading />}>
            <SearchResultsSection />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
