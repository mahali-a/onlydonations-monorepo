import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import ms from "ms";
import {
  retrieveCategoriesWithCampaignCountsFromDatabase,
  retrieveCampaignsByCategoryNameFromDatabase,
  retrieveTrendingCampaignsFromDatabase,
  retrieveDiscoverPageDataFromDatabase,
  retrieveCategoryByNameFromDatabase,
} from "./public-discover-models";
import { fileService } from "@/lib/file-upload";

/**
 * Server function to retrieve discover page data
 */
export const retrieveDiscoverPageDataFromServer = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      campaignsPerCategory: z.number().optional().default(3),
    }),
  )
  .handler(async ({ data }) => {
    const { campaignsPerCategory } = data;

    const result = await retrieveDiscoverPageDataFromDatabase(campaignsPerCategory);

    return {
      trending: result.trending.map(fileService.transformKeysToUrls),
      categories: result.categories.map((cat) => ({
        ...cat,
        campaigns: cat.campaigns.map(fileService.transformKeysToUrls),
      })),
      allCategories: result.allCategories,
    };
  });

/**
 * Query options for discover page data
 */
export const discoverPageQueryOptions = (campaignsPerCategory: number = 3) =>
  queryOptions({
    queryKey: ["discover-page", campaignsPerCategory],
    queryFn: () =>
      retrieveDiscoverPageDataFromServer({
        data: { campaignsPerCategory },
      }),
    staleTime: ms("5 minutes"),
  });

/**
 * Server function to retrieve campaigns by category name
 */
export const retrieveCampaignsByCategoryFromServer = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      categoryName: z.string().min(1),
      limit: z.number().optional().default(20),
    }),
  )
  .handler(async ({ data }) => {
    const { categoryName, limit } = data;

    const [category, campaigns] = await Promise.all([
      retrieveCategoryByNameFromDatabase(categoryName),
      retrieveCampaignsByCategoryNameFromDatabase(categoryName, limit),
    ]);

    if (!category) {
      return null;
    }

    return {
      category,
      campaigns: campaigns.map(fileService.transformKeysToUrls),
    };
  });

/**
 * Query options for category campaigns
 */
export const categoryCampaignsQueryOptions = (categoryName: string, limit: number = 20) =>
  queryOptions({
    queryKey: ["category-campaigns", categoryName, limit],
    queryFn: () =>
      retrieveCampaignsByCategoryFromServer({
        data: { categoryName, limit },
      }),
    staleTime: ms("5 minutes"),
  });

/**
 * Server function to retrieve all categories with campaign counts
 */
export const retrieveCategoriesFromServer = createServerFn({
  method: "GET",
}).handler(async () => {
  const categories = await retrieveCategoriesWithCampaignCountsFromDatabase();
  return categories;
});

/**
 * Query options for categories list
 */
export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: () => retrieveCategoriesFromServer(),
    staleTime: ms("10 minutes"),
  });

/**
 * Server function to retrieve trending campaigns
 */
export const retrieveTrendingCampaignsFromServer = createServerFn({
  method: "GET",
})
  .inputValidator(
    z.object({
      limit: z.number().optional().default(10),
    }),
  )
  .handler(async ({ data }) => {
    const { limit } = data;

    const campaigns = await retrieveTrendingCampaignsFromDatabase(limit);

    return campaigns.map(fileService.transformKeysToUrls);
  });

/**
 * Query options for trending campaigns
 */
export const trendingCampaignsQueryOptions = (limit: number = 10) =>
  queryOptions({
    queryKey: ["trending-campaigns", limit],
    queryFn: () =>
      retrieveTrendingCampaignsFromServer({
        data: { limit },
      }),
    staleTime: ms("5 minutes"),
  });
