import { useSuspenseQuery } from "@tanstack/react-query";
import { CategoryList } from "./components/category-list";
import { DiscoverHero } from "./components/discover-hero";
import { FundraiserSection } from "./components/fundraiser-section";
import { discoverPageQueryOptions } from "./server";

export function DiscoverComponent() {
  const { data } = useSuspenseQuery(discoverPageQueryOptions(3));

  return (
    <div className="bg-background flex flex-col">
      <div className="flex-1 pb-16">
        <DiscoverHero />
        <CategoryList categories={data.allCategories} />

        <div className="space-y-8">
          {data.trending.length > 0 && (
            <FundraiserSection title="Trending near you" campaigns={data.trending} />
          )}

          {data.categories.map((category) => (
            <FundraiserSection
              key={category.id}
              title={`${category.name} fundraisers`}
              campaigns={category.campaigns}
              categorySlug={category.name.toLowerCase()}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
