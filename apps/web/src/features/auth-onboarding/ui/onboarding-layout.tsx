import { WordmarkIcon } from "@/components/icons/wordmark";

type OnboardingLayoutProps = {
  step: "name" | "phone" | "verify" | "organization";
  children: React.ReactNode;
};

export function OnboardingLayout({ step, children }: OnboardingLayoutProps) {
  return (
    <div className="w-full max-w-sm rounded-xl bg-card p-6 pb-14 shadow-lg">
      <div className="mb-6 text-left">
        <div className="w-full text-center">
          <a className="inline-block py-4" href="/" rel="noreferrer" target="_blank">
            <WordmarkIcon className="h-10" />
          </a>
        </div>

        {step === "name" && (
          <div className="mt-2 space-y-1">
            <h2 className="text-xl font-semibold">Complete your profile</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Let's get started with your basic information to set up your account.
            </p>
          </div>
        )}

        {step === "phone" && (
          <div className="space-y-4 text-left">
            <h2 className="text-xl font-semibold">Phone verification</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              To keep your account secure, we will send a unique code to your phone number to verify
              your identity.
            </p>
          </div>
        )}

        {step === "verify" && (
          <div className="mt-2 space-y-1">
            <h2 className="text-xl font-semibold">Verify your phone</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Enter the verification code we sent to your phone.
            </p>
          </div>
        )}

        {step === "organization" && (
          <div className="mt-2 space-y-1">
            <h2 className="text-xl font-semibold">Create your organization</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Set up your workspace to start managing your campaigns.
            </p>
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
