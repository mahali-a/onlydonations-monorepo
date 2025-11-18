import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/server/middleware/auth";
import { requireOrganizationAccess } from "@/server/middleware/access-control";
import { logger } from "@/lib/logger";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { fileService } from "@/lib/file-upload";
import { updateCampaignDetailsSchema } from "./campaign-details-schema";
import {
  retrieveCampaignDetailsFromDatabaseById,
  updateCampaignDetailsInDatabaseById,
} from "./campaign-details-models";
import type { CampaignDetailsFormData } from "./campaign-details-schema";

const campaignDetailsLogger = logger.createChildLogger("campaign-details-actions");

const EDITABLE_STATUSES = ["DRAFT", "ACTIVE", "REJECTED"] as const;

type CampaignDetailsInput = CampaignDetailsFormData & {
  organizationId: string;
  campaignId: string;
};

export const updateCampaignDetailsOnServer = createServerFn({ method: "POST" })
  .inputValidator((data): CampaignDetailsInput => {
    if (data instanceof FormData) {
      const coverImageFile = data.get("coverImage") as File | null;
      const organizationId = data.get("organizationId") as string;
      const campaignId = data.get("campaignId") as string;
      const title = data.get("title") as string;
      const beneficiaryName = data.get("beneficiaryName") as string;
      const categoryId = data.get("categoryId") as string;
      const amount = Number(data.get("amount"));
      const description = data.get("description") as string | null;
      const coverImageFileKey = data.get("coverImageFileKey") as string | null;
      const deleteCoverImage = data.get("deleteCoverImage") === "true";

      return {
        organizationId,
        campaignId,
        title,
        beneficiaryName,
        categoryId,
        amount,
        description: description || undefined,
        coverImageFile: coverImageFile && coverImageFile.size > 0 ? coverImageFile : null,
        coverImageFileKey: coverImageFileKey || undefined,
        deleteCoverImage,
      };
    }
    const parsed = updateCampaignDetailsSchema.parse(data);
    return {
      organizationId: parsed.organizationId,
      campaignId: parsed.campaignId,
      title: parsed.title,
      beneficiaryName: parsed.beneficiaryName,
      categoryId: parsed.categoryId,
      amount: parsed.amount,
      description: parsed.description,
      coverImageFile: null,
      coverImageFileKey: parsed.coverImageFileKey,
      deleteCoverImage: parsed.deleteCoverImage,
    } satisfies CampaignDetailsInput;
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const {
      organizationId,
      campaignId,
      title,
      beneficiaryName,
      categoryId,
      amount,
      description,
      coverImageFile,
      coverImageFileKey: existingCoverImageFileKey,
      deleteCoverImage,
    } = data;

    await requireOrganizationAccess(organizationId, context.user.id);

    campaignDetailsLogger.info("update.start", {
      organizationId,
      campaignId,
    });

    const existingCampaign = await retrieveCampaignDetailsFromDatabaseById(
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

    let uploadedCoverImageKey: string | undefined;

    if (coverImageFile) {
      const uploadResult = await fileService.upload(coverImageFile, "campaign-cover", campaignId);
      if (uploadResult.error) {
        return {
          success: false,
          error: uploadResult.error.message,
        };
      }
      uploadedCoverImageKey = uploadResult.key;
    }

    if (
      !uploadedCoverImageKey &&
      !existingCampaign.coverImage &&
      !existingCoverImageFileKey &&
      !deleteCoverImage
    ) {
      return {
        success: false,
        error: "Cover photo is required",
      };
    }

    try {
      const sanitizedDescription =
        description !== undefined ? sanitizeHtml(description) : undefined;

      let coverImageUpdate: string | null | undefined;
      if (uploadedCoverImageKey) {
        coverImageUpdate = uploadedCoverImageKey;
      } else if (deleteCoverImage) {
        coverImageUpdate = null;
      }

      const updateData: Parameters<typeof updateCampaignDetailsInDatabaseById>[2] = {
        title,
        beneficiaryName,
        categoryId,
        amount,
        ...(sanitizedDescription !== undefined && {
          description: sanitizedDescription || undefined,
        }),
        ...(coverImageUpdate !== undefined && {
          coverImage: coverImageUpdate || undefined,
        }),
      };

      const updated = await updateCampaignDetailsInDatabaseById(
        campaignId,
        organizationId,
        updateData,
      );

      if (!updated) {
        if (uploadedCoverImageKey) {
          await fileService.delete(uploadedCoverImageKey).catch((err) => {
            campaignDetailsLogger.error("Failed to cleanup uploaded file", err);
          });
        }
        throw new Error("Failed to update campaign");
      }

      if (existingCampaign.coverImage) {
        const shouldDeleteOldImage =
          (uploadedCoverImageKey && existingCampaign.coverImage !== uploadedCoverImageKey) ||
          deleteCoverImage;

        if (shouldDeleteOldImage) {
          await fileService.delete(existingCampaign.coverImage).catch((err) => {
            campaignDetailsLogger.error("Failed to delete old cover image", err);
          });
        }
      }

      return {
        success: true,
        campaign: updated,
      };
    } catch (error) {
      if (uploadedCoverImageKey) {
        await fileService.delete(uploadedCoverImageKey).catch((err) => {
          campaignDetailsLogger.error("Failed to cleanup uploaded file on error", err);
        });
      }

      campaignDetailsLogger.error("update.error", error, {
        organizationId,
        campaignId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update campaign",
      };
    }
  });
