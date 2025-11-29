import { createFileRoute } from "@tanstack/react-router";
import {
  kycStatusQueryOptions,
  smileConfigQueryOptions,
  verificationJobsQueryOptions,
} from "@/features/user-account/kyc/kyc-loaders";
import { KycPage } from "@/features/user-account/kyc/ui/kyc-page";
import { promiseHash } from "@/lib/promise-hash";

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
