import { getDb } from "@repo/core/database/setup";
import type { InsertCampaign, SelectCampaign } from "@repo/core/database/types";
import { and, eq, isNull } from "@repo/core/drizzle";
import { campaign } from "@repo/core/drizzle/schema";

export async function retrieveCampaignDetailsFromDatabaseById(
  campaignId: SelectCampaign["id"],
  organizationId: SelectCampaign["organizationId"],
) {
  const db = getDb();
  const result = await db
    .select({
      id: campaign.id,
      title: campaign.title,
      beneficiaryName: campaign.beneficiaryName,
      description: campaign.description,
      amount: campaign.amount,
      currency: campaign.currency,
      coverImage: campaign.coverImage,
      categoryId: campaign.categoryId,
      organizationId: campaign.organizationId,
      status: campaign.status,
      updatedAt: campaign.updatedAt,
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

export async function updateCampaignDetailsInDatabaseById(
  campaignId: SelectCampaign["id"],
  organizationId: SelectCampaign["organizationId"],
  data: Partial<
    Pick<
      InsertCampaign,
      "title" | "beneficiaryName" | "description" | "amount" | "categoryId" | "coverImage"
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
      title: campaign.title,
      slug: campaign.slug,
    });

  return updated || null;
}
