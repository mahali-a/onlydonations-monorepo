import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/core/middleware/auth";
import { kycModel } from "./models/kyc-model";

export const getKycStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user;

    const status = await kycModel.getUserKycStatus(user.id);

    if (!status) {
      return {
        userId: user.id,
        kycStatus: "PENDING" as const,
        kycVerifiedAt: null,
        smileJobId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return status;
  });

export const getVerificationJobs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user;

    const jobs = await kycModel.getUserVerificationJobs(user.id);

    // Filter out pending jobs to avoid showing incomplete/abandoned verifications
    return jobs.filter((job) => job.status !== "pending") as any;
  });

export const getSmileConfig = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    return {
      partnerId: env.SMILE_PARTNER_ID,
      environment: env.SMILE_ENVIRONMENT || "sandbox",
      callbackUrl: env.SMILE_CALLBACK_URL,
    };
  });
