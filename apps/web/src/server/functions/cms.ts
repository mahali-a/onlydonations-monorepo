import type { Page, Setting } from "@repo/types";
import { cachified } from "@epic-web/cachified";
import { createServerFn } from "@tanstack/react-start";
import ms from "ms";
import { env } from "cloudflare:workers";
import { cmsClient } from "@/lib/cms-client";
import { getCacheAdapter, CACHE_KEYS } from "@/lib/cache";
import { logger } from "@/lib/logger";

export const retrievePageFromServerBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  // @ts-expect-error - Payload SDK type incompatibility
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

export const retrievePageFromServerBySlugWithDraft = createServerFn({
  method: "GET",
})
  .inputValidator((data: { slug: string }) => data)
  // @ts-expect-error - Payload SDK type incompatibility
  .handler(async ({ data }): Promise<Page | null> => {
    try {
      const slugVariants = [data.slug, `/${data.slug}`, data.slug.replace(/^\//, "")];

      const result = await cmsClient.find({
        collection: "pages",
        where: { slug: { in: slugVariants } },
        limit: 1,
        depth: 2,
        draft: true,
      });

      return result.docs[0] || null;
    } catch (error) {
      logger.error("Failed to fetch page by slug with draft:", error);
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

          if (!result) {
            context.metadata.ttl = -1;
          }

          return result || null;
        } catch (error) {
          if (error instanceof SyntaxError && error.message.includes("not valid JSON")) {
            logger.error("CMS returned non-JSON response:", {
              message: error.message,
              cmsUrl: env.CMS_API_URL,
            });
          } else {
            logger.error("Failed to fetch settings from CMS:", error);
          }
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

export const retrieveCmsApiUrlFromServer = createServerFn({
  method: "GET",
}).handler(() => env.CMS_API_URL);

export const retrieveCmsBaseUrlFromServer = createServerFn({
  method: "GET",
}).handler(() => {
  // Remove /api suffix to get base CMS URL for media files
  const apiUrl = env.CMS_API_URL || "";
  return apiUrl.replace(/\/api\/?$/, "");
});
