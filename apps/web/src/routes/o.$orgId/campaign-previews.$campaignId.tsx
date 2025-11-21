import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import ms from "ms";
import { CampaignPreviewPage } from "@/features/org-campaign-details/preview/campaign-preview-page";
import { retrieveCampaignPreviewFromServer } from "@/features/org-campaigns/server";
import {
  donationsWithMessagesQueryOptions,
  similarCampaignsQueryOptions,
} from "@/features/public-campaign-details/server";

const campaignPreviewQueryOptions = (campaignId: string, orgId: string) =>
  queryOptions({
    queryKey: ["campaign-preview", campaignId],
    queryFn: () => retrieveCampaignPreviewFromServer({ data: { campaignId, orgId } }),
    staleTime: ms("5 minutes"),
  });

export const Route = createFileRoute("/o/$orgId/campaign-previews/$campaignId")({
  loader: async ({ params, context }) => {
    const { campaignId, orgId } = params;

    if (!campaignId) {
      throw new Response("Campaign ID is required", { status: 400 });
    }

    try {
      const data = await context.queryClient.ensureQueryData(
        campaignPreviewQueryOptions(campaignId, orgId),
      );

      if (!data) {
        throw notFound();
      }

      // Prefetch related data (non-blocking)
      context.queryClient.ensureQueryData(
        similarCampaignsQueryOptions(data.campaign.category.id, data.campaign.id),
      );

      context.queryClient.ensureQueryData(donationsWithMessagesQueryOptions(data.campaign.id));
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        throw notFound();
      }
      throw error;
    }
  },

  component: CampaignPreviewRoute,

  notFoundComponent: () => {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Campaign Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The campaign you're trying to preview doesn't exist.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  },

  errorComponent: ({ error }) => {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error
              ? error.message
              : "We encountered an error loading this preview."}
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  },
});

function CampaignPreviewRoute() {
  const { campaignId, orgId } = Route.useParams();
  const { data } = useSuspenseQuery(campaignPreviewQueryOptions(campaignId, orgId));

  if (!data) {
    return <div>Campaign not found</div>;
  }

  return <CampaignPreviewPage data={data} orgId={orgId} campaignId={campaignId} />;
}
