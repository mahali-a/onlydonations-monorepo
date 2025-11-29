import { getModerationQueue } from "@repo/core/queues/setup";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  retrieveDonationFromDatabaseByIdWithCampaign,
  updateDonationMessageInDatabaseById,
} from "@/features/public-donate/donate-models";
import { logger } from "@/lib/logger";

const donationMessageLogger = logger.createChildLogger("donation-message");

const postDonationMessageSchema = z.object({
  donationId: z.string().min(1, "Donation ID is required"),
  message: z.string().min(1, "Message is required").max(500, "Message is too long"),
});

/**
 * Post a thank you message to a donation
 * @param donationId - Donation ID
 * @param message - Thank you message
 * @returns Updated donation
 */
export const postDonationMessage = createServerFn({ method: "POST" })
  .inputValidator(postDonationMessageSchema)
  .handler(async ({ data }) => {
    const { donationId, message } = data;

    try {
      // Check if donation exists and if message already posted
      const donation = await retrieveDonationFromDatabaseByIdWithCampaign(donationId);

      if (!donation) {
        donationMessageLogger.error("donation.message.not_found", { donationId });
        throw new Response("Donation not found", { status: 404 });
      }

      // Prevent duplicate messages
      if (donation.donorMessage) {
        donationMessageLogger.warn("donation.message.already_exists", { donationId });
        throw new Response("Message already posted for this donation", { status: 409 });
      }

      // Save message with PENDING status
      const updated = await updateDonationMessageInDatabaseById(donationId, message);

      if (!updated) {
        donationMessageLogger.error("donation.message.update_failed", { donationId });
        throw new Response("Failed to update donation", { status: 500 });
      }

      // Queue message for moderation
      const moderationQueue = getModerationQueue();
      await moderationQueue.moderateContent({
        contentType: "donation-message",
        donationId,
      });

      donationMessageLogger.info("donation.message.posted_and_queued", {
        donationId,
        messageLength: message.length,
      });

      return {
        ...updated,
        isPending: true, // Indicate message is pending moderation
      };
    } catch (error) {
      donationMessageLogger.error("donation.message.error", {
        donationId,
        error: (error as Error).message,
      });
      throw error;
    }
  });
