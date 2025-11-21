import { createFileRoute } from "@tanstack/react-router";
import { KycPage } from "@/features/user-kyc/ui/kyc-page";
import {
  kycStatusQueryOptions,
  smileConfigQueryOptions,
  verificationJobsQueryOptions,
} from "@/features/user-kyc/user-kyc-loaders";
import { promiseHash } from "@/utils/promise-hash";

export const Route = createFileRoute("/o/$orgId/account/kyc")({
  loader: async ({ context }) => {
    await promiseHash({
      kycStatus: context.queryClient.ensureQueryData(kycStatusQueryOptions),
      verificationJobs: context.queryClient.ensureQueryData(verificationJobsQueryOptions),
      smileConfig: context.queryClient.ensureQueryData(smileConfigQueryOptions),
    });
  },
  component: KycPage,
});
