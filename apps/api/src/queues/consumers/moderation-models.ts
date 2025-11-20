import { getDb } from "@repo/core/database/setup";
import { campaign, contentModeration } from "@repo/core/drizzle/schema";
import { auth_user } from "@repo/core/drizzle/auth-schema";
import type { SelectCampaign, SelectUser } from "@repo/core/database/types";
import { eq } from "@repo/core/drizzle";
import type { ModerationResult } from "@/lib/openai";

export async function retrieveCampaignByIdFromDatabase(
  campaignId: string,
): Promise<SelectCampaign | undefined> {
  const db = getDb();
  const [campaignData] = await db
    .select()
    .from(campaign)
    .where(eq(campaign.id, campaignId))
    .limit(1);

  return campaignData;
}

export async function retrieveUserByIdFromDatabase(
  userId: string,
): Promise<SelectUser | undefined> {
  const db = getDb();
  const [user] = await db.select().from(auth_user).where(eq(auth_user.id, userId)).limit(1);

  return user;
}

export async function saveModerationResultToDatabase(
  data: { contentType: string; campaignId: string },
  result: ModerationResult,
) {
  const db = getDb();
  const moderationResult = result.results[0];

  if (!moderationResult) {
    throw new Error("No moderation results found");
  }

  const flaggedCategories = Object.keys(moderationResult.categories).filter(
    (key) => moderationResult.categories[key],
  );

  await db.insert(contentModeration).values({
    contentType: data.contentType,
    contentId: data.campaignId,
    status: "COMPLETED",
    flagged: moderationResult.flagged,
    flaggedCategories: flaggedCategories.length > 0 ? JSON.stringify(flaggedCategories) : null,
    categoryScores: JSON.stringify(moderationResult.category_scores),
    moderationProvider: "openai",
    openaiModerationId: result.id,
    requiresManualReview: moderationResult.flagged,
  });
}

export async function updateCampaignStatusInDatabase(campaignId: string, status: string) {
  const db = getDb();

  await db
    .update(campaign)
    .set({ status, updatedAt: new Date() })
    .where(eq(campaign.id, campaignId));
}

export async function saveCampaignForManualReviewToDatabase(
  campaignId: string,
  errorMessage: string,
) {
  const db = getDb();

  await db
    .update(campaign)
    .set({
      status: "UNDER_REVIEW",
      updatedAt: new Date(),
    })
    .where(eq(campaign.id, campaignId));

  await db.insert(contentModeration).values({
    contentType: "campaign",
    contentId: campaignId,
    status: "FAILED",
    errorMessage,
    requiresManualReview: true,
  });
}
