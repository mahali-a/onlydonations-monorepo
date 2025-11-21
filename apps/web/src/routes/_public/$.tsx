import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import ms from "ms";
import { RefreshRouteOnSave } from "@/components/cms/refresh-route-on-save";
import { RenderBlocks } from "@/components/cms/render-blocks";
import { NotFound } from "@/components/not-found";
import {
  retrieveCmsApiUrlFromServer,
  retrieveCmsBaseUrlFromServer,
  retrievePageFromServerBySlugWithDraft,
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
  notFoundComponent: () => <NotFound />,
});

function CMSPage() {
  const params = Route.useParams();
  const slug = params._splat || "home";
  const { data } = useSuspenseQuery(pageQueryOptions(slug));

  return (
    <div className="bg-background">
      <RefreshRouteOnSave cmsApiUrl={data.serverApiUrl} />
      <main>
        <RenderBlocks blocks={data.page.blocks} cmsBaseUrl={data.cmsBaseUrl} />
      </main>
    </div>
  );
}
