import { createFileRoute } from "@tanstack/react-router";
import { RenderBlocks } from "@/components/cms/render-blocks";
import { retrieveCmsBaseUrlFromServer, retrievePageFromServerBySlug } from "@/server/functions/cms";
import type { Page } from "@repo/types/payload";
import { mockHomePage } from "@/features/public-home/data/mock-home-page";

export const Route = createFileRoute("/_public/home")({
  loader: async () => {
    // For testing: use mock data instead of fetching from CMS
    // TODO: Switch back to real CMS after testing
    const USE_MOCK_DATA = true;

    if (USE_MOCK_DATA) {
      return {
        page: mockHomePage as any,
        cmsBaseUrl: "",
      };
    }

    const [page, cmsBaseUrl] = await Promise.all([
      retrievePageFromServerBySlug({ data: { slug: "home" } }),
      retrieveCmsBaseUrlFromServer(),
    ]);

    return { page, cmsBaseUrl };
  },
  component: Home,
});

function Home() {
  const { page, cmsBaseUrl } = Route.useLoaderData() as { page: Page | null; cmsBaseUrl: string };

  return (
    <div className="min-h-screen bg-white font-sans text-[#2a2e30]">
      <RenderBlocks blocks={page?.blocks || []} cmsBaseUrl={cmsBaseUrl} />
    </div>
  );
}
