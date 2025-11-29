import { createServerFn } from "@tanstack/react-start";
import { retrieveCampaignWithCategoryFromDatabaseBySlug } from "./donate-models";
import { donateLoaderSchema } from "./donate-schema";

export const retrieveDonateDataFromServer = createServerFn({ method: "GET" })
  .inputValidator(donateLoaderSchema)
  .handler(async ({ data }) => {
    const { slug } = data;

    const campaignData = await retrieveCampaignWithCategoryFromDatabaseBySlug(slug);

    if (!campaignData) {
      throw new Response("Campaign not found", { status: 404 });
    }

    if (campaignData.status !== "ACTIVE") {
      throw new Response("Campaign is not accepting donations", { status: 403 });
    }

    if (campaignData.endDate && new Date(campaignData.endDate) < new Date()) {
      throw new Response("Campaign has ended", { status: 403 });
    }

    return {
      campaign: campaignData,
    };
  });
