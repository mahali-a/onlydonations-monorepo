import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { HoneypotInputs, HoneypotProvider } from "@/components/honeypot-client";
import { GoogleIcon } from "@/components/icons/google";
import { WordmarkIcon } from "@/components/icons/wordmark";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { sendLoginOtpOnServer } from "@/features/auth-login";
import { authClient } from "@/lib/auth-client";
import type { HoneypotInputProps } from "@/lib/honeypot";
import { cn } from "@/lib/utils";

type LoginForm = {
  email: string;
};

const defaultLoginForm: LoginForm = {
  email: "",
};

type LoginComponentProps = {
  next: string;
  honeypotProps: HoneypotInputProps;
};

export function LoginComponent({ next, honeypotProps }: LoginComponentProps) {
  const navigate = useNavigate();
  const lastMethod = authClient.getLastUsedLoginMethod();

  const handleGoogleLogin = () => {
    authClient.signIn.social({
      provider: "google",
      callbackURL: next,
    });
  };

  const emailForm = useForm({
    defaultValues: defaultLoginForm,
    validators: {
      onSubmitAsync: async ({ value }) => {
        const honeypotData: Record<string, string> = {};
        if (honeypotProps.nameFieldName) {
          honeypotData[honeypotProps.nameFieldName] = "";
        }
        if (honeypotProps.validFromFieldName && honeypotProps.encryptedValidFrom) {
          honeypotData[honeypotProps.validFromFieldName] = honeypotProps.encryptedValidFrom;
        }

        const result = await sendLoginOtpOnServer({
          data: {
            email: value.email,
            honeypotData,
          },
        });

        if (result?.error) {
          return {
            form: result.error.message || "Failed to send verification code",
          };
        }

        navigate({
          to: "/magic-code",
          search: { email: value.email, next },
        });

        return null;
      },
    },
  });

  return (
    <div className="relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1444664361762-afba083a4d77?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      />
      <div className="absolute inset-0 overflow-hidden">
        <span className="absolute top-0 w-full select-none whitespace-nowrap text-center text-[4rem] font-extrabold text-white opacity-[0.02] sm:text-[8rem] md:text-[12rem] lg:text-[17rem]">
          YOUR
        </span>
        <span className="absolute bottom-0 w-full select-none whitespace-nowrap text-center text-[4rem] font-extrabold text-white opacity-[0.02] sm:text-[8rem] md:text-[12rem] lg:text-[17rem]">
          APP
        </span>
      </div>
      <div className="relative z-10 flex min-h-[85vh] w-full max-w-[95%] items-center justify-center overflow-hidden rounded-xl md:min-h-[70vh] md:max-w-[80%] md:rounded-3xl">
        <div className="flex w-full flex-col items-center justify-center px-4 text-center md:px-8">
          <TooltipProvider>
            <HoneypotProvider {...honeypotProps}>
              <div className="w-full max-w-sm rounded-xl bg-card p-6 pb-14 shadow-lg">
                <div className="text-center">
                  <Link className="inline-block py-8" to="/">
                    <WordmarkIcon className="h-10" />
                  </Link>
                  <div className="space-y-2 text-left">
                    <h3 className="text-2xl font-bold text-card-foreground">Welcome</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your email address and we'll send you a one-time code to sign in
                      securely.
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="space-y-4">
                    <Button
                      type="button"
                      onClick={handleGoogleLogin}
                      variant={lastMethod === "google" ? "default" : "outline"}
                      className="relative w-full justify-center"
                    >
                      <GoogleIcon className="w-4" />
                      Continue with Google
                      {lastMethod === "google" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Star className="absolute right-3 h-4 w-4 fill-primary-foreground/70 text-primary-foreground/70" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Last used</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">or</span>
                      </div>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        emailForm.handleSubmit();
                      }}
                      className="space-y-4"
                    >
                      <emailForm.Subscribe selector={(state) => [state.errorMap]}>
                        {([errorMap]) =>
                          errorMap?.onSubmit ? (
                            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-left text-sm text-destructive">
                              {errorMap?.onSubmit.toString()}
                            </div>
                          ) : null
                        }
                      </emailForm.Subscribe>

                      <emailForm.Field
                        name="email"
                        validators={{
                          onChange: ({ value }) => {
                            if (!value) return "Email is required";
                            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                              return "Invalid email address";
                            }
                            return undefined;
                          },
                        }}
                      >
                        {(field) => {
                          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                          return (
                            <Field>
                              <FieldLabel htmlFor="email">Email address</FieldLabel>
                              <Input
                                id="email"
                                type="email"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                placeholder="Enter your email"
                                aria-invalid={isInvalid}
                                className={cn(
                                  "h-10",
                                  isInvalid && "border-destructive focus-visible:ring-destructive",
                                )}
                              />
                              {field.state.meta.errors.length > 0 && (
                                <p className="text-left text-sm text-destructive">
                                  {field.state.meta.errors[0]}
                                </p>
                              )}
                            </Field>
                          );
                        }}
                      </emailForm.Field>

                      <HoneypotInputs />

                      <emailForm.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                      >
                        {([canSubmit, isSubmitting]) => (
                          <Button
                            type="submit"
                            variant={lastMethod === "email-otp" ? "default" : "outline"}
                            className="relative w-full"
                            disabled={!canSubmit || isSubmitting}
                          >
                            {isSubmitting ? "Sending..." : "Continue"}
                            {lastMethod === "email-otp" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Star className="absolute right-3 h-4 w-4 fill-primary-foreground/70 text-primary-foreground/70" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Last used</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </Button>
                        )}
                      </emailForm.Subscribe>
                    </form>
                  </div>
                </div>
              </div>
            </HoneypotProvider>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
