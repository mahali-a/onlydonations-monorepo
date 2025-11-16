import type { Setting } from "@repo/types";
import { seo } from "./seo";

/**
 * Generates SEO meta tags from CMS settings.
 *
 * Use this in child routes to override default SEO with CMS data:
 *
 * @example
 * ```typescript
 * export const Route = createFileRoute("/")({
 *   head: ({ context }) => ({
 *     meta: getCmsSeo(context.settings, {
 *       title: "Custom Title", // Optional override
 *     }),
 *   }),
 * });
 * ```
 */
export function getCmsSeo(
  settings: Setting | null | undefined,
  overrides?: {
    title?: string;
    description?: string;
    image?: string;
  },
) {
  return seo({
    title: overrides?.title || settings?.siteName || "OnlyDonations",
    description:
      overrides?.description ||
      settings?.siteDescription ||
      "We are building a reliable platform to help Africans donate to worthy causes",
    image: overrides?.image || "https://assets.onlydonations.com/thumbnail.jpg",
  });
}
