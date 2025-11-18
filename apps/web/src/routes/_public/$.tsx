import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import ms from "ms";
import { PublicNavbar } from "@/components/navigation/public-navbar";
import { RefreshRouteOnSave } from "@/components/cms/refresh-route-on-save";
import { RenderBlocks } from "@/components/cms/render-blocks";
import {
  retrievePageFromServerBySlugWithDraft,
  retrieveCmsApiUrlFromServer,
  retrieveCmsBaseUrlFromServer,
} from "@/server/functions/cms";

const pageQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["cms-page", slug],
    queryFn: async () => {
      const [page, apiUrl, baseUrl] = await Promise.all([
        retrievePageFromServerBySlugWithDraft({ data: { slug } }),
        retrieveCmsApiUrlFromServer(),
        retrieveCmsBaseUrlFromServer(),
      ]);

      if (!page) {
        throw notFound();
      }

      return {
        page: page as any,
        serverApiUrl: apiUrl,
        cmsBaseUrl: baseUrl,
      };
    },
    staleTime: ms("30 seconds"),
  });

export const Route = createFileRoute("/_public/$")({
  component: CMSPage,
  loader: ({ params, context }) => {
    const slug = params._splat || "home";
    return context.queryClient.ensureQueryData(pageQueryOptions(slug));
  },
  errorComponent: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
      </div>
    </div>
  ),
});

function CMSPage() {
  const { settings } = Route.useRouteContext();
  const params = Route.useParams();
  const slug = params._splat || "home";
  const { data } = useSuspenseQuery(pageQueryOptions(slug));

  return (
    <div className="min-h-screen bg-background">
      <RefreshRouteOnSave cmsApiUrl={data.serverApiUrl} />
      <PublicNavbar settings={settings} />
      <main>
        <RenderBlocks blocks={data.page.blocks} cmsBaseUrl={data.cmsBaseUrl} />
      </main>
    </div>
  );
}
