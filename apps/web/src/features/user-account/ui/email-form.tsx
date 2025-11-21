import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateUserEmailOnServer } from "../server";
import { emailSchema } from "../user-account-schemas";

type EmailFormProps = {
  defaultEmail?: string;
};

export function EmailForm({ defaultEmail = "" }: EmailFormProps) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: defaultEmail,
    },
    validators: {
      onChange: emailSchema,
      onSubmitAsync: async ({ value }) => {
        const formData = new FormData();
        formData.append("email", value.email);

        const result = await updateUserEmailOnServer({ data: formData });

        if (result?.error) {
          return {
            form: result.error,
          };
        }

        router.invalidate();
        return null;
      },
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="rounded-xl border border-border bg-background shadow-sm">
        <div className="flex flex-col space-y-4 p-5 sm:p-10">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Your email</h2>
            <p className="text-sm text-muted-foreground">
              This address is used to log in and receive product notifications.
            </p>
          </div>

          <form.Field name="email">
            {(field) => (
              <Field className="max-w-md">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="user@example.com"
                  autoComplete="email"
                  aria-label="Your email"
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => [state.errorMap]}>
            {([errorMap]) =>
              errorMap?.onSubmit?.form ? (
                <p className="text-sm text-destructive">{errorMap.onSubmit.form}</p>
              ) : null
            }
          </form.Subscribe>
        </div>
        <div className="flex flex-col gap-3 rounded-b-xl border-t border-border bg-muted/40 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>A verification email will be sent to approve this change.</p>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting, state.isDirty]}
          >
            {([canSubmit, isSubmitting, isDirty]) => (
              <Button disabled={!canSubmit || isSubmitting || !isDirty} type="submit">
                {isSubmitting ? "Sending email..." : "Save changes"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  );
}
