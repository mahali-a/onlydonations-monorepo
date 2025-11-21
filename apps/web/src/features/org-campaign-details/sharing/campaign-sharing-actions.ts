import { createServerFn } from "@tanstack/react-start";
import { fileService } from "@/lib/file-upload";
import { logger } from "@/lib/logger";
import { requireOrganizationAccess } from "@/server/middleware/access-control";
import { authMiddleware } from "@/server/middleware/auth";
import {
  getIsSlugAvailableInDatabase,
  retrieveCampaignSharingFromDatabaseById,
  updateCampaignSharingInDatabaseById,
} from "./campaign-sharing-models";
import type { CampaignSharingFormData } from "./campaign-sharing-schema";
import {
  checkSlugAvailabilitySchema,
  updateCampaignSharingSchema,
} from "./campaign-sharing-schema";

const campaignSharingLogger = logger.createChildLogger("campaign-sharing-actions");

const EDITABLE_STATUSES = ["DRAFT", "ACTIVE", "REJECTED"] as const;

type CampaignSharingInput = CampaignSharingFormData & {
  organizationId: string;
  campaignId: string;
};

export const updateCampaignSharingOnServer = createServerFn({ method: "POST" })
  .inputValidator((data): CampaignSharingInput => {
    if (data instanceof FormData) {
      const seoImageFile = data.get("seoImage") as File | null;
      const organizationId = data.get("organizationId") as string;
      const campaignId = data.get("campaignId") as string;
      const slug = data.get("slug") as string;
      const seoTitle = data.get("seoTitle") as string | null;
      const seoDescription = data.get("seoDescription") as string | null;
      const seoImageFileKey = data.get("seoImageFileKey") as string | null;
      const deleteSeoImage = data.get("deleteSeoImage") === "true";

      return {
        organizationId,
        campaignId,
        slug,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoImageFile: seoImageFile && seoImageFile.size > 0 ? seoImageFile : null,
        seoImageFileKey: seoImageFileKey || undefined,
        deleteSeoImage,
      };
    }
    const parsed = updateCampaignSharingSchema.parse(data);
    return {
      organizationId: parsed.organizationId,
      campaignId: parsed.campaignId,
      slug: parsed.slug,
      seoTitle: parsed.seoTitle || undefined,
      seoDescription: parsed.seoDescription || undefined,
      seoImageFile: null,
      seoImageFileKey: parsed.seoImageFileKey,
      deleteSeoImage: parsed.deleteSeoImage,
    } satisfies CampaignSharingInput;
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const {
      organizationId,
      campaignId,
      slug,
      seoTitle,
      seoDescription,
      seoImageFile,
      deleteSeoImage,
    } = data;

    await requireOrganizationAccess(organizationId, context.user.id);

    campaignSharingLogger.info("update.start", {
      organizationId,
      campaignId,
      slug,
    });

    const existingCampaign = await retrieveCampaignSharingFromDatabaseById(
      campaignId,
      organizationId,
    );
    if (!existingCampaign) {
      return {
        success: false,
        error: "Campaign not found",
      };
    }

    if (
      !EDITABLE_STATUSES.includes(existingCampaign.status as (typeof EDITABLE_STATUSES)[number])
    ) {
      return {
        success: false,
        error: "Campaign cannot be edited in its current status",
      };
    }

    const isAvailable = await getIsSlugAvailableInDatabase(slug, campaignId);
    if (!isAvailable) {
      return {
        success: false,
        error: "Slug is already taken",
      };
    }

    let uploadedSeoImageKey: string | undefined;

    if (seoImageFile) {
      const uploadResult = await fileService.upload(seoImageFile, "campaign-seo", campaignId);
      if (uploadResult.error) {
        return {
          success: false,
          error: uploadResult.error.message,
        };
      }
      uploadedSeoImageKey = uploadResult.key;
    }

    try {
      let seoImageUpdate: string | null | undefined;
      if (uploadedSeoImageKey) {
        seoImageUpdate = uploadedSeoImageKey;
      } else if (deleteSeoImage) {
        seoImageUpdate = null;
      }

      const updateData: Parameters<typeof updateCampaignSharingInDatabaseById>[2] = {
        slug,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        ...(seoImageUpdate !== undefined && { seoImage: seoImageUpdate }),
      };

      const updated = await updateCampaignSharingInDatabaseById(
        campaignId,
        organizationId,
        updateData,
      );

      if (!updated) {
        if (uploadedSeoImageKey) {
          await fileService.delete(uploadedSeoImageKey).catch((err) => {
            campaignSharingLogger.error("Failed to cleanup uploaded file", err);
          });
        }
        throw new Error("Failed to update campaign");
      }

      if (existingCampaign.seoImage) {
        const shouldDeleteOldImage =
          (uploadedSeoImageKey && existingCampaign.seoImage !== uploadedSeoImageKey) ||
          deleteSeoImage;

        if (shouldDeleteOldImage) {
          await fileService.delete(existingCampaign.seoImage).catch((err) => {
            campaignSharingLogger.error("Failed to delete old SEO image", err);
          });
        }
      }

      return {
        success: true,
        campaign: updated,
      };
    } catch (error) {
      if (uploadedSeoImageKey) {
        await fileService.delete(uploadedSeoImageKey).catch((err) => {
          campaignSharingLogger.error("Failed to cleanup uploaded file on error", err);
        });
      }

      campaignSharingLogger.error("update.error", error, {
        organizationId,
        campaignId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update campaign",
      };
    }
  });

export const getIsSlugAvailableFromServer = createServerFn({ method: "POST" })
  .inputValidator(checkSlugAvailabilitySchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { organizationId, slug, campaignId } = data;

    await requireOrganizationAccess(organizationId, context.user.id);

    campaignSharingLogger.info("check_slug_availability.start", {
      organizationId,
      slug,
      campaignId,
    });

    try {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug)) {
        return {
          available: false,
          error: "Slug must be lowercase alphanumeric with hyphens",
        };
      }

      const isAvailable = await getIsSlugAvailableInDatabase(slug, campaignId);

      return {
        available: isAvailable,
        message: isAvailable ? "Slug is available" : "Slug is already taken",
      };
    } catch (error) {
      campaignSharingLogger.error("check_slug_availability.error", error, {
        organizationId,
        slug,
      });

      return {
        available: false,
        error: error instanceof Error ? error.message : "Failed to check slug availability",
      };
    }
  });
