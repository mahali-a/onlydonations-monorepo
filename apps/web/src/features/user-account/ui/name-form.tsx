import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateUserNameOnServer } from "../server";
import { nameSchema } from "../user-account-schemas";

type NameFormProps = {
  defaultName?: string;
};

export function NameForm({ defaultName = "" }: NameFormProps) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: defaultName,
    },
    validators: {
      onChange: nameSchema,
      onSubmitAsync: async ({ value }) => {
        const formData = new FormData();
        formData.append("name", value.name);

        const result = await updateUserNameOnServer({ data: formData });

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
            <h2 className="text-xl font-semibold">Your name</h2>
            <p className="text-sm text-muted-foreground">
              This is your display name across the platform.
            </p>
          </div>

          <form.Field name="name">
            {(field) => (
              <Field className="max-w-md">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Steve Jobs"
                  maxLength={100}
                  aria-label="Your name"
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
                <form.Subscribe selector={(state) => [state.errorMap]}>
                  {([errorMap]) =>
                    errorMap?.onSubmit?.form ? (
                      <p className="text-sm text-destructive">{errorMap.onSubmit.form}</p>
                    ) : null
                  }
                </form.Subscribe>
              </Field>
            )}
          </form.Field>
        </div>
        <div className="flex flex-col gap-3 rounded-b-xl border-t border-border bg-muted/40 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>Max 100 characters.</p>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting, state.isDirty]}
          >
            {([canSubmit, isSubmitting, isDirty]) => (
              <Button disabled={!canSubmit || isSubmitting || !isDirty} type="submit">
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  );
}
