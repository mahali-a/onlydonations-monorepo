import type { SelectWithdrawalAccount } from "@repo/core/database/types";
import { useState } from "react";
import type { PaystackApiResponse, PaystackBank } from "@/lib/paystack/types";
import { WithdrawalAccountsView } from "./ui/withdrawal-accounts-view";

type WithdrawalAccountsComponentProps = {
  withdrawalAccounts: SelectWithdrawalAccount[];
  mobileMoneyBanks: PaystackApiResponse<PaystackBank[]>;
  ghipssBanks: PaystackApiResponse<PaystackBank[]>;
};

export function WithdrawalAccountsComponent({
  withdrawalAccounts,
  mobileMoneyBanks,
  ghipssBanks,
}: WithdrawalAccountsComponentProps) {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Withdrawal Accounts</h1>
        <p className="text-muted-foreground">
          Manage your withdrawal accounts for receiving funds from your organization.
        </p>
      </div>

      <WithdrawalAccountsView
        accounts={withdrawalAccounts}
        search={search}
        onSearchChange={setSearch}
        mobileMoneyBanks={mobileMoneyBanks.data || []}
        ghipssBanks={ghipssBanks.data || []}
      />
    </div>
  );
}
