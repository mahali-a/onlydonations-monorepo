import { createServerFn } from "@tanstack/react-start";
import { getDb } from "@repo/core/database/setup";
import { campaign, donation } from "@repo/core/drizzle/schema";
import { and, eq, inArray, isNotNull, isNull, sum } from "@repo/core/drizzle";
import { z } from "zod";

const campaignIdsSchema = z.object({
  campaignIds: z.array(z.string()),
});

export const retrieveCampaignsByIdsFromServer = createServerFn({ method: "POST" })
  .inputValidator(campaignIdsSchema)
  .handler(async ({ data }) => {
    const { campaignIds } = data;

    if (campaignIds.length === 0) {
      return [];
    }

    const db = getDb();

    const result = await db
      .select({
        id: campaign.id,
        slug: campaign.slug,
        title: campaign.title,
        description: campaign.description,
        coverImage: campaign.coverImage,
        amount: campaign.amount,
        currency: campaign.currency,
        beneficiaryName: campaign.beneficiaryName,
        totalRaised: sum(donation.amount),
      })
      .from(campaign)
      .leftJoin(donation, and(eq(donation.campaignId, campaign.id), eq(donation.status, "SUCCESS")))
      .where(
        and(
          inArray(campaign.id, campaignIds),
          eq(campaign.status, "ACTIVE"),
          isNull(campaign.deletedAt),
          isNotNull(campaign.publishedAt),
        ),
      )
      .groupBy(campaign.id);

    return result.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description || "",
      coverImage: c.coverImage,
      amount: c.amount,
      currency: c.currency,
      beneficiaryName: c.beneficiaryName,
      totalRaised: Number(c.totalRaised) || 0,
    }));
  });

export type FundraiserExample = Awaited<
  ReturnType<typeof retrieveCampaignsByIdsFromServer>
>[number];
