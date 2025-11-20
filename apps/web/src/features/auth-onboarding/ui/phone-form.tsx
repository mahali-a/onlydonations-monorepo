import { useForm } from "@tanstack/react-form";
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
};

export function PhoneForm({ onSubmit }: PhoneFormProps) {
  const form = useForm({
    defaultValues: defaultPhoneForm,
    validators: {
      onSubmitAsync: async ({ value }) => {
        const result = await onSubmit(value);

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

            if (!/^\+[1-9]\d{1,14}$/.test(value)) {
              return "Invalid phone number format. Use E.164 format (e.g., +11234567890)";
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
            <Input
              id="phoneNumber"
              type="tel"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className={cn(
                "h-10",
                field.state.meta.errors.length > 0 &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              placeholder="+1 (555) 123-4567"
            />
            {field.state.meta.errors.length > 0 && (
              <div className="text-left text-sm text-destructive">{field.state.meta.errors[0]}</div>
            )}
            <p className="text-left text-xs text-muted-foreground">
              Include country code (e.g., +1 for US)
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
    </form>
  );
}
