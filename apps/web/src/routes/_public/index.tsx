import { createFileRoute } from "@tanstack/react-router";
import type { HomePageCampaign } from "@/features/home/types";
import { HomeCampaignsPage } from "@/features/home/ui/home-page";
import { retrieveFeaturedCampaignsFromServer } from "@/server/functions/home";

export const Route = createFileRoute("/_public/")({
  loader: async (): Promise<{ featuredCampaigns: HomePageCampaign[] }> => {
    const campaigns = await retrieveFeaturedCampaignsFromServer();
    return { featuredCampaigns: campaigns };
  },
  component: HomePage,
});

function HomePage() {
  const { featuredCampaigns } = Route.useLoaderData();

  return (
    <div className="bg-background">
      <HomeCampaignsPage featuredCampaigns={featuredCampaigns} />
    </div>
  );
}
