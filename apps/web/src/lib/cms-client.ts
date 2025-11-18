import { PayloadSDK } from "@payloadcms/sdk";
import type { Config } from "@repo/types/payload";
import { env } from "cloudflare:workers";

/**
 * Payload CMS SDK client instance.
 *
 * Provides fully type-safe access to CMS collections and globals.
 *
 * @example
 * ```typescript
 * // Find pages
 * const pages = await cmsClient.find({
 *   collection: 'pages',
 *   where: { slug: { equals: 'home' } },
 * });
 *
 * // Get settings
 * const settings = await cmsClient.findGlobal({ slug: 'settings' });
 * ```
 */
export const cmsClient = new PayloadSDK<Config>({
  baseURL: env.CMS_API_URL,
  baseInit: {
    credentials: "include",
  },
});
