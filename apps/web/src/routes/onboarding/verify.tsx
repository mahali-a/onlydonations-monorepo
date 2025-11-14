import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { OnboardingLayout, VerifyForm } from "@/features/onboarding";
import { createDefaultOrganization } from "@/features/onboarding/server";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/onboarding/verify")({
  validateSearch: z.object({
    phone: z.string(),
    next: z.string().optional().default("/app"),
  }),
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

    // Create default organization after successful verification
    const orgResult = await createDefaultOrganization();

    if (orgResult.success && orgResult.organizationId) {
      // Redirect to new organization
      navigate({ to: `/o/${orgResult.organizationId}` });
    } else {
      // Fallback to /app if organization creation fails
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
        className="text-sm text-orange-600 underline hover:text-orange-800"
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
