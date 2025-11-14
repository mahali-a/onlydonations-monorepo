import type { SelectPaymentTransaction } from "@repo/core/database/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/money";

type WithdrawalHistoryTableProps = {
  withdrawals: SelectPaymentTransaction[];
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return "default";
    case "PENDING":
      return "secondary";
    case "FAILED":
      return "destructive";
    case "DISPUTED":
      return "outline";
    case "REFUNDED":
    case "REFUND_PENDING":
      return "outline";
    default:
      return "outline";
  }
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
        className: "min-w-[180px]",
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
        className: "min-w-[120px]",
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
        className: "min-w-[100px]",
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(row.getValue("status")) as any}>
          {getStatusLabel(row.getValue("status"))}
        </Badge>
      ),
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
        className: "min-w-[150px]",
      },
    },
  ];

  return (
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
  );
}
