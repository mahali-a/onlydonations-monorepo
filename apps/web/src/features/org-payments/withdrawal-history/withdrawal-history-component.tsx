import type { SelectPaymentTransaction } from "@repo/core/database/types";
import { WithdrawalHistoryTable } from "./ui";

type WithdrawalHistoryComponentProps = {
  withdrawals: SelectPaymentTransaction[];
};

export function WithdrawalHistoryComponent({ withdrawals }: WithdrawalHistoryComponentProps) {
  return <WithdrawalHistoryTable withdrawals={withdrawals} />;
}
