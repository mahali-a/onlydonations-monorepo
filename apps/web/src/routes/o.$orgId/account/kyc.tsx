import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import ms from "ms";
import { getKycStatus, getSmileConfig, getVerificationJobs } from "@/features/kyc/server";
import { KycStatusBadge } from "@/features/kyc/ui/kyc-status-badge";
import { KycVerificationWidget } from "@/features/kyc/ui/kyc-verification-widget";

const kycStatusQueryOptions = queryOptions({
  queryKey: ['kyc-status'],
  queryFn: () => getKycStatus(),
  staleTime: ms('5 minutes'),
});

const verificationJobsQueryOptions = queryOptions({
  queryKey: ['verification-jobs'],
  queryFn: () => getVerificationJobs(),
  staleTime: ms('2 minutes'),
});

const smileConfigQueryOptions = queryOptions({
  queryKey: ['smile-config'],
  queryFn: () => getSmileConfig(),
  staleTime: Infinity, // Static config
});

export const Route = createFileRoute("/o/$orgId/account/kyc")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(kycStatusQueryOptions),
      context.queryClient.ensureQueryData(verificationJobsQueryOptions),
      context.queryClient.ensureQueryData(smileConfigQueryOptions),
    ]);
  },
  component: KYCVerification,
});

function KYCVerification() {
  const { data: kycStatus } = useSuspenseQuery(kycStatusQueryOptions);
  const { data: verificationJobs } = useSuspenseQuery(verificationJobsQueryOptions);
  const { data: smileConfig } = useSuspenseQuery(smileConfigQueryOptions);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-background shadow-sm">
        <div className="flex flex-col space-y-4 p-5 sm:p-10">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">KYC Verification</h2>
              <KycStatusBadge status={kycStatus.kycStatus} />
            </div>
            <p className="text-sm text-muted-foreground">
              Complete identity verification to unlock full platform features. We use Smile Identity
              for secure biometric verification.
            </p>
          </div>

          {kycStatus.kycStatus === "VERIFIED" ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-green-900">Verification Complete</h3>
                <p className="text-sm text-green-700">
                  Your identity has been successfully verified on{" "}
                  {kycStatus.kycVerifiedAt
                    ? new Date(kycStatus.kycVerifiedAt).toLocaleDateString()
                    : "N/A"}
                  . You now have access to all platform features.
                </p>
              </div>
            </div>
          ) : kycStatus.kycStatus === "REJECTED" ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-red-900">Verification Rejected</h3>
                <p className="text-sm text-red-700">
                  Your verification attempt was not successful. Please contact support for more
                  information or try again with different documentation.
                </p>
              </div>
            </div>
          ) : (
            <KycVerificationWidget
              partnerId={smileConfig.partnerId}
              environment={smileConfig.environment}
              callbackUrl={smileConfig.callbackUrl}
            />
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-b-xl border-t border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <p>
            Identity verification helps maintain trust and security on our platform. Your data is
            encrypted and processed according to industry standards.
          </p>
        </div>
      </div>

      {verificationJobs.length > 0 && (
        <div className="rounded-xl border border-border bg-background shadow-sm">
          <div className="flex flex-col space-y-4 p-5 sm:p-10">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Verification History</h2>
              <p className="text-sm text-muted-foreground">
                Track all your verification attempts and their current status.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {verificationJobs.map((job: any) => (
                <div
                  key={job.id}
                  className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium capitalize">{job.product.replace(/_/g, " ")}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(job.createdAt).toLocaleString()}
                    </p>
                    {job.resultText && (
                      <p className="text-sm text-muted-foreground">{job.resultText}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        job.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : job.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : job.status === "cancelled"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
