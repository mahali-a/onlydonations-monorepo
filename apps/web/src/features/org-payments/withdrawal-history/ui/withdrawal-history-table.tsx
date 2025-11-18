import type { SelectPaymentTransaction } from "@repo/core/database/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/money";

type WithdrawalHistoryTableProps = {
  withdrawals: SelectPaymentTransaction[];
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  SUCCESS: "border-emerald-200 bg-emerald-50 text-emerald-700",
  FAILED: "border-rose-200 bg-rose-50 text-rose-700",
  DISPUTED: "border-blue-200 bg-blue-50 text-blue-700",
  REFUNDED: "border-gray-200 bg-gray-50 text-gray-700",
  REFUND_PENDING: "border-gray-200 bg-gray-50 text-gray-700",
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return "Completed";
    case "PENDING":
      return "Pending";
    case "FAILED":
      return "Failed";
    case "DISPUTED":
      return "Disputed";
    case "REFUNDED":
      return "Refunded";
    case "REFUND_PENDING":
      return "Refund Pending";
    default:
      return status;
  }
};

const formatDate = (date: Date | null) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function WithdrawalHistoryTable({ withdrawals }: WithdrawalHistoryTableProps) {
  const columns: ColumnDef<SelectPaymentTransaction>[] = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => <time className="text-sm">{formatDate(row.getValue("createdAt"))}</time>,
      meta: {
        className: "min-w-[150px] sm:min-w-[180px]",
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="text-sm font-semibold">
          {formatCurrency(row.getValue("amount"), row.original.currency)}
        </span>
      ),
      meta: {
        className: "min-w-[100px] sm:min-w-[120px]",
      },
    },
    {
      accessorKey: "fees",
      header: "Fees",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatCurrency(row.getValue("fees"), row.original.currency)}
        </span>
      ),
      meta: {
        className: "hidden sm:table-cell min-w-[100px]",
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            className={`h-6 rounded-lg px-2 text-xs font-medium capitalize ${PAYMENT_STATUS_STYLES[status] ?? PAYMENT_STATUS_STYLES.PENDING}`}
            variant="outline"
          >
            {getStatusLabel(status)}
          </Badge>
        );
      },
      meta: {
        className: "min-w-[120px]",
      },
    },
    {
      accessorKey: "processorRef",
      header: "Reference",
      cell: ({ row }) => (
        <span className="text-xs font-mono text-muted-foreground">
          {row.getValue<string>("processorRef").slice(0, 16)}...
        </span>
      ),
      meta: {
        className: "hidden md:table-cell min-w-[150px]",
      },
    },
  ];

  return (
    <div className="overflow-x-auto rounded-md border">
      <DataTable
        columns={columns}
        data={withdrawals}
        emptyMessage={
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">No withdrawals found.</p>
            <p className="text-xs text-muted-foreground">
              Your withdrawal history will appear here once you make your first withdrawal.
            </p>
          </div>
        }
      />
    </div>
  );
}
