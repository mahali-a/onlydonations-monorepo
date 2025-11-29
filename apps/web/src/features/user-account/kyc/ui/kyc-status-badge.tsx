import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { KycStatus } from "../kyc-models";

type KycStatusBadgeProps = {
  status: KycStatus;
  className?: string;
};

const STATUS_STYLES: Record<KycStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  VERIFIED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  REQUIRES_INPUT: "border-blue-200 bg-blue-50 text-blue-700",
};

const STATUS_LABELS: Record<KycStatus, string> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  REQUIRES_INPUT: "Action Required",
};

export function KycStatusBadge({ status, className }: KycStatusBadgeProps) {
  const badgeStyles = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
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
