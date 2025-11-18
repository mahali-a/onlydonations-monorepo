import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DiscoverHero } from "@/features/public-discover/components/discover-hero";
import { CategoryList } from "@/features/public-discover/components/category-list";
import { FundraiserSection } from "@/features/public-discover/components/fundraiser-section";
import { discoverPageQueryOptions } from "@/features/public-discover/server";

export const Route = createFileRoute("/_public/discover/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(discoverPageQueryOptions(3));
  },
  component: DiscoverPage,
});

function DiscoverPage() {
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
