import { getDb } from "@repo/core/database/setup";
import type { SelectCampaign } from "@repo/core/database/types";
import { campaign } from "@repo/core/drizzle/schema";
import { and, eq, isNull, ne } from "@repo/core/drizzle";

export async function retrieveCampaignSharingFromDatabaseById(
  campaignId: SelectCampaign["id"],
  organizationId: SelectCampaign["organizationId"],
) {
  const db = getDb();
  const result = await db
    .select({
      id: campaign.id,
      slug: campaign.slug,
      seoTitle: campaign.seoTitle,
      seoDescription: campaign.seoDescription,
      seoImage: campaign.seoImage,
      title: campaign.title,
      status: campaign.status,
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

export async function updateCampaignSharingInDatabaseById(
  campaignId: SelectCampaign["id"],
  organizationId: SelectCampaign["organizationId"],
  data: {
    slug?: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoImage?: string | null;
  },
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
      slug: campaign.slug,
      seoTitle: campaign.seoTitle,
      seoDescription: campaign.seoDescription,
      seoImage: campaign.seoImage,
    });

  return updated || null;
}

export async function getIsSlugAvailableInDatabase(slug: string, excludeCampaignId?: string) {
  const db = getDb();
  const conditions = [eq(campaign.slug, slug), isNull(campaign.deletedAt)];

  if (excludeCampaignId) {
    conditions.push(ne(campaign.id, excludeCampaignId));
  }

  const result = await db
    .select({
      id: campaign.id,
    })
    .from(campaign)
    .where(and(...conditions))
    .limit(1);

  return result.length === 0;
}
