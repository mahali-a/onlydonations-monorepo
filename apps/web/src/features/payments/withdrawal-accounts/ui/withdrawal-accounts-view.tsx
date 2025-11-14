import type { SelectWithdrawalAccount } from "@repo/core/database/types";
import type { PaystackBank } from "@/lib/paystack/types";
import { NewWithdrawalAccountDialog } from "./new-withdrawal-account-dialog-form";
import { RecipientsFilters } from "./recipients-filters";
import { WithdrawalAccountsTable } from "./withdrawal-accounts-table";

type WithdrawalAccountsViewProps = {
  accounts: SelectWithdrawalAccount[];
  search: string;
  onSearchChange: (search: string) => void;
  mobileMoneyBanks: PaystackBank[];
  ghipssBanks: PaystackBank[];
};

export function WithdrawalAccountsView({
  accounts,
  search,
  onSearchChange,
  mobileMoneyBanks,
  ghipssBanks,
}: WithdrawalAccountsViewProps) {
  const filteredAccounts = accounts.filter((account) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      account.name?.toLowerCase().includes(searchLower) ||
      account.accountName?.toLowerCase().includes(searchLower) ||
      account.accountNumber.toLowerCase().includes(searchLower) ||
      account.mobileMoneyProvider?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-x-5 items-center justify-between">
        <div className="flex-1">
          <RecipientsFilters search={search} onSearchChange={onSearchChange} />
        </div>
        <NewWithdrawalAccountDialog mobileMoneyBanks={mobileMoneyBanks} ghipssBanks={ghipssBanks} />
      </div>

      {filteredAccounts.length === 0 && search ? (
        <div className="py-12 text-center">
          <div className="mx-auto max-w-md">
            <h3 className="mb-2 font-semibold text-lg">No accounts found</h3>
            <p className="mb-4 text-muted-foreground">
              Try adjusting your search to find more accounts.
            </p>
          </div>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto max-w-md">
            <h3 className="mb-2 font-semibold text-lg">No withdrawal accounts yet</h3>
            <p className="mb-4 text-muted-foreground">
              Add your first withdrawal account to enable fund transfers.
            </p>
            <NewWithdrawalAccountDialog
              mobileMoneyBanks={mobileMoneyBanks}
              ghipssBanks={ghipssBanks}
            />
          </div>
        </div>
      ) : (
        <WithdrawalAccountsTable accounts={filteredAccounts} />
      )}
    </div>
  );
}
