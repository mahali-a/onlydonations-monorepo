import { getDb } from "@repo/core/database/setup";
import type { InsertCampaign, SelectCampaign } from "@repo/core/database/types";
import { campaign, donation } from "@repo/core/drizzle/schema";
import { and, eq, isNull, count } from "@repo/core/drizzle";

export async function retrieveCampaignSettingsFromDatabaseById(
  campaignId: SelectCampaign["id"],
  organizationId: SelectCampaign["organizationId"],
) {
  const db = getDb();
  const result = await db
    .select({
      id: campaign.id,
      status: campaign.status,
      endDate: campaign.endDate,
      donateButtonText: campaign.donateButtonText,
      feeHandling: campaign.feeHandling,
      thankYouMessage: campaign.thankYouMessage,
      publishedAt: campaign.publishedAt,
      organizationId: campaign.organizationId,
    })
    .from(campaign)
    .where(
      and(
        eq(campaign.id, campaignId),
        eq(campaign.organizationId, organizationId),
        isNull(campaign.deletedAt),
      ),
    )
    .limit(1);

  return result[0] || null;
}

export async function updateCampaignSettingsInDatabaseById(
  campaignId: SelectCampaign["id"],
  organizationId: SelectCampaign["organizationId"],
  data: Partial<
    Pick<
      InsertCampaign,
      "endDate" | "donateButtonText" | "feeHandling" | "thankYouMessage" | "publishedAt" | "status"
    >
  >,
) {
  const db = getDb();
  const [updated] = await db
    .update(campaign)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(campaign.id, campaignId),
        eq(campaign.organizationId, organizationId),
        isNull(campaign.deletedAt),
      ),
    )
    .returning({
      id: campaign.id,
      status: campaign.status,
      endDate: campaign.endDate,
      donateButtonText: campaign.donateButtonText,
      feeHandling: campaign.feeHandling,
      thankYouMessage: campaign.thankYouMessage,
      publishedAt: campaign.publishedAt,
    });

  return updated || null;
}

export async function getHasDonationsInDatabase(campaignId: string): Promise<boolean> {
  const db = getDb();
  const result = await db
    .select({ count: count() })
    .from(donation)
    .where(eq(donation.campaignId, campaignId))
    .limit(1);

  return Number(result[0]?.count ?? 0) > 0;
}
