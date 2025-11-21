import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { FundraiserCard } from "@/components/fundraiser-card";
import { Button } from "@/components/ui/button";
import { categoryCampaignsQueryOptions } from "@/features/public-discover/server";

export const Route = createFileRoute("/_public/discover/$category")({
  loader: async ({ params, context }) => {
    const { category } = params;

    const data = await context.queryClient.ensureQueryData(
      categoryCampaignsQueryOptions(category, 20),
    );

    if (!data) {
      throw notFound();
    }
  },

  component: CategoryPage,

  notFoundComponent: () => {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Category Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The category you're looking for doesn't exist or has no fundraisers.
          </p>
          <a
            href="/discover"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Browse All Categories
          </a>
        </div>
      </div>
    );
  },
});

function CategoryPage() {
  const { category } = Route.useParams();
  const { data } = useSuspenseQuery(categoryCampaignsQueryOptions(category, 20));

  if (!data) {
    return null;
  }

  const { category: categoryData, campaigns } = data;

  return (
    <div className="bg-background flex flex-col">
      <div className="flex-1 pb-16">
        {/* Hero Section */}
        <div className="w-full bg-background py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-foreground">
                  {categoryData.name} fundraisers
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl max-w-[600px]">
                  Support {categoryData.name.toLowerCase()} causes and make a difference in people's
                  lives.
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-8"
                  asChild
                >
                  <Link to="/discover">Browse all categories</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="container mx-auto px-4 md:px-6 py-8">
          {campaigns.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-foreground mb-2">No campaigns found</h3>
              <p className="text-muted-foreground mb-6">
                There are no campaigns in this category yet.
              </p>
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/discover">Browse other categories</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  to="/f/$slug"
                  params={{ slug: campaign.slug }}
                  className="block"
                >
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
          )}
        </div>
      </div>
    </div>
  );
}
