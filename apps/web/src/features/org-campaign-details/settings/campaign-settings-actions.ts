import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/server/middleware/auth";
import { requireOrganizationAccess } from "@/server/middleware/access-control";
import { logger } from "@/lib/logger";
import { updateCampaignSettingsSchema } from "./campaign-settings-schema";
import {
  retrieveCampaignSettingsFromDatabaseById,
  updateCampaignSettingsInDatabaseById,
  getHasDonationsInDatabase,
} from "./campaign-settings-models";

const campaignSettingsLogger = logger.createChildLogger("campaign-settings-actions");

const EDITABLE_STATUSES = ["DRAFT", "ACTIVE", "REJECTED"] as const;

export const updateCampaignSettingsOnServer = createServerFn({ method: "POST" })
  .inputValidator(updateCampaignSettingsSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { organizationId, campaignId, endDate, donateButtonText, feeHandling, thankYouMessage } =
      data;

    await requireOrganizationAccess(organizationId, context.user.id);

    campaignSettingsLogger.info("update.start", {
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
      const hasDonations = await getHasDonationsInDatabase(campaignId);
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
      campaignSettingsLogger.error("update.error", error, {
        organizationId,
        campaignId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update campaign",
      };
    }
  });
