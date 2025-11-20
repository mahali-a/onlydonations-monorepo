import { createServerFn } from "@tanstack/react-start";
import { queryOptions, infiniteQueryOptions } from "@tanstack/react-query";
import { z } from "zod";
import ms from "ms";
import {
  retrievePublicCampaignBySlug,
  retrieveEnabledCategories,
  retrieveRecentDonationsByCampaign,
  retrieveSimilarCampaignsByCategory,
  retrieveOtherCampaigns,
  retrieveDonationsWithMessagesByCampaign,
  retrieveDonationsByCampaignWithPagination,
} from "./public-campaign-details-models";
import { promiseHash } from "@/utils/promise-hash";
import { fileService } from "@/lib/file-upload";

export const retrievePublicCampaignFromServerBySlug = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      slug: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { slug } = data;

    const { campaign, categories } = await promiseHash({
      campaign: retrievePublicCampaignBySlug(slug),
      categories: retrieveEnabledCategories(),
    });

    if (!campaign) {
      return null;
    }

    const donations = await retrieveRecentDonationsByCampaign(campaign.id, 20);

    return {
      campaign: fileService.transformKeysToUrls(campaign),
      donations,
      categories,
    };
  });

export const retrieveSimilarCampaignsFromServer = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      categoryId: z.string().min(1),
      excludeCampaignId: z.string().min(1),
      limit: z.number().optional().default(5),
    }),
  )
  .handler(async ({ data }) => {
    const { categoryId, excludeCampaignId, limit } = data;

    let campaigns = await retrieveSimilarCampaignsByCategory(
      categoryId,
      excludeCampaignId,
      limit,
    );

    if (campaigns.length < limit) {
      const existingIds = [excludeCampaignId, ...campaigns.map((c) => c.id)];
      const additionalCampaigns = await retrieveOtherCampaigns(existingIds, limit - campaigns.length);
      campaigns = [...campaigns, ...additionalCampaigns];
    }

    return campaigns.map(fileService.transformKeysToUrls);
  });

export const similarCampaignsQueryOptions = (categoryId: string, excludeCampaignId: string) =>
  queryOptions({
    queryKey: ["similar-campaigns", categoryId, excludeCampaignId],
    queryFn: () =>
      retrieveSimilarCampaignsFromServer({
        data: { categoryId, excludeCampaignId, limit: 5 },
      }),
    staleTime: ms("5 minutes"),
  });

export const retrieveDonationsWithMessagesFromServer = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      campaignId: z.string().min(1),
      limit: z.number().optional().default(10),
    }),
  )
  .handler(async ({ data }) => {
    const { campaignId, limit } = data;

    return retrieveDonationsWithMessagesByCampaign(campaignId, limit);
  });

export const donationsWithMessagesQueryOptions = (campaignId: string) =>
  queryOptions({
    queryKey: ["donations-with-messages", campaignId],
    queryFn: () =>
      retrieveDonationsWithMessagesFromServer({
        data: { campaignId, limit: 10 },
      }),
    staleTime: ms("2 minutes"),
  });

export const retrieveDonationsInfiniteFromServer = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      campaignId: z.string().min(1),
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
      sort: z.enum(["newest", "top"]).optional().default("newest"),
    }),
  )
  .handler(async ({ data }) => {
    const { campaignId, page, limit, sort } = data;

    const donations = await retrieveDonationsByCampaignWithPagination(
      campaignId,
      page,
      limit,
      sort,
    );

    return {
      donations,
      pagination: {
        page,
        limit,
        hasNext: donations.length === limit,
      },
    };
  });

export const donationsInfiniteQueryOptions = (
  campaignId: string,
  sort: "newest" | "top" = "newest",
) =>
  infiniteQueryOptions({
    queryKey: ["campaign-donations", campaignId, sort],
    queryFn: ({ pageParam }) =>
      retrieveDonationsInfiniteFromServer({
        data: { campaignId, sort, page: pageParam, limit: 20 },
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    staleTime: ms("1 minute"),
  });
