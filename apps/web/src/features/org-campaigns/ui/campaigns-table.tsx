import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Money } from "@/lib/money";
import type { CampaignFilters } from "../campaigns-schemas";
import { CampaignActionsMenu } from "./campaign-actions-menu";

type CampaignWithStats = {
  id: string;
  slug: string;
  status: string;
  amount: number;
  currency: string;
  title: string;
  beneficiaryName: string;
  createdAt: Date;
  category: {
    id: string;
    name: string;
  } | null;
  totalRaised: number;
  donationCount: number;
};

type CampaignsDataTableProps = {
  campaigns: CampaignWithStats[];
  filters: CampaignFilters;
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "border-slate-200 bg-slate-50 text-slate-700",
  UNDER_REVIEW: "border-amber-200 bg-amber-50 text-amber-700",
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  COMPLETED: "border-blue-200 bg-blue-50 text-blue-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  CANCELLED: "border-gray-200 bg-gray-50 text-gray-700",
};

const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    DRAFT: "Draft",
    UNDER_REVIEW: "Under Review",
    ACTIVE: "Active",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
  };
  return labelMap[status] || status.replace("_", " ");
};

export function CampaignsDataTable({ campaigns, filters }: CampaignsDataTableProps) {
  const navigate = useNavigate({ from: "/o/$orgId/campaigns" });
  const params = useParams({ from: "/o/$orgId/campaigns" });

  const handleSort = (column: string) => {
    const newSortOrder = filters.sortBy === column && filters.sortOrder === "asc" ? "desc" : "asc";

    navigate({
      search: (prev) => ({
        ...prev,
        sortBy: column as CampaignFilters["sortBy"],
        sortOrder: newSortOrder,
        page: 1,
      }),
    });
  };

  const getSortIcon = (column: string) => {
    if (filters.sortBy !== column) {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
    return filters.sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const formatMoney = (amount: number, currency: string) => {
    return Money.fromMinor(amount, currency || "GHS").format({ decimals: 0 });
  };

  const calculateProgress = (raised: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min(100, Math.round((raised / goal) * 100));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px] sm:min-w-[250px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("title")}
                className="flex items-center gap-2"
              >
                Campaign
                {getSortIcon("title")}
              </Button>
            </TableHead>
            <TableHead className="hidden sm:table-cell min-w-[150px]">Category</TableHead>
            <TableHead className="min-w-[120px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("status")}
                className="flex items-center gap-2"
              >
                Status
                {getSortIcon("status")}
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell min-w-[100px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("supporters")}
                className="flex items-center gap-2"
              >
                Supporters
                {getSortIcon("supporters")}
              </Button>
            </TableHead>
            <TableHead className="min-w-[140px] sm:min-w-[200px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("raised")}
                className="flex items-center gap-2"
              >
                Amount Raised
                {getSortIcon("raised")}
              </Button>
            </TableHead>
            <TableHead className="hidden lg:table-cell min-w-[150px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("created")}
                className="flex items-center gap-2"
              >
                Created
                {getSortIcon("created")}
              </Button>
            </TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const progress = calculateProgress(campaign.totalRaised, campaign.amount);

            return (
              <TableRow key={campaign.id}>
                <TableCell>
                  <Link
                    to="/o/$orgId/campaigns/$campaignId"
                    params={{ orgId: params.orgId, campaignId: campaign.id }}
                    className="font-medium hover:underline"
                  >
                    {campaign.title}
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {campaign.category?.name || "N/A"}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`h-6 rounded-lg px-2 text-xs font-medium capitalize ${STATUS_STYLES[campaign.status] ?? STATUS_STYLES.DRAFT}`}
                    variant="outline"
                  >
                    {getStatusLabel(campaign.status)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm">{campaign.donationCount}</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium">
                        {formatMoney(campaign.totalRaised, campaign.currency)}
                      </span>
                      <span className="hidden sm:inline text-muted-foreground">
                        {formatMoney(campaign.amount, campaign.currency)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{progress}%</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(campaign.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <CampaignActionsMenu campaign={campaign} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
