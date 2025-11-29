import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { smileConfigQueryOptions } from "@/features/user-account/kyc/kyc-loaders";
import { KycVerificationWidget } from "@/features/user-account/kyc/ui/kyc-verification-widget";
import type { KycStatus } from "../make-withdrawal-loaders";

type KycVerificationCardProps = {
  status: KycStatus;
  isVerified: boolean;
};

function getStatusConfig(status: KycStatus) {
  switch (status) {
    case "VERIFIED":
      return {
        description: "Your identity has been verified.",
        badgeText: "Verified",
        badgeClass: "bg-green-50 text-green-700 border-green-200",
        showButton: false,
      };
    case "PENDING":
      return {
        description: "Your identity verification is being processed.",
        badgeText: "Pending",
        badgeClass: "bg-yellow-50 text-yellow-700 border-yellow-200",
        showButton: false,
      };
    case "REJECTED":
      return {
        description: "Your verification was unsuccessful. Please try again.",
        badgeText: "Rejected",
        badgeClass: "bg-red-50 text-red-700 border-red-200",
        showButton: true,
        buttonText: "Retry Verification",
      };
    case "REQUIRES_INPUT":
      return {
        description: "Additional information required to complete verification.",
        badgeText: "Action Required",
        badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
        showButton: true,
        buttonText: "Complete Verification",
      };
    default:
      return {
        description: "Complete identity verification (KYC) to enable withdrawals.",
        showButton: true,
        buttonText: "Start Verification",
      };
  }
}

export function KycVerificationCard({ status, isVerified }: KycVerificationCardProps) {
  const { orgId } = useParams({ from: "/o/$orgId/payments/" });
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: smileConfig, isLoading: isConfigLoading } = useQuery({
    ...smileConfigQueryOptions,
    enabled: isModalOpen,
  });

  const config = getStatusConfig(status);

  const handleVerificationComplete = async () => {
    setIsModalOpen(false);
    await queryClient.invalidateQueries({ queryKey: ["make-withdrawal", orgId] });
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col gap-4 px-5 py-4">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="border border-border shadow-sm flex aspect-square flex-shrink-0 items-center justify-center size-10 rounded-lg text-base text-primary bg-card">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div className="flex w-full flex-col gap-2">
            <p className="font-medium">Identity verification</p>
            <div className="flex flex-col text-sm text-muted-foreground">
              <span>{config.description}</span>
            </div>
          </div>

          {isVerified ? (
            <Badge variant="outline" className={`whitespace-nowrap ${config.badgeClass}`}>
              {config.badgeText}
            </Badge>
          ) : status === "PENDING" ? (
            <Badge variant="outline" className={`whitespace-nowrap ${config.badgeClass}`}>
              {config.badgeText}
            </Badge>
          ) : status === "REJECTED" || status === "REQUIRES_INPUT" ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`whitespace-nowrap ${config.badgeClass}`}>
                {config.badgeText}
              </Badge>
              <Button onClick={() => setIsModalOpen(true)} size="sm" className="whitespace-nowrap">
                {config.buttonText}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsModalOpen(true)} className="whitespace-nowrap">
              {config.buttonText}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Identity Verification</DialogTitle>
            <DialogDescription>
              Complete your identity verification to enable withdrawals. This process is secure and
              typically takes just a few minutes.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isConfigLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : smileConfig ? (
              <KycVerificationWidget
                partnerId={smileConfig.partnerId}
                environment={smileConfig.environment}
                callbackUrl={smileConfig.callbackUrl}
                onVerificationComplete={handleVerificationComplete}
              />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Unable to load verification widget. Please try again later.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
