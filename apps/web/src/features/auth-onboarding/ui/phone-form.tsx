import { useForm } from "@tanstack/react-form";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getE164Number, PhoneInput, type PhoneInputValue } from "@/components/ui/phone-input";
import { defaultCountry } from "@/lib/countries";

type PhoneFormData = {
  phoneNumber: string;
};

type PhoneFormValues = {
  phone: PhoneInputValue;
};

const defaultPhoneForm: PhoneFormValues = {
  phone: {
    country: defaultCountry,
    nationalNumber: "",
  },
};

type PhoneFormProps = {
  onSubmit: (values: PhoneFormData) => Promise<{ error?: string } | null>;
  onSkip?: () => void;
};

export function PhoneForm({ onSubmit, onSkip }: PhoneFormProps) {
  const form = useForm({
    defaultValues: defaultPhoneForm,
    validators: {
      onSubmitAsync: async ({ value }) => {
        const e164 = getE164Number(value.phone);
        const result = await onSubmit({ phoneNumber: e164 });

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
          errorMap?.onSubmit?.form ? (
            <div className="text-left text-sm text-destructive">{errorMap.onSubmit.form}</div>
          ) : null
        }
      </form.Subscribe>

      <form.Field
        name="phone"
        validators={{
          onChange: ({ value }) => {
            if (!value.nationalNumber) return "Phone number is required";

            const digits = value.nationalNumber.replace(/\D/g, "");
            if (digits.length < 6) {
              return "Phone number is too short";
            }
            if (digits.length > 15) {
              return "Phone number is too long";
            }

            // Validate with libphonenumber using the selected country
            const e164 = getE164Number(value);
            if (!isValidPhoneNumber(e164, value.country.code)) {
              return `Please enter a valid ${value.country.name} phone number`;
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
            <PhoneInput
              value={field.state.value}
              onChange={(val) => field.handleChange(val)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors.length > 0}
              placeholder="Enter your phone number"
            />
            {field.state.meta.errors.length > 0 && (
              <div className="text-left text-sm text-destructive">{field.state.meta.errors[0]}</div>
            )}
            <p className="text-left text-xs text-muted-foreground">
              Select your country and enter your phone number
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
