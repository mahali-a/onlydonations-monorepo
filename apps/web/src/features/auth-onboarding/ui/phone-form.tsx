import { useForm } from "@tanstack/react-form";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PhoneFormData = {
  phoneNumber: string;
};

const defaultPhoneForm: PhoneFormData = {
  phoneNumber: "",
};

type PhoneFormProps = {
  onSubmit: (values: PhoneFormData) => Promise<{ error?: string } | null>;
  onSkip?: () => void;
};

function normalizeGhanaPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("233")) {
    return `+${digits}`;
  }
  if (digits.startsWith("0")) {
    return `+233${digits.slice(1)}`;
  }
  return `+233${digits}`;
}

export function PhoneForm({ onSubmit, onSkip }: PhoneFormProps) {
  const form = useForm({
    defaultValues: defaultPhoneForm,
    validators: {
      onSubmitAsync: async ({ value }) => {
        // Normalize before submitting
        const normalized = normalizeGhanaPhone(value.phoneNumber);
        const result = await onSubmit({ phoneNumber: normalized });

        if (result?.error) {
          return {
            form: result.error,
          };
        }

        return null;
      },
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Subscribe selector={(state) => [state.errorMap]}>
        {([errorMap]) =>
          errorMap?.onSubmit ? (
            <div className="text-left text-sm text-destructive">{errorMap.onSubmit.toString()}</div>
          ) : null
        }
      </form.Subscribe>

      <form.Field
        name="phoneNumber"
        validators={{
          onChange: ({ value }) => {
            if (!value) return "Phone number is required";

            // Only allow digits
            const digits = value.replace(/\D/g, "");
            if (digits.length < 9) {
              return "Please enter your 9-digit phone number";
            }
            if (digits.length > 10) {
              return "Phone number is too long";
            }

            // Validate with libphonenumber
            const normalized = normalizeGhanaPhone(value);
            if (!isValidPhoneNumber(normalized, "GH")) {
              return "Please enter a valid Ghana phone number";
            }

            return undefined;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground" htmlFor="phoneNumber">
              Phone Number
            </Label>
            <div className="flex">
              <div className="flex h-10 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                +233
              </div>
              <Input
                id="phoneNumber"
                type="tel"
                inputMode="numeric"
                value={field.state.value}
                onChange={(e) => {
                  // Only allow digits and limit length
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                  field.handleChange(digits);
                }}
                onBlur={field.handleBlur}
                className={cn(
                  "h-10 rounded-l-none",
                  field.state.meta.errors.length > 0 &&
                    "border-destructive focus-visible:ring-destructive",
                )}
                placeholder="24 123 4567"
                maxLength={10}
              />
            </div>
            {field.state.meta.errors.length > 0 && (
              <div className="text-left text-sm text-destructive">{field.state.meta.errors[0]}</div>
            )}
            <p className="text-left text-xs text-muted-foreground">
              Enter your Ghana mobile number (e.g., 24 123 4567)
            </p>
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Sending Code..." : "Send Verification Code"}
          </Button>
        )}
      </form.Subscribe>

      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="w-full text-center text-sm text-muted-foreground underline hover:text-foreground"
        >
          Skip for now
        </button>
      )}
    </form>
  );
}
