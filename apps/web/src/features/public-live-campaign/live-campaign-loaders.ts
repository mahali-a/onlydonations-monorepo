import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import ms from "ms";
import { retrieveLiveCampaignBySlug, retrieveRecentLiveDonations } from "./live-campaign-models";
import { fileService } from "@/lib/file-upload";

/**
 * Server function to retrieve live campaign data by slug
 */
export const retrieveLiveCampaignFromServer = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      slug: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { slug } = data;

    const campaign = await retrieveLiveCampaignBySlug(slug);

    if (!campaign) {
      return null;
    }

    const donations = await retrieveRecentLiveDonations(campaign.id, 20);

    return {
      campaign: fileService.transformKeysToUrls(campaign),
      donations,
    };
  });

/**
 * Query options for live campaign data
 * Uses 30 second stale time for near-real-time updates
 * Will be replaced with durable objects for true real-time later
 */
export const liveCampaignQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["live-campaign", slug],
    queryFn: () => retrieveLiveCampaignFromServer({ data: { slug } }),
    staleTime: ms("30s"),
    refetchInterval: ms("30s"),
  });

/**
 * Server function to retrieve recent donations for live feed
 */
export const retrieveLiveDonationsFromServer = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      campaignId: z.string().min(1),
      limit: z.number().optional().default(20),
    }),
  )
  .handler(async ({ data }) => {
    const { campaignId, limit } = data;
    return retrieveRecentLiveDonations(campaignId, limit);
  });

/**
 * Query options for live donations feed
 * Uses 30 second stale time for near-real-time updates
 */
export const liveDonationsQueryOptions = (campaignId: string) =>
  queryOptions({
    queryKey: ["live-donations", campaignId],
    queryFn: () =>
      retrieveLiveDonationsFromServer({
        data: { campaignId, limit: 20 },
      }),
    staleTime: ms("30s"),
    refetchInterval: ms("30s"),
  });
