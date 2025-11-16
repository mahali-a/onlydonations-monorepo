import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { campaignModel, categoryModel } from "../campaigns-models";
import type { CampaignDetailData } from "./types";
import { promiseHash } from "@/utils/promise-hash";

export const retrievePublicCampaignFromServerBySlug = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      slug: z.string().min(1),
    }),
  )
  .handler(async ({ data }): Promise<CampaignDetailData | null> => {
    const { slug } = data;

    const { campaign, categories } = await promiseHash({
      campaign: campaignModel.retrievePublicCampaignFromDatabaseBySlug(slug),
      categories: categoryModel.retrieveEnabledCategoriesFromDatabase(),
    });

    if (!campaign) {
      return null;
    }

    const donations = await campaignModel.retrieveRecentDonationsFromDatabaseByCampaign(
      campaign.id,
      20,
    );

    const result: CampaignDetailData = {
      campaign,
      donations,
      categories,
    };

    return result;
  });
