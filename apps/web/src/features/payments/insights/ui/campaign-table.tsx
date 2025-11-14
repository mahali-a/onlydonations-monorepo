import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { formatForDashboard } from "@/lib/money";
import { CampaignStatusBadge } from "./campaign-status-badge";

type Campaign = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "UNDER_REVIEW" | "COMPLETED" | "REJECTED" | "ACTIVE" | "CANCELLED";
  totalRaised: number;
  feesDeducted: number;
  netEarnings: number;
  avgDonation: number;
  donationCount: number;
  goalAmount: number;
  currency: string;
};

type CampaignTableProps = {
  campaigns: Campaign[];
  organizationSlug: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange: (page: number) => void;
};

export function CampaignTable({
  campaigns,
  organizationSlug,
  pagination,
  onPageChange,
}: CampaignTableProps) {
  const columns: ColumnDef<Campaign>[] = [
    {
      accessorKey: "title",
      header: "Campaign",
      cell: ({ row }) => (
        <Link
          to="/o/$orgId/campaigns/$campaignId"
          params={{ orgId: organizationSlug, campaignId: row.original.id }}
          className="font-medium hover:underline"
        >
          {row.getValue("title")}
        </Link>
      ),
      meta: {
        className: "min-w-[250px]",
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <CampaignStatusBadge status={row.getValue("status")} />,
      meta: {
        className: "min-w-[120px]",
      },
    },
    {
      accessorKey: "totalRaised",
      header: () => <div className="text-right">Total Raised</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatForDashboard(row.getValue("totalRaised"), row.original.currency)}
        </div>
      ),
      meta: {
        className: "min-w-[120px]",
      },
    },
    {
      accessorKey: "feesDeducted",
      header: () => <div className="text-right">Fees Deducted</div>,
      cell: ({ row }) => (
        <div className="text-right text-muted-foreground">
          {formatForDashboard(row.getValue("feesDeducted"), row.original.currency)}
        </div>
      ),
      meta: {
        className: "min-w-[120px]",
      },
    },
    {
      accessorKey: "netEarnings",
      header: () => <div className="text-right">Net Earnings</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium text-green-600 dark:text-green-400">
          {formatForDashboard(row.getValue("netEarnings"), row.original.currency)}
        </div>
      ),
      meta: {
        className: "min-w-[120px]",
      },
    },
    {
      accessorKey: "avgDonation",
      header: () => <div className="text-right">Avg Donation</div>,
      cell: ({ row }) => (
        <div className="text-right text-muted-foreground">
          {formatForDashboard(row.getValue("avgDonation"), row.original.currency)}
        </div>
      ),
      meta: {
        className: "min-w-[120px]",
      },
    },
    {
      accessorKey: "donationCount",
      header: () => <div className="text-right">Donors</div>,
      cell: ({ row }) => (
        <div className="text-right text-muted-foreground">{row.getValue("donationCount")}</div>
      ),
      meta: {
        className: "min-w-[100px]",
      },
    },
  ];

  if (campaigns.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-12 text-center">
        <p className="text-muted-foreground">No campaigns found</p>
      </div>
    );
  }

  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={campaigns} emptyMessage="No campaigns found" />

      {/* Pagination */}
      <div className="flex flex-col gap-4 px-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-center text-sm text-muted-foreground lg:flex-1 lg:text-left">
          Showing {startIndex} – {endIndex} of {pagination.total} campaigns
        </div>
        <div className="flex w-full items-center justify-end gap-2 lg:w-auto">
          <Button
            className="h-8 w-8 p-0"
            disabled={!pagination.hasPrev}
            onClick={() => onPageChange(pagination.page - 1)}
            variant="outline"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            className="h-8 w-8 p-0"
            disabled={!pagination.hasNext}
            onClick={() => onPageChange(pagination.page + 1)}
            variant="outline"
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
