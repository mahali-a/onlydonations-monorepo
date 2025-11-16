"use client";

import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { WordmarkIcon } from "@/components/icons/wordmark";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_public/magic-code")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      email: search.email as string,
      next: (search.next as string) || "/app",
    };
  },
  component: MagicCodePage,
});

type MagicCodeForm = {
  code: string;
};

const defaultMagicCodeForm: MagicCodeForm = {
  code: "",
};

function MagicCodePage() {
  const { email, next } = Route.useSearch();
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
  );
}
