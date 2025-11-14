import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import type { SmileWebhookPayload } from "@/features/kyc/kyc-types";
import { kycModel } from "@/features/kyc/models/kyc-model";
import { verifyWebhookSignature } from "@/features/kyc/smile-api";
import { logger } from "@/lib/logger";

const webhookLogger = logger.child("smile-webhook");

export const Route = createFileRoute("/api/webhooks/smile")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const rawBody = await request.text();
          const signature = request.headers.get("x-signature");

          if (!signature) {
            webhookLogger.warn("Missing signature in webhook");
            return json({ error: "Missing signature" }, { status: 400 });
          }

          // Verify webhook signature
          const isValid = await verifyWebhookSignature(rawBody, signature, env.SMILE_API_KEY);

          if (!isValid) {
            webhookLogger.warn("Invalid webhook signature");
            return json({ error: "Invalid signature" }, { status: 401 });
          }

          const payload: SmileWebhookPayload = JSON.parse(rawBody);

          // Check for duplicate webhook (idempotency)
          const existingEvent = await kycModel.getWebhookEventByJobId(payload.job_id);
          if (existingEvent) {
            return json({ success: true, message: "Event already processed" }, { status: 200 });
          }

          // Create webhook event record for idempotency
          const webhookEvent = await kycModel.createWebhookEvent({
            jobId: payload.job_id,
            signature: signature,
            rawPayload: payload as unknown as Record<string, unknown>,
          });

          // Get verification job from database
          const job = await kycModel.getVerificationJobBySmileId(payload.job_id);

          if (!job) {
            if (webhookEvent) {
              await kycModel.updateWebhookEvent(webhookEvent.id, {
                status: "failed",
                errorMessage: "Verification job not found",
              });
            }
            webhookLogger.warn("Verification job not found", { jobId: payload.job_id });
            return json({ error: "Job not found" }, { status: 404 });
          }

          // Update verification job status
          await kycModel.updateVerificationJob(payload.job_id, {
            status: "completed",
            resultCode: payload.result.ResultCode,
            resultText: payload.result.ResultText,
            rawResult: payload as unknown as Record<string, unknown>,
          });

          // Update user KYC status based on result
          const isVerified = payload.result.ResultCode === "1";
          const isRejected = payload.result.ResultCode === "0";

          // Get existing KYC status to determine if we need to create or update
          const existingKycStatus = await kycModel.getUserKycStatus(job.userId);

          if (isVerified) {
            const kycData = {
              kycStatus: "VERIFIED" as const,
              kycVerifiedAt: new Date(),
              smileJobId: payload.job_id,
            };

            if (existingKycStatus) {
              await kycModel.updateKycStatus(job.userId, kycData);
            } else {
              await kycModel.createKycStatus(job.userId, kycData);
            }

            webhookLogger.info("KYC verified", {
              userId: job.userId,
              jobId: payload.job_id,
            });
          } else if (isRejected) {
            const kycData = {
              kycStatus: "REJECTED" as const,
              smileJobId: payload.job_id,
            };

            if (existingKycStatus) {
              await kycModel.updateKycStatus(job.userId, kycData);
            } else {
              await kycModel.createKycStatus(job.userId, kycData);
            }

            webhookLogger.warn("KYC rejected", {
              userId: job.userId,
              jobId: payload.job_id,
            });
          } else {
            const kycData = {
              kycStatus: "REQUIRES_INPUT" as const,
              smileJobId: payload.job_id,
            };

            if (existingKycStatus) {
              await kycModel.updateKycStatus(job.userId, kycData);
            } else {
              await kycModel.createKycStatus(job.userId, kycData);
            }

            webhookLogger.warn("KYC requires input", {
              userId: job.userId,
              jobId: payload.job_id,
              resultCode: payload.result.ResultCode,
            });
          }

          // Mark webhook as processed
          if (webhookEvent) {
            await kycModel.updateWebhookEvent(webhookEvent.id, {
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
