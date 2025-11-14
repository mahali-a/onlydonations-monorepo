import { Badge } from "@/components/ui/badge";
import type { KycStatus } from "../kyc-types";

interface KycStatusBadgeProps {
  status: KycStatus;
}

export function KycStatusBadge({ status }: KycStatusBadgeProps) {
  const variants: Record<
    KycStatus,
    { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
  > = {
    PENDING: { variant: "secondary", label: "Pending" },
    VERIFIED: { variant: "default", label: "Verified" },
    REJECTED: { variant: "destructive", label: "Rejected" },
    REQUIRES_INPUT: { variant: "outline", label: "Action Required" },
  };

  const config = variants[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
