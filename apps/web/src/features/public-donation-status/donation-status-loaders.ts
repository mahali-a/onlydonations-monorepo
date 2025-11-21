import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import dayjs from "dayjs";
import { logger } from "@/lib/logger";
import { Money } from "@/lib/money";
import { retrieveDonationFromDatabaseByIdWithCampaign } from "../public-donate/donate-models";
import { PAYMENT_TIMEOUT_MINUTES } from "../public-donate/donate-constants";

const donationsLogger = logger.createChildLogger("donations-status");

const donationStatusLoaderSchema = z.object({
  donationId: z.string().min(1, "Donation ID is required"),
});

export const retrieveDonationStatusDataFromServer = createServerFn({ method: "GET" })
  .inputValidator(donationStatusLoaderSchema)
  .handler(async ({ data }) => {
    const { donationId } = data;

    try {
      const donationInfo = await retrieveDonationFromDatabaseByIdWithCampaign(donationId);

      if (!donationInfo) {
        donationsLogger.warn("donation.status.not_found", { donationId });
        throw new Response("Donation not found", { status: 404 });
      }

      const timeoutThreshold = dayjs().subtract(PAYMENT_TIMEOUT_MINUTES, "minutes");
      const isRecentlyUpdated = dayjs(donationInfo.updatedAt).isAfter(timeoutThreshold);

      donationsLogger.info("donation.status.loaded", {
        donationId,
        status: donationInfo.status,
        isRecentlyUpdated,
        campaign: donationInfo.campaignSlug,
      });

      const formattedAmount = Money.fromMinor(donationInfo.amount, donationInfo.currency).format({
        withSymbol: false,
        decimals: 2,
      });

      return {
        ...donationInfo,
        isRecentlyUpdated,
        formattedAmount,
      };
    } catch (error) {
      donationsLogger.error("donation.status.error", {
        donationId,
        error: (error as Error).message,
      });
      throw error;
    }
  });
