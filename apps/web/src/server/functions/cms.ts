import type { Page } from "@repo/types";
import { createServerFn } from "@tanstack/react-start";
import { cmsClient } from "@/lib/cms-client";
import { logger } from "@/lib/logger";

/**
 * Retrieves a page from Payload CMS by its slug.
 *
 * @param data - Object containing the page slug
 * @param data.slug - The page slug to find
 * @returns The page document or null if not found
 *
 * @example
 * ```typescript
 * const page = await getPageBySlug({ data: { slug: 'about' } });
 * if (page) {
 *   console.log(page.title, page.blocks);
 * }
 * ```
 */
export const getPageBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  // @ts-expect-error - Payload SDK type incompatibility: index signature mismatch between generated types ([k: string]: unknown) and strict TypeScript ([x: string]: {}). Runtime behavior is correct.
  .handler(async ({ data }): Promise<Page | null> => {
    try {
      const result = await cmsClient.find({
        collection: "pages",
        where: { slug: { equals: data.slug } },
        limit: 1,
      });

      return result.docs[0] || null;
    } catch (error) {
      logger.error("Failed to fetch page by slug:", error);
      return null;
    }
  });
