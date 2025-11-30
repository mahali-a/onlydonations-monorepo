"use client";

import { useForm } from "@tanstack/react-form";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type VerifyFormData = {
  code: string;
};

const defaultVerifyForm: VerifyFormData = {
  code: "",
};

type VerifyFormProps = {
  phoneNumber: string;
  onSubmit: (values: VerifyFormData) => Promise<{ error?: string } | null>;
  onResend: () => Promise<void>;
};

export function VerifyForm({ phoneNumber, onSubmit, onResend }: VerifyFormProps) {
  const [timeLeft, setTimeLeft] = useState(600);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm({
    defaultValues: defaultVerifyForm,
    validators: {
      onSubmitAsync: async ({ value }) => {
        setIsVerifying(true);
        const result = await onSubmit(value);

        if (result?.error) {
          setIsVerifying(false);
          return {
            fields: {
              code: result.error,
            },
          };
        }

        // Keep isVerifying true - navigation will unmount the component
        return null;
      },
    },
  });

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResend = async () => {
    setIsResending(true);
    await onResend();
    setTimeLeft(600);
    setIsResending(false);
  };

  const maskedPhone = phoneNumber.replace(/(\+\d{1,3})\d*(\d{4})/, "$1***$2");

  return (
    <div className="space-y-6 text-left">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Please enter the code we sent to your phone number {maskedPhone}.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="code">
          {(field) => (
            <div className="space-y-2">
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                value={field.state.value}
                onChange={(value) => {
                  field.handleChange(value);

                  if (value.length === 6) {
                    form.handleSubmit();
                  }
                }}
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

              <p className="text-left text-sm text-muted-foreground">
                {timeLeft > 0 ? (
                  <span>The code will expire in {formatTime(timeLeft)}</span>
                ) : (
                  <span className="text-destructive">Code expired. Please request a new one.</span>
                )}
              </p>

              {field.state.meta.errors.length > 0 && (
                <p className="text-left text-sm text-destructive">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || timeLeft > 0}
          className="mx-auto block text-sm text-primary underline hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResending ? "Sending..." : "Resend code"}
        </button>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting, state.values.code]}
        >
          {([canSubmit, isSubmitting, code]) => {
            const codeLength = typeof code === "string" ? code.length : 0;
            const showLoading = isSubmitting || isVerifying;
            return (
              <Button
                type="submit"
                className="w-full"
                disabled={Boolean(!canSubmit || showLoading || codeLength !== 6)}
              >
                {showLoading ? "Verifying..." : "Verify"}
              </Button>
            );
          }}
        </form.Subscribe>
      </form>
    </div>
  );
}
