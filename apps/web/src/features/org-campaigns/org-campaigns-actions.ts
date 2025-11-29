import { getModerationQueue } from "@repo/core/queues/setup";
import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import { logger } from "@/lib/logger";
import { requireOrganizationAccess } from "@/server/middleware/access-control";
import { authMiddleware } from "@/server/middleware/auth";
import {
  deleteCampaignInDatabase,
  getIsSlugAvailableInDatabase,
  publishCampaignInDatabase,
  retrieveCampaignFromDatabaseById,
  retrievePublishedCampaignCountFromDatabaseByOrganization,
  saveCampaignToDatabase,
  updateCampaignStatusInDatabase,
} from "./org-campaigns-models";
import {
  createCampaignSchema,
  deleteCampaignSchema,
  publishCampaignSchema,
  toggleCampaignStatusSchema,
} from "./org-campaigns-schema";

const campaignsLogger = logger.createChildLogger("org-campaigns-actions");

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

  while (!(await getIsSlugAvailableInDatabase(organizationId, attempt, excludeCampaignId))) {
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

      const campaign = await saveCampaignToDatabase({
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
      const campaign = await retrieveCampaignFromDatabaseById(campaignId);

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

      const deleted = await deleteCampaignInDatabase(campaignId, organizationId);

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
      const updated = await updateCampaignStatusInDatabase(campaignId, organizationId, status);

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

    try {
      const campaign = await retrieveCampaignFromDatabaseById(campaignId);

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

      const publishedCount =
        await retrievePublishedCampaignCountFromDatabaseByOrganization(organizationId);
      const isFirstCampaign = publishedCount === 0;

      const published = await publishCampaignInDatabase(campaignId, organizationId);

      if (!published) {
        throw new Error("Failed to publish campaign");
      }

      // Queue campaign for moderation
      const moderationQueue = getModerationQueue();
      await moderationQueue.moderateContent(
        {
          contentType: "campaign",
          campaignId: published.id,
          organizationId,
        },
        {
          userId: context.user.id,
          orgId: organizationId,
        },
      );

      return {
        success: true,
        campaign: published,
        isFirstCampaign,
        message: "Campaign submitted for review. You'll receive an email once it's approved.",
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
