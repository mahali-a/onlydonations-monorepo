import { env } from "cloudflare:workers";
import { moderationQueueDataSchema } from "@repo/core/queues/moderation-schema";
import type { ModerationQueueMessage } from "@repo/core/queues/moderation-schema";
import type { ConsumerResult, QueueConsumer } from "@repo/core/queues/types";
import type { SelectCampaign, SelectUser } from "@repo/core/database/types";
import {
  moderateContent,
  moderateTextContent,
  determineModerationDecision,
  determineDonationMessageDecision,
} from "@/lib/openai";
import { sendEmail } from "@repo/email/email/setup";
import {
  retrieveCampaignByIdFromDatabase,
  retrieveUserByIdFromDatabase,
  saveModerationResultToDatabase,
  updateCampaignStatusInDatabase,
  saveCampaignForManualReviewToDatabase,
  retrieveDonationWithMessageFromDatabase,
  saveDonationMessageModerationToDatabase,
  updateDonationMessageStatusInDatabase,
} from "./moderation-models";

export const moderationConsumer: QueueConsumer<ModerationQueueMessage> = async (
  message,
  ctx,
): Promise<ConsumerResult> => {
  const startTime = Date.now();

  try {
    const data = moderationQueueDataSchema.parse(message.body.data);

    // Route to appropriate handler based on content type
    if (data.contentType === "donation-message") {
      return await handleDonationMessageModeration(data, startTime);
    }

    // Handle campaign and campaign-update moderation
    return await handleCampaignModeration(data, ctx, startTime);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isRetryable = isRetryableError(error);

    if (isRetryable && message.attempts < 3) {
      const delaySeconds = 5 ** message.attempts * 60;

      return {
        status: "retry",
        reason: errorMessage,
        delaySeconds,
      };
    }

    // Only save for manual review if it's a campaign
    const data = message.body.data;
    if (data.contentType !== "donation-message" && data.campaignId) {
      try {
        await saveCampaignForManualReviewToDatabase(data.campaignId, errorMessage);
      } catch (dbError) {
        console.error("[moderationConsumer] Failed to mark for manual review:", dbError);
      }
    }

    return {
      status: "failed",
      reason: errorMessage,
      fatal: !isRetryable || message.attempts >= 3,
    };
  }
};

async function handleCampaignModeration(
  data: { contentType: string; campaignId?: string; organizationId?: string },
  ctx: ExecutionContext,
  startTime: number,
): Promise<ConsumerResult> {
  if (!data.campaignId) {
    return {
      status: "failed",
      reason: "Campaign ID is required for campaign moderation",
      fatal: true,
    };
  }

  const campaignData = await retrieveCampaignByIdFromDatabase(data.campaignId);

  if (!campaignData) {
    return {
      status: "failed",
      reason: `Campaign not found: ${data.campaignId}`,
      fatal: true,
    };
  }

  const coverImageUrl = `${env.R2_PUBLIC_URL}/${campaignData.coverImage}`;

  const moderationResult = await moderateContent(
    {
      title: campaignData.title,
      description: campaignData.description,
      beneficiaryName: campaignData.beneficiaryName,
      coverImageUrl,
    },
    env.OPENAI_API_KEY,
  );

  const decision = determineModerationDecision(moderationResult);

  await saveModerationResultToDatabase(
    { contentType: data.contentType, campaignId: data.campaignId },
    moderationResult,
    decision.reason,
  );

  await updateCampaignStatusInDatabase(data.campaignId, decision.status);

  if (campaignData.createdBy) {
    const user = await retrieveUserByIdFromDatabase(campaignData.createdBy);

    if (user?.email) {
      if (decision.status === "ACTIVE") {
        ctx.waitUntil(sendApprovalEmail(campaignData, user, env.WEB_BASE_URL));
      } else if (decision.status === "REJECTED") {
        ctx.waitUntil(
          sendRejectionEmail(campaignData, user, decision.reason || "", env.WEB_BASE_URL),
        );
      }
    }
  }

  return { status: "success", duration: Date.now() - startTime };
}

async function handleDonationMessageModeration(
  data: { contentType: string; donationId?: string },
  startTime: number,
): Promise<ConsumerResult> {
  if (!data.donationId) {
    return {
      status: "failed",
      reason: "Donation ID is required for donation message moderation",
      fatal: true,
    };
  }

  const donationData = await retrieveDonationWithMessageFromDatabase(data.donationId);

  if (!donationData) {
    return {
      status: "failed",
      reason: `Donation not found: ${data.donationId}`,
      fatal: true,
    };
  }

  if (!donationData.donorMessage) {
    return {
      status: "failed",
      reason: `Donation has no message to moderate: ${data.donationId}`,
      fatal: true,
    };
  }

  // Moderate text only (no image)
  const moderationResult = await moderateTextContent(donationData.donorMessage, env.OPENAI_API_KEY);

  const decision = determineDonationMessageDecision(moderationResult);

  // Save moderation result
  await saveDonationMessageModerationToDatabase(data.donationId, moderationResult);

  // Update donation message status
  await updateDonationMessageStatusInDatabase(
    data.donationId,
    decision.status,
    decision.showMessage,
  );

  console.log("[moderationConsumer] Donation message moderation complete", {
    donationId: data.donationId,
    status: decision.status,
    flagged: moderationResult.results[0]?.flagged,
  });

  return { status: "success", duration: Date.now() - startTime };
}

async function sendApprovalEmail(campaignData: SelectCampaign, user: SelectUser, baseUrl: string) {
  await sendEmail("campaign-approved", {
    email: user.email,
    campaignTitle: campaignData.title,
    campaignUrl: `${baseUrl}/f/${campaignData.slug}`,
    recipientName: campaignData.beneficiaryName,
  });
}

async function sendRejectionEmail(
  campaignData: SelectCampaign,
  user: SelectUser,
  reason: string,
  baseUrl: string,
) {
  await sendEmail("campaign-rejected", {
    email: user.email,
    campaignTitle: campaignData.title,
    reason,
    recipientName: campaignData.beneficiaryName,
    dashboardUrl: `${baseUrl}/o/${campaignData.organizationId}/campaigns`,
  });
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();

  return (
    message.includes("rate limit") ||
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("429") ||
    message.includes("503") ||
    message.includes("502")
  );
}
