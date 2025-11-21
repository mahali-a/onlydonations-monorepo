import { env } from "cloudflare:workers";
import type { Cache } from "@epic-web/cachified";
import { cloudflareKvCacheAdapter } from "cachified-adapter-cloudflare-kv";

/**
 * Creates a cachified cache adapter for Cloudflare KV storage.
 * Pre-configured with "cache" key prefix to namespace all cache entries.
 *
 * @returns A configured Cache instance for use with cachified.
 */
export function getCacheAdapter(): Cache {
  return cloudflareKvCacheAdapter({
    // @ts-expect-error
    kv: env.KV_CACHE,
    keyPrefix: "cache",
    name: "KV_CACHE",
  });
}

/**
 * Standardized cache key constants for consistent naming.
 * Keys follow the pattern: `{domain}:{entity}[:{identifier}]`
 */
export const CACHE_KEYS = {
  SETTINGS: "cms:settings",
  PAGE: (slug: string) => `cms:page:${slug}`,
} as const;
