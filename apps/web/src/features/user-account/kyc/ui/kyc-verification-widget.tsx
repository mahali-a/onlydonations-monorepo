import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { KycProduct, SmileIdentityConfig } from "../kyc-models";
import { generateKycVerificationTokenOnServer } from "../server";

type KycVerificationWidgetProps = {
  partnerId: string;
  environment: string;
  callbackUrl: string;
  onVerificationComplete?: (data: Record<string, unknown>) => void;
  className?: string;
};

export function KycVerificationWidget({
  partnerId,
  environment,
  callbackUrl,
  onVerificationComplete,
  className = "",
}: KycVerificationWidgetProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const form = useForm({
    defaultValues: {
      product: "biometric_kyc" as KycProduct,
    },
    validators: {
      onSubmitAsync: async ({ value }) => {
        try {
          const formData = new FormData();
          formData.append("product", value.product);

          const result = await generateKycVerificationTokenOnServer({ data: formData });

          if (!result || typeof result !== "object" || !("success" in result)) {
            return {
              form: "Error starting verification. Please try again later.",
            };
          }

          if (!result.success || !result.token) {
            return {
              form: "Error starting verification. Please try again later.",
            };
          }

          if (window?.SmileIdentity && result.token && result.jobId && result.userId) {
            const config = createSmileConfig(result.token, result.jobId, result.userId);
            window.SmileIdentity(config);
          } else {
            return {
              form: "Error starting verification. Please try again later.",
            };
          }

          return null;
        } catch (_error) {
          return {
            form: "Error starting verification. Please try again later.",
          };
        }
      },
    },
  });

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "SmileIdentity" in window &&
      typeof window.SmileIdentity === "function"
    ) {
      setIsScriptLoaded(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://cdn.smileidentity.com/inline/v10/js/script.min.js"]',
    );
    if (existingScript) {
      const checkLoaded = () => {
        if (
          typeof window !== "undefined" &&
          "SmileIdentity" in window &&
          typeof window.SmileIdentity === "function"
        ) {
          setIsScriptLoaded(true);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.smileidentity.com/inline/v10/js/script.min.js";
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      setError("Failed to load Smile Identity widget");
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const createSmileConfig = useCallback(
    (token: string, jobId: string, userId: string): SmileIdentityConfig => ({
      token,
      product: "biometric_kyc",
      callback_url: callbackUrl,
      environment: environment,
      partner_details: {
        partner_id: partnerId,
        name: "SaaS Kit",
        logo_url: `${window.location.origin}/favicon.ico`,
        policy_url: `${window.location.origin}/privacy-policy`,
        theme_color: "#18181b",
      },
      partner_params: {
        job_id: jobId,
        user_id: userId,
        internal_reference: `ref-${Date.now()}`,
      },
      document_capture_modes: ["camera", "upload"],
      allow_agent_mode: false,
      onSuccess: (data) => {
        onVerificationComplete?.(data);
        router.invalidate();
      },
      onError: (error) => {
        let errorMessage: string;
        if (typeof error === "string") {
          errorMessage = error;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        } else if (
          error &&
          typeof error === "object" &&
          "message" in error &&
          typeof error.message === "string"
        ) {
          errorMessage = error.message;
        } else {
          errorMessage = "Verification failed";
        }
        setError(errorMessage);
      },
      onClose: () => {
        router.invalidate();
      },
    }),
    [partnerId, environment, callbackUrl, onVerificationComplete, router],
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <button
              type="button"
              className="mt-2 block text-sm underline hover:opacity-80"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}

      <form.Subscribe selector={(state) => [state.errorMap]}>
        {([errorMap]) =>
          errorMap?.onSubmit && (
            <Alert variant="destructive">
              <AlertDescription>{String(errorMap.onSubmit)}</AlertDescription>
            </Alert>
          )
        }
      </form.Subscribe>

      {!isScriptLoaded && !error && (
        <Alert className="border-primary/30 bg-primary/10">
          <AlertDescription className="text-primary/80">
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading Smile Identity verification widget...
            </div>
          </AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-primary">Complete Biometric KYC</h3>
                <p className="mt-1 text-sm text-primary/80">
                  Full identity verification with ID document scan and live selfie capture. This is
                  the most comprehensive verification option.
                </p>
              </div>
              <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit]}>
                {([isSubmitting, canSubmit]) => (
                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={isSubmitting || !isScriptLoaded || !canSubmit}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting Verification...
                      </>
                    ) : !isScriptLoaded ? (
                      "Loading Widget..."
                    ) : (
                      "Start Full Verification"
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </div>
        </div>
      </form>

      <div className="rounded-lg border border-muted bg-muted/40 p-4">
        <p className="text-center text-sm text-muted-foreground">
          🔒 Your data is processed securely and in compliance with privacy regulations. We use
          industry-leading security measures to protect your information.
        </p>
      </div>
    </div>
  );
}
