import { env } from "cloudflare:workers";
import { moderationQueueDataSchema } from "@repo/core/queues/moderation-schema";
import type { ModerationQueueMessage } from "@repo/core/queues/moderation-schema";
import type { ConsumerResult, QueueConsumer } from "@repo/core/queues/types";
import type { SelectCampaign, SelectUser } from "@repo/core/database/types";
import { moderateContent, determineModerationDecision } from "@/lib/openai";
import { sendEmail } from "@repo/email/email/setup";
import {
  retrieveCampaignByIdFromDatabase,
  retrieveUserByIdFromDatabase,
  saveModerationResultToDatabase,
  updateCampaignStatusInDatabase,
  saveCampaignForManualReviewToDatabase,
} from "./moderation-models";

export const moderationConsumer: QueueConsumer<ModerationQueueMessage> = async (
  message,
  ctx,
): Promise<ConsumerResult> => {
  const startTime = Date.now();

  try {
    const data = moderationQueueDataSchema.parse(message.body.data);

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

    await saveModerationResultToDatabase(data, moderationResult, decision.reason);

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

    try {
      await saveCampaignForManualReviewToDatabase(message.body.data.campaignId, errorMessage);
    } catch (dbError) {
      console.error("[moderationConsumer] Failed to mark for manual review:", dbError);
    }

    return {
      status: "failed",
      reason: errorMessage,
      fatal: !isRetryable || message.attempts >= 3,
    };
  }
};

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
