import { Link, useParams } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WithdrawalVerificationStatus } from "../make-withdrawal-loaders";
import { KycVerificationCard } from "./kyc-verification-card";
import { PhoneVerificationCard } from "./phone-verification-card";

type WithdrawalVerificationRequiredProps = {
  verificationStatus: WithdrawalVerificationStatus;
};

export function WithdrawalVerificationRequired({
  verificationStatus,
}: WithdrawalVerificationRequiredProps) {
  const { orgId } = useParams({ from: "/o/$orgId/payments/" });
  const { phone, kyc, payoutAccount } = verificationStatus;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <span className="font-medium">Complete verification to enable withdrawals.</span> Please
          complete all verification steps below before you can request a withdrawal.
        </p>
      </div>

      <PhoneVerificationCard
        hasPhone={phone.hasPhone}
        isVerified={phone.isVerified}
        phoneNumber={phone.phoneNumber}
      />

      <KycVerificationCard status={kyc.status} isVerified={kyc.isVerified} />

      <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col gap-4 px-5 py-4">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="border border-border shadow-sm flex aspect-square flex-shrink-0 items-center justify-center size-10 rounded-lg text-base text-primary bg-card">
            <Building2 className="h-5 w-5" />
          </div>

          <div className="flex w-full flex-col gap-2">
            <p className="font-medium">Payout account</p>
            <div className="flex flex-col text-sm text-muted-foreground">
              <span>
                {payoutAccount.hasAccount
                  ? "You have a payout account configured for withdrawals."
                  : "Add a bank or mobile money account to receive withdrawals."}
              </span>
            </div>
          </div>

          {payoutAccount.hasAccount ? (
            <Badge
              variant="outline"
              className="whitespace-nowrap bg-green-50 text-green-700 border-green-200"
            >
              Added
            </Badge>
          ) : (
            <Button asChild className="whitespace-nowrap">
              <Link to="/o/$orgId/payments/withdrawal-accounts" params={{ orgId }}>
                Add Account
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
