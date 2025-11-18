import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Upload } from "lucide-react";
import { Field, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import type { AnyFieldApi } from "@tanstack/react-form";

const MAX_FILE_SIZE = 1 * 1024 * 1024;

export function SeoSettings({
  titleField,
  descriptionField,
  fileField,
  keyField,
  deleteField,
  isDeleted,
  seoImage,
}: {
  titleField: AnyFieldApi;
  descriptionField: AnyFieldApi;
  fileField: AnyFieldApi;
  keyField: AnyFieldApi;
  deleteField: AnyFieldApi;
  isDeleted: boolean;
  seoImage: string | null;
}) {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(seoImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (seoImage && !fileField.state.value) {
      setImagePreviewUrl(seoImage);
    }
  }, [seoImage, fileField.state.value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 1MB");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    fileField.handleChange(file);
    deleteField.handleChange(false);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    setImagePreviewUrl(null);
    fileField.handleChange(null);
    keyField.handleChange("");
    deleteField.handleChange(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const hasNewFile = fileField.state.value;
  const displayUrl = isDeleted ? null : hasNewFile ? imagePreviewUrl : seoImage || imagePreviewUrl;
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full md:col-span-4">
        <div className="text-lg font-medium">SEO settings</div>
        <p className="text-sm text-foreground">
          Manage your campaign's advanced SEO sharing settings.{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://help.yoursite.com/seo-guide"
            className="text-primary hover:underline"
          >
            Read the guide
          </a>
          .
        </p>
      </div>
      <div className="col-span-full md:col-span-7 md:col-start-6 space-y-4">
        <Field>
          <Label htmlFor={titleField.name}>SEO title</Label>
          <p className="text-muted-foreground text-sm">
            This is the title used on Google and when sharing on social media.
          </p>
          <Input
            id={titleField.name}
            name={titleField.name}
            type="text"
            value={titleField.state.value || ""}
            onChange={(e) => titleField.handleChange(e.target.value)}
            onBlur={titleField.handleBlur}
            placeholder="Women Empowerment 2025"
            maxLength={60}
            aria-invalid={titleField.state.meta.errors.length > 0}
          />
          <FieldError errors={titleField.state.meta.errors} />
        </Field>

        <Field>
          <Label htmlFor={descriptionField.name}>SEO description</Label>
          <p className="text-muted-foreground text-sm">
            This is the description used on Google and when sharing on social media.
          </p>
          <Textarea
            id={descriptionField.name}
            name={descriptionField.name}
            value={descriptionField.state.value || ""}
            onChange={(e) => descriptionField.handleChange(e.target.value)}
            onBlur={descriptionField.handleBlur}
            placeholder="Optional"
            maxLength={160}
            rows={3}
            aria-invalid={descriptionField.state.meta.errors.length > 0}
          />
          <FieldError errors={descriptionField.state.meta.errors} />
        </Field>

        <Field>
          <Label htmlFor={fileField.name}>SEO image</Label>
          <p className="text-muted-foreground text-sm">
            This is the image used when sharing on social media. If not set, the image will default
            to your account's cover photo.
          </p>
          <div className="space-y-2">
            <div className="relative">
              <div
                role="button"
                tabIndex={0}
                className="border-2 border-dashed rounded-md overflow-hidden cursor-pointer hover:border-muted-foreground transition-colors"
                onClick={triggerFileInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    triggerFileInput();
                  }
                }}
              >
                {!displayUrl ? (
                  <div className="h-96 w-full flex flex-col items-center justify-center text-muted-foreground">
                    <Upload className="h-6 w-6 mb-2" />
                    <p className="text-sm">Drag and drop or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Accepts image/* less than 1MB.
                    </p>
                  </div>
                ) : (
                  <div className="h-96 w-full relative">
                    <img
                      alt="SEO preview"
                      className="h-full w-full object-cover"
                      src={displayUrl}
                    />
                  </div>
                )}
              </div>

              {displayUrl && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageRemove();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <input
              ref={fileInputRef}
              id={fileField.name}
              name="seoImage"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="sr-only"
              onChange={handleFileChange}
            />

            <FieldError errors={fileField.state.meta.errors} />
            <FieldError errors={keyField.state.meta.errors} />
          </div>
        </Field>
      </div>
    </div>
  );
}
