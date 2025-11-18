import { createServerFn } from "@tanstack/react-start";
import { infiniteQueryOptions } from "@tanstack/react-query";
import ms from "ms";
import { searchFiltersSchema, type SearchFilters } from "./search-schemas";
import {
  retrievePublicCampaignsWithCategoryFromDatabaseByFilters,
  retrievePublicCampaignCountFromDatabaseByFilters,
} from "./search-models";
import { retrieveEnabledCategories } from "@/features/public-campaign-details/public-campaign-models";
import { promiseHash } from "@/utils/promise-hash";
import { fileService } from "@/lib/file-upload";

export type SearchResult = Awaited<
  ReturnType<typeof retrievePublicCampaignsWithCategoryFromDatabaseByFilters>
>[number];

export type SearchResponse = {
  campaigns: SearchResult[];
  categories: Awaited<ReturnType<typeof retrieveEnabledCategories>>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export const retrievePublicCampaignsFromServer = createServerFn({
  method: "GET",
})
  .inputValidator((data) => searchFiltersSchema.parse(data ?? {}))
  .handler(async ({ data }): Promise<SearchResponse> => {
    const filters = data as SearchFilters;

    const { campaigns, total, categories } = await promiseHash({
      campaigns: retrievePublicCampaignsWithCategoryFromDatabaseByFilters(filters),
      total: retrievePublicCampaignCountFromDatabaseByFilters(filters),
      categories: retrieveEnabledCategories(),
    });

    const totalPages = Math.ceil(total / filters.limit);

    return {
      campaigns: campaigns.map(fileService.transformKeysToUrls),
      categories,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
        hasNext: filters.page < totalPages,
        hasPrev: filters.page > 1,
      },
    };
  });

export const publicCampaignsInfiniteQueryOptions = (filters?: Partial<SearchFilters>) =>
  infiniteQueryOptions({
    queryKey: ["search-campaigns", filters],
    queryFn: ({ pageParam }) =>
      retrievePublicCampaignsFromServer({
        data: searchFiltersSchema.parse({ ...filters, page: pageParam }),
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    staleTime: ms("2 minutes"),
  });
