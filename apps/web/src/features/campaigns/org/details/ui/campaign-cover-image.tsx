import { useState, useRef, useEffect } from "react";
import { Trash2, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import type { AnyFieldApi } from "@tanstack/react-form";

export function CampaignCoverImage({
  fileField,
  keyField,
  coverImage,
}: {
  fileField: AnyFieldApi;
  keyField: AnyFieldApi;
  coverImage?: string;
}) {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | undefined>(coverImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (coverImage && !fileField.state.value) {
      setImagePreviewUrl(coverImage);
    }
  }, [coverImage, fileField.state.value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    fileField.handleChange(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setImagePreviewUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setImagePreviewUrl(undefined);
    fileField.handleChange(null);
    keyField.handleChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = fileField.state.value ? imagePreviewUrl : coverImage || imagePreviewUrl;

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-full md:col-span-4">
        <div className="text-lg font-medium">Cover photo</div>
        <p className="text-sm text-foreground">Add a cover photo to your campaign.</p>
      </div>

      <section className="col-span-full md:col-span-7 md:col-start-6 space-y-4">
        <Field>
          <Label htmlFor={fileField.name}>Cover image</Label>

          <div className="relative">
            <div
              role="button"
              tabIndex={0}
              className="border-2 border-dashed rounded-md overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
              onClick={triggerFileInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  triggerFileInput();
                }
              }}
            >
              {!displayUrl ? (
                <div className="h-48 w-full flex flex-col items-center justify-center text-muted-foreground">
                  <Upload className="h-8 w-8 mb-2" />
                  <p className="text-sm">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB</p>
                </div>
              ) : (
                <div className="h-48 w-full relative">
                  <img
                    alt="Campaign cover preview"
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
            name="coverImage"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="sr-only"
            onChange={handleFileChange}
          />

          <FieldError errors={fileField.state.meta.errors} />
          <FieldError errors={keyField.state.meta.errors} />
        </Field>
      </section>
    </div>
  );
}
