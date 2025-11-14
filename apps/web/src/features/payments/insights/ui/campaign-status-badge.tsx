import { Badge } from "@/components/ui/badge";

type CampaignStatus = "DRAFT" | "UNDER_REVIEW" | "COMPLETED" | "REJECTED" | "ACTIVE" | "CANCELLED";

type CampaignStatusBadgeProps = {
  status: CampaignStatus;
};

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const statusConfig = {
    DRAFT: { label: "Draft", variant: "secondary" as const },
    UNDER_REVIEW: { label: "Under Review", variant: "default" as const },
    ACTIVE: { label: "Active", variant: "default" as const },
    COMPLETED: { label: "Completed", variant: "default" as const },
    REJECTED: { label: "Rejected", variant: "destructive" as const },
    CANCELLED: { label: "Cancelled", variant: "secondary" as const },
  };

  const config = statusConfig[status] || statusConfig.DRAFT;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
