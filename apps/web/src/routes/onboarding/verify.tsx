import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { OnboardingLayout, VerifyForm } from "@/features/onboarding";
import { createDefaultOrganizationOnServer } from "@/features/onboarding/server";
import { authClient } from "@/lib/auth-client";

const verifySearchSchema = z.object({
  phone: z.string(),
  next: fallback(z.string(), "/app").default("/app"),
});

export const Route = createFileRoute("/onboarding/verify")({
  validateSearch: zodValidator(verifySearchSchema),
  component: VerifyPage,
});

function VerifyPage() {
  const { phone, next } = Route.useSearch();
  const navigate = useNavigate();

  const handleVerifySubmit = async (values: { code: string }) => {
    const { error } = await authClient.phoneNumber.verify({
      phoneNumber: phone,
      code: values.code,
    });

    if (error) {
      return { error: error.message || "Invalid verification code. Please try again." };
    }

    const orgResult = await createDefaultOrganizationOnServer();

    if (orgResult.success && orgResult.organizationId) {
      navigate({ to: `/o/${orgResult.organizationId}` });
    } else {
      navigate({ to: "/app" });
    }

    return null;
  };

  const handleResend = async () => {
    await authClient.phoneNumber.sendOtp({
      phoneNumber: phone,
    });
  };

  return (
    <OnboardingLayout step="verify">
      <a
        className="text-sm text-primary underline hover:text-primary/80"
        href={`/onboarding?step=phone&change=phone&next=${encodeURIComponent(next)}`}
      >
        Not the right number? Change number
      </a>

      <div className="mt-4">
        <VerifyForm phoneNumber={phone} onSubmit={handleVerifySubmit} onResend={handleResend} />
      </div>
    </OnboardingLayout>
  );
}
