import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CampaignStatus = "DRAFT" | "UNDER_REVIEW" | "COMPLETED" | "REJECTED" | "ACTIVE" | "CANCELLED";

type CampaignStatusBadgeProps = {
  status: CampaignStatus;
  className?: string;
};

const STATUS_STYLES: Record<CampaignStatus, string> = {
  DRAFT: "border-slate-200 bg-slate-50 text-slate-700",
  UNDER_REVIEW: "border-amber-200 bg-amber-50 text-amber-700",
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  COMPLETED: "border-blue-200 bg-blue-50 text-blue-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  CANCELLED: "border-gray-200 bg-gray-50 text-gray-700",
};

const STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT: "Draft",
  UNDER_REVIEW: "Under Review",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

export function CampaignStatusBadge({ status, className }: CampaignStatusBadgeProps) {
  const badgeStyles = STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT;
  const label = STATUS_LABELS[status] ?? status;

  return (
    <Badge
      className={cn(
        "h-6 rounded-lg px-2 text-xs font-medium capitalize border",
        badgeStyles,
        className,
      )}
      variant="outline"
    >
      {label}
    </Badge>
  );
}
