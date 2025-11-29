import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Phone } from "lucide-react";
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
import { PhoneForm, VerifyForm } from "@/features/auth-onboarding";
import { updateUserPhoneOnServer } from "@/features/auth-onboarding/server";
import { authClient } from "@/lib/auth-client";

type PhoneVerificationCardProps = {
  hasPhone: boolean;
  isVerified: boolean;
  phoneNumber: string | null;
};

export function PhoneVerificationCard({
  hasPhone,
  isVerified,
  phoneNumber,
}: PhoneVerificationCardProps) {
  const { orgId } = useParams({ from: "/o/$orgId/payments/" });
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState(phoneNumber || "");

  const handlePhoneSubmit = async (values: { phoneNumber: string }) => {
    const result = await updateUserPhoneOnServer({ data: values });

    if ("error" in result && result.error) {
      return { error: String(result.error) };
    }

    setCurrentPhoneNumber(values.phoneNumber);
    setStep("verify");
    return null;
  };

  const handleVerifySubmit = async (values: { code: string }) => {
    const { error } = await authClient.phoneNumber.verify({
      phoneNumber: currentPhoneNumber,
      code: values.code,
    });

    if (error) {
      return { error: error.message || "Invalid verification code. Please try again." };
    }

    setIsModalOpen(false);
    setStep("phone");
    await queryClient.invalidateQueries({ queryKey: ["make-withdrawal", orgId] });
    return null;
  };

  const handleResend = async () => {
    await authClient.phoneNumber.sendOtp({
      phoneNumber: currentPhoneNumber,
    });
  };

  const handleOpenModal = () => {
    if (hasPhone && !isVerified && phoneNumber) {
      setCurrentPhoneNumber(phoneNumber);
      setStep("verify");
    } else {
      setStep("phone");
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col gap-4 px-5 py-4">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="border border-border shadow-sm flex aspect-square flex-shrink-0 items-center justify-center size-10 rounded-lg text-base text-primary bg-card">
            <Phone className="h-5 w-5" />
          </div>

          <div className="flex w-full flex-col gap-2">
            <p className="font-medium">Phone verification</p>
            <div className="flex flex-col text-sm text-muted-foreground">
              <span>
                {isVerified
                  ? "Your phone number has been verified."
                  : hasPhone
                    ? "Please verify your phone number to enable withdrawals."
                    : "Add and verify your phone number to enable withdrawals."}
              </span>
            </div>
          </div>

          {isVerified ? (
            <Badge
              variant="outline"
              className="whitespace-nowrap bg-green-50 text-green-700 border-green-200"
            >
              Verified
            </Badge>
          ) : (
            <Button onClick={handleOpenModal} className="whitespace-nowrap">
              {hasPhone ? "Verify Phone" : "Add Phone"}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {step === "phone" ? "Add Phone Number" : "Verify Phone Number"}
            </DialogTitle>
            <DialogDescription>
              {step === "phone"
                ? "Enter your phone number to receive a verification code."
                : "Enter the verification code sent to your phone."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {step === "phone" ? (
              <PhoneForm onSubmit={handlePhoneSubmit} />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="mb-4 text-sm text-primary underline hover:text-primary/80"
                >
                  Change phone number
                </button>
                <VerifyForm
                  phoneNumber={currentPhoneNumber}
                  onSubmit={handleVerifySubmit}
                  onResend={handleResend}
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
