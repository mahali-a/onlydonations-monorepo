import { PayloadSDK } from "@payloadcms/sdk";
import type { Config } from "@repo/types/payload";

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
  baseURL: import.meta.env.CMS_API_URL || "http://localhost:3001/api",
  baseInit: {
    credentials: "include",
  },
});
