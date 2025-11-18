import type { Page, Setting } from "@repo/types";
import { cachified } from "@epic-web/cachified";
import { createServerFn } from "@tanstack/react-start";
import ms from "ms";
import { cmsClient } from "@/lib/cms-client";
import { getCacheAdapter, CACHE_KEYS } from "@/lib/cache";
import { logger } from "@/lib/logger";
import { env } from "cloudflare:workers";

export const retrievePageFromServerBySlug = createServerFn({ method: "GET" })
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

export const retrieveSettingsFromServer = createServerFn({
  method: "GET",
}).handler(async (): Promise<Setting | null> => {
  try {
    const cache = getCacheAdapter();

    const settings = await cachified({
      key: CACHE_KEYS.SETTINGS,
      cache,
      ttl: ms("1h"),
      async getFreshValue(context): Promise<Setting | null> {
        try {
          const result = await cmsClient.findGlobal({
            slug: "settings",
            depth: 2,
          });

          // Skip caching if the result is null to allow retries on failure
          if (!result) {
            context.metadata.ttl = -1;
          }

          return result || null;
        } catch (error) {
          // Check if this is a JSON parse error indicating CMS is unreachable
          if (
            error instanceof SyntaxError &&
            error.message.includes("not valid JSON")
          ) {
            logger.error(
              "CMS returned non-JSON response (likely unreachable or error page):",
              {
                message: error.message,
                cmsUrl: env.CMS_API_URL,
              },
            );
          } else {
            logger.error("Failed to fetch settings from CMS:", error);
          }
          // Skip caching on error to allow retries
          context.metadata.ttl = -1;
          return null;
        }
      },
    });

    return settings;
  } catch (error) {
    logger.error("Failed to get settings:", error);
    return null;
  }
});
