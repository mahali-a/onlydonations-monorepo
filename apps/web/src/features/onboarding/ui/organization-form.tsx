import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface OrganizationFormData {
  organizationName: string;
}

const defaultOrganizationForm: OrganizationFormData = {
  organizationName: "",
};

interface OrganizationFormProps {
  onSubmit: (values: OrganizationFormData) => Promise<{ error?: string } | null>;
  defaultName?: string;
}

export function OrganizationForm({ onSubmit, defaultName }: OrganizationFormProps) {
  const form = useForm({
    defaultValues: {
      ...defaultOrganizationForm,
      organizationName: defaultName || "",
    },
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
        name="organizationName"
        validators={{
          onChange: ({ value }) => {
            if (!value) return "Organization name is required";
            if (value.length > 100) return "Organization name must be 100 characters or less";
            return undefined;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground" htmlFor="organizationName">
              Organization Name
            </Label>
            <Input
              id="organizationName"
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
              placeholder="My Organization"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-left text-sm text-destructive">{field.state.meta.errors[0]}</p>
            )}
            <p className="text-left text-xs text-muted-foreground">
              This will be the name of your workspace
            </p>
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Organization"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
