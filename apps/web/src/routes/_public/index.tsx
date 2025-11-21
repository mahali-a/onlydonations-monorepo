// @ts-nocheck - Payload type definitions are complex and may not match exactly
import {
  createFileRoute,
  DefaultGlobalNotFound,
  ErrorComponent,
} from "@tanstack/react-router";
import { RenderBlocks } from "@/components/cms/render-blocks";
import {
  retrieveCmsBaseUrlFromServer,
  retrievePageFromServerBySlug,
} from "@/server/functions/cms";
import type { Page } from "@repo/types/payload";
import { NotFound } from "@/components/not-found";
import { DonationStatusNotFound } from "@/features/public-donation-status/donation-status-not-found";
import { DonateNotFound } from "@/features/public-donate/donate-not-found";

export const Route = createFileRoute("/_public/")({
  loader: async (): Promise<{ page: Page | null; cmsBaseUrl: string }> => {
    const [page, cmsBaseUrl] = await Promise.all([
      retrievePageFromServerBySlug({ data: { slug: "home" } }),
      retrieveCmsBaseUrlFromServer(),
    ]);

    return { page: page as Page | null, cmsBaseUrl };
  },
  component: DonateNotFound,
});

function HomePage() {
  const { page, cmsBaseUrl } = Route.useLoaderData();

  return (
    <div className="bg-background">
      <RenderBlocks blocks={page?.blocks || []} cmsBaseUrl={cmsBaseUrl} />
    </div>
  );
}
