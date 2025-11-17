import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import type { DonorRow } from "../donations-models";
import { Money } from "@/lib/money";

type DonationsTableProps = {
  donations: DonorRow[];
};

const DONATION_STATUS_STYLES: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  SUCCESS: "border-emerald-200 bg-emerald-50 text-emerald-700",
  FAILED: "border-rose-200 bg-rose-50 text-rose-700",
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return "Completed";
    case "PENDING":
      return "Pending";
    case "FAILED":
      return "Failed";
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
  });
};

export function DonationsTable({ donations }: DonationsTableProps) {
  const columns: ColumnDef<DonorRow>[] = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => <time className="text-sm">{formatDate(row.getValue("createdAt"))}</time>,
    },
    {
      accessorKey: "donorName",
      header: "Donor",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {row.original.isAnonymous ? "Anonymous" : row.getValue("donorName") || "Unknown"}
          </div>
          {!row.original.isAnonymous && row.original.donorEmail && (
            <div className="text-xs text-muted-foreground">{row.original.donorEmail}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "campaignTitle",
      header: "Campaign",
      cell: ({ row }) => <span className="text-sm">{row.getValue("campaignTitle") || "N/A"}</span>,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="text-sm font-semibold">
          {Money.fromMinor(row.getValue("amount"), row.original.currency).format()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            className={`h-6 rounded-lg px-2 text-xs font-medium capitalize ${DONATION_STATUS_STYLES[status] ?? DONATION_STATUS_STYLES.PENDING}`}
            variant="outline"
          >
            {getStatusLabel(status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "completedAt",
      header: "Completed",
      cell: ({ row }) => (
        <time className="text-sm text-muted-foreground">
          {row.getValue("completedAt") ? formatDate(row.getValue("completedAt")) : "—"}
        </time>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={donations}
      emptyMessage="No donations found. Donations will appear here once you receive them."
    />
  );
}
