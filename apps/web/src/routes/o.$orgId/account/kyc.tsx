import { createFileRoute } from "@tanstack/react-router";
import { promiseHash } from "@/utils/promise-hash";
import {
  kycStatusQueryOptions,
  smileConfigQueryOptions,
  verificationJobsQueryOptions,
} from "@/features/user-kyc/user-kyc-loaders";
import { KycPage } from "@/features/user-kyc/ui/kyc-page";

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
