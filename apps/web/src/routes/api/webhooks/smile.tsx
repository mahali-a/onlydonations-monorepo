import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import type { SmileWebhookPayload } from "@/features/user-account/kyc/kyc-models";
import {
  retrieveSmileWebhookEventFromDatabaseByJobId,
  retrieveUserKycStatusFromDatabaseByUser,
  retrieveVerificationJobFromDatabaseBySmileId,
  saveSmileWebhookEventToDatabase,
  saveUserKycStatusToDatabase,
  updateSmileWebhookEventInDatabase,
  updateUserKycStatusInDatabase,
  updateVerificationJobInDatabase,
} from "@/features/user-account/kyc/kyc-models";
import { verifyWebhookSignature } from "@/features/user-account/kyc/kyc-smile-service";
import { logger } from "@/lib/logger";

const webhookLogger = logger.createChildLogger("smile-webhook");

export const Route = createFileRoute("/api/webhooks/smile")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const rawBody = await request.text();
          const signature = request.headers.get("x-signature");

          if (!signature) {
            webhookLogger.error("Missing signature in webhook");
            return json({ error: "Missing signature" }, { status: 400 });
          }

          const isValid = await verifyWebhookSignature(rawBody, signature, env.SMILE_API_KEY);

          if (!isValid) {
            webhookLogger.error("Invalid webhook signature");
            return json({ error: "Invalid signature" }, { status: 401 });
          }

          const payload: SmileWebhookPayload = JSON.parse(rawBody);

          const existingEvent = await retrieveSmileWebhookEventFromDatabaseByJobId(payload.job_id);
          if (existingEvent) {
            return json({ success: true, message: "Event already processed" }, { status: 200 });
          }

          const webhookEvent = await saveSmileWebhookEventToDatabase({
            jobId: payload.job_id,
            signature: signature,
            rawPayload: payload as unknown as Record<string, unknown>,
          });

          const job = await retrieveVerificationJobFromDatabaseBySmileId(payload.job_id);

          if (!job) {
            if (webhookEvent) {
              await updateSmileWebhookEventInDatabase(webhookEvent.id, {
                status: "failed",
                errorMessage: "Verification job not found",
              });
            }
            webhookLogger.error("Verification job not found", undefined, { jobId: payload.job_id });
            return json({ error: "Job not found" }, { status: 404 });
          }

          await updateVerificationJobInDatabase(payload.job_id, {
            status: "completed",
            resultCode: payload.result.ResultCode,
            resultText: payload.result.ResultText,
            rawResult: payload as unknown as Record<string, unknown>,
          });

          const isVerified = payload.result.ResultCode === "1";
          const isRejected = payload.result.ResultCode === "0";

          const existingKycStatus = await retrieveUserKycStatusFromDatabaseByUser(job.userId);

          if (isVerified) {
            const kycData = {
              kycStatus: "VERIFIED" as const,
              kycVerifiedAt: new Date(),
              smileJobId: payload.job_id,
            };

            if (existingKycStatus) {
              await updateUserKycStatusInDatabase(job.userId, kycData);
            } else {
              await saveUserKycStatusToDatabase(job.userId, kycData);
            }
          } else if (isRejected) {
            const kycData = {
              kycStatus: "REJECTED" as const,
              smileJobId: payload.job_id,
            };

            if (existingKycStatus) {
              await updateUserKycStatusInDatabase(job.userId, kycData);
            } else {
              await saveUserKycStatusToDatabase(job.userId, kycData);
            }
          } else {
            const kycData = {
              kycStatus: "REQUIRES_INPUT" as const,
              smileJobId: payload.job_id,
            };

            if (existingKycStatus) {
              await updateUserKycStatusInDatabase(job.userId, kycData);
            } else {
              await saveUserKycStatusToDatabase(job.userId, kycData);
            }
          }

          if (webhookEvent) {
            await updateSmileWebhookEventInDatabase(webhookEvent.id, {
              status: "processed",
              processedAt: new Date(),
            });
          }

          return json({ success: true }, { status: 200 });
        } catch (error) {
          webhookLogger.error("Failed to process webhook", error);
          return json(
            {
              error: "Failed to process webhook",
              message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
