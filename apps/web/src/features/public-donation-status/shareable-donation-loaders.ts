import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { retrieveDonationWithCampaignFromDatabaseById } from "@/features/public-donate/donate-models";
import { fileService } from "@/lib/file-upload";
import { logger } from "@/lib/logger";
import { Money } from "@/lib/money";

const shareableDonationLogger = logger.createChildLogger("shareable-donation");

const getShareableDonationSchema = z.object({
  donationId: z.string().min(1, "Donation ID is required"),
});

/**
 * Get shareable donation data by ID
 * @param donationId - Donation ID
 * @returns Shareable donation data with campaign info
 */
export const getShareableDonation = createServerFn({ method: "GET" })
  .inputValidator(getShareableDonationSchema)
  .handler(async ({ data }) => {
    const { donationId } = data;

    try {
      const donationData = await retrieveDonationWithCampaignFromDatabaseById(donationId);

      if (!donationData) {
        shareableDonationLogger.error("shareable_donation.not_found", { donationId });
        throw new Response("Donation not found", { status: 404 });
      }

      // Only show SUCCESS donations on shareable page
      if (donationData.status !== "SUCCESS") {
        shareableDonationLogger.error("shareable_donation.invalid_status", {
          donationId,
          status: donationData.status,
        });
        throw new Response("Donation not available for sharing", { status: 403 });
      }

      const formattedAmount = Money.fromMinor(donationData.amount, donationData.currency).format({
        withSymbol: false,
        decimals: 2,
      });

      const campaignCoverImage = donationData.campaignCoverImage
        ? fileService.transformKeysToUrls({ coverImage: donationData.campaignCoverImage })
            .coverImage
        : donationData.campaignCoverImage;

      const campaignSeoImage = donationData.campaignSeoImage
        ? fileService.transformKeysToUrls({ seoImage: donationData.campaignSeoImage }).seoImage
        : donationData.campaignSeoImage;

      shareableDonationLogger.info("shareable_donation.retrieved", {
        donationId,
        campaignSlug: donationData.campaignSlug,
      });

      return {
        ...donationData,
        formattedAmount,
        campaignCoverImage,
        campaignSeoImage,
      };
    } catch (error) {
      shareableDonationLogger.error("shareable_donation.error", {
        donationId,
        error: (error as Error).message,
      });
      throw error;
    }
  });
