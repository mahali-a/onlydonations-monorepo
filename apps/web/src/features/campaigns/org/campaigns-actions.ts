import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import { authMiddleware } from "@/server/middleware/auth";
import { requireOrganizationAccess } from "@/server/middleware/access-control";
import { logger } from "@/lib/logger";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { campaignModel } from "../campaigns-models";
import {
  checkSlugAvailabilitySchema,
  createCampaignSchema,
  deleteCampaignSchema,
  publishCampaignSchema,
  toggleCampaignStatusSchema,
  updateCampaignDetailsSchema,
  updateCampaignSharingSchema,
  updateCampaignSettingsSchema,
} from "./campaigns-schemas";
import { uploadCoverImage, uploadSeoImage, deleteFile } from "./details/utils/file-upload";
import {
  retrieveCampaignDetailsFromDatabaseById,
  updateCampaignDetailsInDatabaseById,
} from "./details/campaign-details-models";
import {
  retrieveCampaignSettingsFromDatabaseById,
  updateCampaignSettingsInDatabaseById,
} from "./details/settings/campaign-settings-models";
import {
  retrieveCampaignSharingFromDatabaseById,
  updateCampaignSharingInDatabaseById,
  getIsSlugAvailableInDatabase as checkSlugAvailabilityInDb,
} from "./details/sharing/campaign-sharing-models";
import type { CampaignDetailsFormData } from "./details/campaign-details-schema";
import type { CampaignSharingFormData } from "./details/sharing/campaign-sharing-schema";

const campaignsLogger = logger.createChildLogger("campaigns-actions");

function slugifyTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || `campaign-${Date.now()}`
  );
}

async function generateCampaignSlug(
  title: string,
  organizationId: string,
  excludeCampaignId?: string,
): Promise<string> {
  const base = slugifyTitle(title);
  let attempt = base;
  let counter = 1;

  while (
    !(await campaignModel.getIsSlugAvailableInDatabase(organizationId, attempt, excludeCampaignId))
  ) {
    counter += 1;
    attempt = `${base}-${counter}`;
  }

  return attempt;
}

export const createCampaignOnServer = createServerFn({ method: "POST" })
  .inputValidator(createCampaignSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { organizationId, title, categoryId } = data;

    await requireOrganizationAccess(organizationId, context.user.id);

    const userId = context.user.id;

    campaignsLogger.error("create_campaign.start", {
      organizationId,
      title,
      categoryId,
    });

    try {
      const slug = await generateCampaignSlug(title, organizationId);

      const campaign = await campaignModel.saveCampaignToDatabase({
        id: nanoid(10),
        slug,
        title,
        categoryId,
        organizationId,
        createdBy: userId,
        status: "DRAFT",
        amount: 0,
        currency: "GHS",
        coverImage: "",
        beneficiaryName: "",
        country: "GH",
        description: "",
        feeHandling: "DONOR_ASK_COVER",
      });

      if (!campaign) {
        throw new Error("Failed to create campaign");
      }

      return {
        success: true,
        campaign,
      };
    } catch (error) {
      campaignsLogger.error("create_campaign.error", error, {
        organizationId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create campaign",
      };
    }
  });

export const deleteCampaignOnServer = createServerFn({ method: "POST" })
  .inputValidator(deleteCampaignSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { organizationId, campaignId } = data;

    await requireOrganizationAccess(organizationId, context.user.id);

    campaignsLogger.error("delete_campaign.start", {
      organizationId,
      campaignId,
    });

    try {
      const campaign = await campaignModel.retrieveCampaignFromDatabaseById(campaignId);

      if (!campaign) {
        return {
          success: false,
          error: "Campaign not found",
        };
      }

      if (campaign.organizationId !== organizationId) {
        return {
          success: false,
          error: "Unauthorized",
        };
      }

      if (campaign.status !== "DRAFT") {
        return {
          success: false,
          error: "Only draft campaigns can be deleted",
        };
      }

      const deleted = await campaignModel.deleteCampaignInDatabase(campaignId, organizationId);

      if (!deleted) {
        throw new Error("Failed to delete campaign");
      }

      return {
        success: true,
      };
    } catch (error) {
      campaignsLogger.error("delete_campaign.error", error, {
        organizationId,
        campaignId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete campaign",
      };
    }
  });

export const updateCampaignStatusOnServer = createServerFn({ method: "POST" })
  .inputValidator(toggleCampaignStatusSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { organizationId, campaignId, status } = data;

    await requireOrganizationAccess(organizationId, context.user.id);

    campaignsLogger.error("toggle_campaign_status.start", {
      organizationId,
      campaignId,
      newStatus: status,
    });

    try {
      const updated = await campaignModel.updateCampaignStatusInDatabase(
        campaignId,
        organizationId,
        status,
      );

      if (!updated) {
        throw new Error("Failed to update campaign status");
      }

      return {
        success: true,
        campaign: updated,
      };
    } catch (error) {
      campaignsLogger.error("toggle_campaign_status.error", error, {
        organizationId,
        campaignId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update status",
      };
    }
  });

export const publishCampaignOnServer = createServerFn({ method: "POST" })
  .inputValidator(publishCampaignSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { organizationId, campaignId } = data;

    await requireOrganizationAccess(organizationId, context.user.id);

    campaignsLogger.error("publish_campaign.start", {
      organizationId,
      campaignId,
    });

    try {
      const campaign = await campaignModel.retrieveCampaignFromDatabaseById(campaignId);

      if (!campaign) {
        return {
          success: false,
          error: "Campaign not found",
        };
      }

      if (campaign.organizationId !== organizationId) {
        return {
          success: false,
          error: "Unauthorized",
        };
      }

      if (campaign.status !== "DRAFT" && campaign.status !== "REJECTED") {
        return {
          success: false,
          error: "Only draft or rejected campaigns can be published",
        };
      }

      if (
        !campaign.title ||
        !campaign.beneficiaryName ||
        !campaign.coverImage ||
        campaign.amount <= 0
      ) {
        return {
          success: false,
          error:
            "Campaign is missing required fields. Please complete all details before publishing.",
        };
      }

      const published = await campaignModel.publishCampaignInDatabase(campaignId, organizationId);

      if (!published) {
        throw new Error("Failed to publish campaign");
      }

      return {
        success: true,
        campaign: published,
      };
    } catch (error) {
      campaignsLogger.error("publish_campaign.error", error, {
        organizationId,
        campaignId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to publish campaign",
      };
    }
  });

export const getIsSlugAvailableFromServer = createServerFn({ method: "POST" })
  .inputValidator(checkSlugAvailabilitySchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { organizationId, slug, campaignId } = data;

    await requireOrganizationAccess(organizationId, context.user.id);

    campaignsLogger.error("check_slug_availability.start", {
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

      const isAvailable = await campaignModel.getIsSlugAvailableInDatabase(
        organizationId,
        slug,
        campaignId,
      );

      return {
        available: isAvailable,
        message: isAvailable ? "Slug is available" : "Slug is already taken",
      };
    } catch (error) {
      campaignsLogger.error("check_slug_availability.error", error, {
        organizationId,
        slug,
      });

      return {
        available: false,
        error: error instanceof Error ? error.message : "Failed to check slug availability",
      };
    }
  });

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
    } = data;

    await requireOrganizationAccess(organizationId, context.user.id);

    campaignsLogger.error("update_campaign_details.start", {
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
      const uploadResult = await uploadCoverImage(coverImageFile, organizationId, campaignId);
      if (uploadResult.error) {
        return {
          success: false,
          error: uploadResult.error.message,
        };
      }
      uploadedCoverImageKey = uploadResult.key;
    }

    if (!uploadedCoverImageKey && !existingCampaign.coverImage && !existingCoverImageFileKey) {
      return {
        success: false,
        error: "Cover photo is required",
      };
    }

    try {
      const sanitizedDescription =
        description !== undefined ? sanitizeHtml(description) : undefined;

      const updateData: Parameters<typeof updateCampaignDetailsInDatabaseById>[2] = {
        title,
        beneficiaryName,
        categoryId,
        amount,
        ...(sanitizedDescription !== undefined && {
          description: sanitizedDescription || undefined,
        }),
        ...(uploadedCoverImageKey && { coverImage: uploadedCoverImageKey }),
      };

      const updated = await updateCampaignDetailsInDatabaseById(
        campaignId,
        organizationId,
        updateData,
      );

      if (!updated) {
        if (uploadedCoverImageKey) {
          await deleteFile(uploadedCoverImageKey).catch((err) => {
            campaignsLogger.error("Failed to cleanup uploaded file", err);
          });
        }
        throw new Error("Failed to update campaign");
      }

      if (
        uploadedCoverImageKey &&
        existingCampaign.coverImage &&
        existingCampaign.coverImage !== uploadedCoverImageKey
      ) {
        await deleteFile(existingCampaign.coverImage).catch((err) => {
          campaignsLogger.error("Failed to delete old cover image", err);
        });
      }

      return {
        success: true,
        campaign: updated,
      };
    } catch (error) {
      if (uploadedCoverImageKey) {
        await deleteFile(uploadedCoverImageKey).catch((err) => {
          campaignsLogger.error("Failed to cleanup uploaded file on error", err);
        });
      }

      campaignsLogger.error("update_campaign_details.error", error, {
        organizationId,
        campaignId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update campaign",
      };
    }
  });

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

      return {
        organizationId,
        campaignId,
        slug,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoImageFile: seoImageFile && seoImageFile.size > 0 ? seoImageFile : null,
        seoImageFileKey: seoImageFileKey || undefined,
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
    } satisfies CampaignSharingInput;
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { organizationId, campaignId, slug, seoTitle, seoDescription, seoImageFile } = data;

    await requireOrganizationAccess(organizationId, context.user.id);

    campaignsLogger.error("update_campaign_sharing.start", {
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

    const isAvailable = await checkSlugAvailabilityInDb(slug, campaignId);
    if (!isAvailable) {
      return {
        success: false,
        error: "Slug is already taken",
      };
    }

    let uploadedSeoImageKey: string | undefined;

    if (seoImageFile) {
      const uploadResult = await uploadSeoImage(seoImageFile, organizationId, campaignId);
      if (uploadResult.error) {
        return {
          success: false,
          error: uploadResult.error.message,
        };
      }
      uploadedSeoImageKey = uploadResult.key;
    }

    try {
      const updateData: Parameters<typeof updateCampaignSharingInDatabaseById>[2] = {
        slug,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        ...(uploadedSeoImageKey && { seoImage: uploadedSeoImageKey }),
      };

      const updated = await updateCampaignSharingInDatabaseById(
        campaignId,
        organizationId,
        updateData,
      );

      if (!updated) {
        if (uploadedSeoImageKey) {
          await deleteFile(uploadedSeoImageKey).catch((err) => {
            campaignsLogger.error("Failed to cleanup uploaded file", err);
          });
        }
        throw new Error("Failed to update campaign");
      }

      if (
        uploadedSeoImageKey &&
        existingCampaign.seoImage &&
        existingCampaign.seoImage !== uploadedSeoImageKey
      ) {
        await deleteFile(existingCampaign.seoImage).catch((err) => {
          campaignsLogger.error("Failed to delete old SEO image", err);
        });
      }

      return {
        success: true,
        campaign: updated,
      };
    } catch (error) {
      if (uploadedSeoImageKey) {
        await deleteFile(uploadedSeoImageKey).catch((err) => {
          campaignsLogger.error("Failed to cleanup uploaded file on error", err);
        });
      }

      campaignsLogger.error("update_campaign_sharing.error", error, {
        organizationId,
        campaignId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update campaign",
      };
    }
  });

export const updateCampaignSettingsOnServer = createServerFn({ method: "POST" })
  .inputValidator(updateCampaignSettingsSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { organizationId, campaignId, endDate, donateButtonText, feeHandling, thankYouMessage } =
      data;

    await requireOrganizationAccess(organizationId, context.user.id);

    campaignsLogger.error("update_campaign_settings.start", {
      organizationId,
      campaignId,
    });

    const existingCampaign = await retrieveCampaignSettingsFromDatabaseById(
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

    if (feeHandling !== existingCampaign.feeHandling) {
      const hasDonations = await campaignModel.getHasDonationsInDatabase(campaignId);
      if (hasDonations) {
        return {
          success: false,
          error: "Fee handling cannot be changed after a campaign has received donations",
        };
      }
    }

    try {
      const updateData: Parameters<typeof updateCampaignSettingsInDatabaseById>[2] = {
        endDate: endDate || null,
        donateButtonText: donateButtonText || null,
        feeHandling,
        thankYouMessage: thankYouMessage || null,
      };

      const updated = await updateCampaignSettingsInDatabaseById(
        campaignId,
        organizationId,
        updateData,
      );

      if (!updated) {
        throw new Error("Failed to update campaign");
      }

      return {
        success: true,
        campaign: updated,
      };
    } catch (error) {
      campaignsLogger.error("update_campaign_settings.error", error, {
        organizationId,
        campaignId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update campaign",
      };
    }
  });
