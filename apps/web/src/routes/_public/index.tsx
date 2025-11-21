// @ts-nocheck - Payload type definitions are complex and may not match exactly

import type { Page } from "@repo/types/payload";
import { createFileRoute } from "@tanstack/react-router";
import { RenderBlocks } from "@/components/cms/render-blocks";
import { retrieveCmsBaseUrlFromServer, retrievePageFromServerBySlug } from "@/server/functions/cms";

export const Route = createFileRoute("/_public/")({
  loader: async (): Promise<{ page: Page | null; cmsBaseUrl: string }> => {
    const [page, cmsBaseUrl] = await Promise.all([
      retrievePageFromServerBySlug({ data: { slug: "home" } }),
      retrieveCmsBaseUrlFromServer(),
    ]);

    return { page: page as Page | null, cmsBaseUrl };
  },
  component: HomePage,
});

function HomePage() {
  const { page, cmsBaseUrl } = Route.useLoaderData();

  return (
    <div className="bg-background">
      <RenderBlocks blocks={page?.blocks || []} cmsBaseUrl={cmsBaseUrl} />
    </div>
  );
}
