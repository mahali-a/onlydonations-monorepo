import { createServerFn } from "@tanstack/react-start";

import { retrieveFeaturedCampaignsFromDatabase } from "@/features/home/home-models";
import type { HomePageCampaign } from "@/features/home/types";
import { logger } from "@/lib/logger";

/**
 * Server function to retrieve featured campaigns for the home page
 */
export const retrieveFeaturedCampaignsFromServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomePageCampaign[]> => {
    try {
      const campaigns = await retrieveFeaturedCampaignsFromDatabase(6);
      return campaigns;
    } catch (error) {
      logger.error("Failed to fetch featured campaigns:", error);
      return [];
    }
  },
);
