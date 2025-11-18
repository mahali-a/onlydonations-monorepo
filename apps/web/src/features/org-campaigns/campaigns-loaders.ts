import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import ms from "ms";
import { authMiddleware } from "@/server/middleware/auth";
import { requireOrganizationAccess } from "@/server/middleware/access-control";
import { logger } from "@/lib/logger";
import {
  retrieveCampaignsWithDonationStatsFromDatabaseByOrganizationAndFilters,
  retrieveCampaignWithDonationStatsFromDatabaseById,
  retrieveCampaignForPreviewFromDatabaseById,
  retrieveEnabledCategoriesFromDatabase,
} from "./campaigns-models";
import { campaignFiltersSchema } from "./campaigns-schemas";
import { promiseHash } from "@/utils/promise-hash";
import { fileService } from "@/lib/file-upload";

const campaignsLogger = logger.createChildLogger("campaigns-loaders");

export const retrieveCampaignsFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    campaignFiltersSchema.extend({
      orgId: z.string(),
    }),
  )
  .handler(async ({ data, context }) => {
    const organizationId = data.orgId;

    await requireOrganizationAccess(organizationId, context.user.id);

    campaignsLogger.error("loader.start", { organizationId, filters: data });

    try {
      const filters = {
        search: data.search,
        status: data.status,
        categoryId: data.categoryId,
        sortBy: data.sortBy,
        sortOrder: data.sortOrder,
        page: data.page,
        limit: data.limit,
      };

      const { result, categories } = await promiseHash({
        result:
          retrieveCampaignsWithDonationStatsFromDatabaseByOrganizationAndFilters(
            organizationId,
            filters,
          ),
        categories: retrieveEnabledCategoriesFromDatabase(),
      });

      return {
        campaigns: result.campaigns,
        pagination: result.pagination,
        categories,
        filters,
      };
    } catch (error) {
      campaignsLogger.error("loader.error", {
        organizationId,
        error,
      });

      throw error;
    }
  });

export const retrieveCampaignDetailFromServer = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      campaignId: z.string(),
      orgId: z.string(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { campaignId, orgId } = data;

    await requireOrganizationAccess(orgId, context.user.id);

    campaignsLogger.error("detail.loader.start", {
      campaignId,
      organizationId: orgId,
    });

    try {
      const campaign =
        await retrieveCampaignWithDonationStatsFromDatabaseById(
          campaignId,
          orgId,
        );

      if (!campaign) {
        campaignsLogger.warn("detail.loader.not-found", {
          campaignId,
          organizationId: orgId,
        });
        throw new Error("Campaign not found");
      }

      const categories =
        await retrieveEnabledCategoriesFromDatabase();

      return {
        campaign: fileService.transformKeysToUrls(campaign),
        categories,
      };
    } catch (error) {
      campaignsLogger.error("detail.loader.error", {
        campaignId,
        organizationId: orgId,
        error,
      });

      throw error;
    }
  });

export const campaignDetailQueryOptions = (orgId: string, campaignId: string) =>
  queryOptions({
    queryKey: ["campaign-detail", orgId, campaignId],
    queryFn: () => retrieveCampaignDetailFromServer({ data: { orgId, campaignId } }),
    staleTime: ms("5 minutes"),
  });

export const retrieveCampaignPreviewFromServer = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      campaignId: z.string().min(1),
      orgId: z.string().min(1),
    }),
  )
  .handler(async ({ data, context }) => {
    const { campaignId, orgId } = data;

    await requireOrganizationAccess(orgId, context.user.id);

    campaignsLogger.error("preview.loader.start", { campaignId, orgId });

    try {
      const campaign =
        await retrieveCampaignForPreviewFromDatabaseById(
          campaignId,
        );

      if (!campaign || campaign.organizationId !== orgId) {
        campaignsLogger.error("preview.loader.not-found", {
          campaignId,
          orgId,
        });
        throw new Error("Campaign not found");
      }

      return {
        campaign,
        donations: [],
        categories: [],
      };
    } catch (error) {
      campaignsLogger.error("preview.loader.error", {
        campaignId,
        orgId,
        error,
      });

      throw error;
    }
  });
