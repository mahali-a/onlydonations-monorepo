"use client";

import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { WordmarkIcon } from "@/components/icons/wordmark";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";

type MagicCodeForm = {
  code: string;
};

const defaultMagicCodeForm: MagicCodeForm = {
  code: "",
};

type MagicCodeComponentProps = {
  email: string;
  next: string;
};

export function MagicCodeComponent({ email, next }: MagicCodeComponentProps) {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: defaultMagicCodeForm,
    validators: {
      onSubmitAsync: async ({ value }) => {
        const { error } = await authClient.signIn.emailOtp({
          email,
          otp: value.code,
        });

        if (error) {
          return {
            fields: {
              code: error.message || "Invalid verification code. Please try again.",
            },
          };
        }

        navigate({ to: next });
        return null;
      },
    },
  });

  const maskedEmail = email.replace(
    /(^.).+(@.+$)/,
    (_match: string, start: string, end: string) => `${start}***${end}`,
  );

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
          <div className="w-full max-w-sm rounded-xl bg-card p-6 pb-14 shadow-lg">
            <div className="text-center">
              <Link className="inline-block py-8" to="/">
                <WordmarkIcon className="h-10" />
              </Link>
              <div className="space-y-2 text-left">
                <h3 className="text-2xl font-bold text-card-foreground">Enter your code</h3>
                <p className="text-sm text-muted-foreground">
                  We've sent a 6-digit code to {maskedEmail}. Enter it below to continue.
                </p>
                <p className="text-xs text-muted-foreground">
                  Not your email?{" "}
                  <Link
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                    to="/login"
                    search={{ next: "/app" }}
                  >
                    Use a different address
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="space-y-4"
              >
                <form.Field name="code">
                  {(field) => {
                    return (
                      <div className="space-y-2">
                        <InputOTP
                          maxLength={6}
                          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                          value={field.state.value}
                          onChange={(value) => field.handleChange(value)}
                          onBlur={field.handleBlur}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>

                        {field.state.meta.errors.length > 0 && (
                          <p className="text-left text-sm text-destructive">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    );
                  }}
                </form.Field>

                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting, state.values.code]}
                >
                  {([canSubmit, isSubmitting, code]) => {
                    const codeLength = typeof code === "string" ? code.length : 0;
                    return (
                      <Button
                        type="submit"
                        className="w-full text-white"
                        disabled={Boolean(!canSubmit || isSubmitting || codeLength !== 6)}
                      >
                        {isSubmitting ? "Verifying..." : "Verify and continue"}
                      </Button>
                    );
                  }}
                </form.Subscribe>
              </form>

              <p className="text-xs text-muted-foreground">
                Didn't receive a code?{" "}
                <Link
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                  to="/login"
                  search={{ next: "/app" }}
                >
                  Send a new one
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
