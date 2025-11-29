import { getDb } from "@repo/core/database/setup";
import type { SelectCampaign, SelectUser } from "@repo/core/database/types";
import { eq } from "@repo/core/drizzle";
import { auth_user, campaign, contentModeration, donation } from "@repo/core/drizzle/schema";
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
  recommendation?: string | null,
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
    recommendation: recommendation || null,
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

/**
 * Retrieve donation with message from database by ID
 * @param donationId - Donation ID
 * @returns Donation with message data
 */
export async function retrieveDonationWithMessageFromDatabase(donationId: string) {
  const db = getDb();
  const [donationData] = await db
    .select({
      id: donation.id,
      donorMessage: donation.donorMessage,
      messageStatus: donation.messageStatus,
      donorEmail: donation.donorEmail,
      donorName: donation.donorName,
    })
    .from(donation)
    .where(eq(donation.id, donationId))
    .limit(1);

  return donationData;
}

/**
 * Save donation message moderation result to database
 * @param donationId - Donation ID
 * @param result - Moderation result from OpenAI
 */
export async function saveDonationMessageModerationToDatabase(
  donationId: string,
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
    contentType: "donation-message",
    contentId: donationId,
    status: "COMPLETED",
    flagged: moderationResult.flagged,
    flaggedCategories: flaggedCategories.length > 0 ? JSON.stringify(flaggedCategories) : null,
    categoryScores: JSON.stringify(moderationResult.category_scores),
    moderationProvider: "openai",
    openaiModerationId: result.id,
    requiresManualReview: moderationResult.flagged,
  });
}

/**
 * Update donation message status in database by ID
 * @param donationId - Donation ID
 * @param messageStatus - New message status (APPROVED, REJECTED, PENDING_REVIEW)
 * @param showMessage - Whether to show the message publicly
 */
export async function updateDonationMessageStatusInDatabase(
  donationId: string,
  messageStatus: string,
  showMessage: boolean,
) {
  const db = getDb();

  await db
    .update(donation)
    .set({
      messageStatus,
      showMessage,
      updatedAt: new Date(),
    })
    .where(eq(donation.id, donationId));
}
