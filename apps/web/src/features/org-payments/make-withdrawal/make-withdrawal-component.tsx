import type { SelectWithdrawalAccount } from "@repo/core/database/types";
import { Link, useParams } from "@tanstack/react-router";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WithdrawalVerificationStatus } from "./make-withdrawal-loaders";
import { WithdrawalForm, WithdrawalVerificationRequired } from "./ui";

type MakeWithdrawalComponentProps = {
  withdrawalAccounts: SelectWithdrawalAccount[];
  availableBalance: number;
  currency: string;
  verificationStatus: WithdrawalVerificationStatus;
};

export function MakeWithdrawalComponent({
  withdrawalAccounts,
  availableBalance,
  currency,
  verificationStatus,
}: MakeWithdrawalComponentProps) {
  const { orgId } = useParams({ from: "/o/$orgId/payments/" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Request Withdrawal</h1>
          <p className="text-sm text-muted-foreground">
            Transfer funds from your available balance
          </p>
        </div>
        <Link to="/o/$orgId/payments/withdrawal-history" params={{ orgId }}>
          <Button variant="outline" className="gap-2">
            <History className="h-4 w-4" />
            View History
          </Button>
        </Link>
      </div>

      {!verificationStatus.allVerified ? (
        <WithdrawalVerificationRequired verificationStatus={verificationStatus} />
      ) : (
        <WithdrawalForm
          payoutAccounts={withdrawalAccounts}
          availableBalance={availableBalance}
          currency={currency}
        />
      )}
    </div>
  );
}
