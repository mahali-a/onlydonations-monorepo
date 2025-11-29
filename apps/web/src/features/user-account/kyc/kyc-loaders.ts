import { env } from "cloudflare:workers";
import type { SelectVerificationJob } from "@repo/core/database/types";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import ms from "ms";
import { authMiddleware } from "@/server/middleware/auth";
import {
  retrieveUserKycStatusFromDatabaseByUser,
  retrieveVerificationJobsFromDatabaseByUser,
} from "./kyc-models";

export const retrieveKycStatusFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user;

    const status = await retrieveUserKycStatusFromDatabaseByUser(user.id);

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

export const retrieveVerificationJobsFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user;

    const jobs = await retrieveVerificationJobsFromDatabaseByUser(user.id);

    return jobs
      .filter((job: SelectVerificationJob) => job.status !== "pending")
      .map((job: SelectVerificationJob) => {
        const { rawResult: _rawResult, ...rest } = job;
        return rest;
      });
  });

export const retrieveSmileConfigFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    return {
      partnerId: env.SMILE_PARTNER_ID,
      environment: env.SMILE_ENVIRONMENT || "sandbox",
      callbackUrl: env.SMILE_CALLBACK_URL,
    };
  });

export const kycStatusQueryOptions = queryOptions({
  queryKey: ["kyc-status"],
  queryFn: () => retrieveKycStatusFromServer(),
  staleTime: ms("5 minutes"),
});

export const verificationJobsQueryOptions = queryOptions({
  queryKey: ["verification-jobs"],
  queryFn: async () => {
    const result = await retrieveVerificationJobsFromServer();
    return result;
  },
  staleTime: ms("2 minutes"),
});

export const smileConfigQueryOptions = queryOptions({
  queryKey: ["smile-config"],
  queryFn: () => retrieveSmileConfigFromServer(),
  staleTime: Infinity,
});
