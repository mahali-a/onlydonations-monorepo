import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { updateUserAvatarOnServer } from "../server";
import { avatarSchema } from "../user-account-schemas";

type AvatarFormProps = {
  currentAvatar?: string;
  userName?: string;
};

export function AvatarForm({ currentAvatar, userName = "User" }: AvatarFormProps) {
  const router = useRouter();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatar || null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm({
    defaultValues: {
      avatar: null as File | null,
    },
    validators: {
      onChange: avatarSchema,
      onSubmitAsync: async ({ value }) => {
        if (!value.avatar) {
          return {
            form: "Please select an image",
          };
        }

        const formData = new FormData();
        formData.append("avatar", value.avatar);

        const result = await updateUserAvatarOnServer({ data: formData });

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

  const handleAvatarChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, handleChange: (file: File | null) => void) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAvatarPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);

      handleChange(file);
    },
    [],
  );

  const handleReset = useCallback(
    (handleChange: (file: File | null) => void) => {
      setAvatarPreview(currentAvatar || null);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
      handleChange(null);
    },
    [currentAvatar],
  );

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
            <h2 className="text-xl font-semibold">Your avatar</h2>
            <p className="text-sm text-muted-foreground">
              This image represents you across your account.
            </p>
          </div>
          <form.Field name="avatar">
            {(field) => (
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      alt={userName}
                      className="h-24 w-24 rounded-full border border-border object-cover"
                      src={avatarPreview}
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-border text-sm text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <input
                    accept="image/png,image/jpeg"
                    className="hidden"
                    name="avatar"
                    onChange={(e) => handleAvatarChange(e, field.handleChange)}
                    ref={avatarInputRef}
                    type="file"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      onClick={() => avatarInputRef.current?.click()}
                      type="button"
                      variant="outline"
                    >
                      Choose image
                    </Button>
                    {field.state.value && (
                      <Button
                        onClick={() => handleReset(field.handleChange)}
                        type="button"
                        variant="ghost"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Square image recommended. Accepted: .png, .jpg. Max: 2MB.
                  </p>
                </div>
              </div>
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
          <p>Preview updates here before making them live.</p>
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
