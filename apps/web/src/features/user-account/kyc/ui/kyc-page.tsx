import { useSuspenseQuery } from "@tanstack/react-query";
import {
  kycStatusQueryOptions,
  smileConfigQueryOptions,
  verificationJobsQueryOptions,
} from "../kyc-loaders";
import type { KycStatus } from "../kyc-models";
import { KycStatusBadge } from "./kyc-status-badge";
import { KycVerificationWidget } from "./kyc-verification-widget";

export function KycPage() {
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
              <KycStatusBadge status={kycStatus.kycStatus as KycStatus} />
            </div>
            <p className="text-sm text-muted-foreground">
              Complete identity verification to unlock full platform features. We use Smile Identity
              for secure biometric verification.
            </p>
          </div>

          {kycStatus.kycStatus === "VERIFIED" ? (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">Verification Complete</h3>
                <p className="text-sm text-primary/80">
                  Your identity has been successfully verified on{" "}
                  {kycStatus.kycVerifiedAt
                    ? new Date(kycStatus.kycVerifiedAt).toLocaleDateString()
                    : "N/A"}
                  . You now have access to all platform features.
                </p>
              </div>
            </div>
          ) : kycStatus.kycStatus === "REJECTED" ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-destructive">Verification Rejected</h3>
                <p className="text-sm text-destructive/80">
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
              {verificationJobs.map((job) => (
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
                          ? "bg-primary/20 text-primary"
                          : job.status === "failed"
                            ? "bg-destructive/20 text-destructive"
                            : job.status === "cancelled"
                              ? "bg-muted text-muted-foreground"
                              : "bg-yellow-100/50 text-yellow-700"
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
