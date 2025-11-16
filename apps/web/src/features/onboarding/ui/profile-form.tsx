import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ProfileFormData = {
  firstName: string;
  lastName: string;
  subscribeToUpdates: boolean;
};

const defaultProfileForm: ProfileFormData = {
  firstName: "",
  lastName: "",
  subscribeToUpdates: false,
};

type ProfileFormProps = {
  onSubmit: (values: ProfileFormData) => Promise<{ error?: string } | null>;
};

export function ProfileForm({ onSubmit }: ProfileFormProps) {
  const form = useForm({
    defaultValues: defaultProfileForm,
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
            <div className="text-left text-sm text-destructive">
              {errorMap?.onSubmit.toString()}
            </div>
          ) : null
        }
      </form.Subscribe>

      <form.Field
        name="firstName"
        validators={{
          onChange: ({ value }) => {
            if (!value) return "First name is required";
            if (value.length > 50) return "First name must be 50 characters or less";
            return undefined;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground" htmlFor="firstName">
              First Name
            </Label>
            <Input
              id="firstName"
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className={cn(
                "h-12 text-base",
                field.state.meta.errors.length > 0
                  ? "border-destructive focus-visible:ring-destructive"
                  : "border-input",
              )}
              placeholder="John"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-left text-sm text-destructive">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="lastName"
        validators={{
          onChange: ({ value }) => {
            if (!value) return "Last name is required";
            if (value.length > 50) return "Last name must be 50 characters or less";
            return undefined;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground" htmlFor="lastName">
              Last Name
            </Label>
            <Input
              id="lastName"
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className={cn(
                "h-12 text-base",
                field.state.meta.errors.length > 0
                  ? "border-destructive focus-visible:ring-destructive"
                  : "border-input",
              )}
              placeholder="Doe"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-left text-sm text-destructive">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="subscribeToUpdates">
        {(field) => (
          <Label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-left has-[input:checked]:border-primary has-[input:checked]:bg-primary/10 hover:bg-accent/50">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="peer sr-only"
            />
            <Checkbox
              checked={field.state.value}
              className="data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              aria-hidden="true"
            />
            <div className="grid gap-1.5 font-normal">
              <p className="text-sm font-medium leading-none">Email updates</p>
              <p className="text-sm text-muted-foreground">
                Get occasional tips and updates to help you fundraise more effectively.
              </p>
            </div>
          </Label>
        )}
      </form.Field>

      <div className="space-y-4">
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button className="w-full" disabled={!canSubmit || isSubmitting} type="submit">
              {isSubmitting ? "Signing up..." : "Sign up"}
            </Button>
          )}
        </form.Subscribe>

        <div className="text-left text-xs leading-relaxed text-muted-foreground">
          By clicking the Sign Up button below, you agree to the{" "}
          <a className="underline hover:text-foreground" href="/terms">
            Terms of Service
          </a>{" "}
          and acknowledge the{" "}
          <a className="underline hover:text-foreground" href="/privacy">
            Privacy Notice
          </a>
          .
        </div>
      </div>
    </form>
  );
}
