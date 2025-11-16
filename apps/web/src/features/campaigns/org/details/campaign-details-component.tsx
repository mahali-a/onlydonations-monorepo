import { useState, useRef, useEffect } from "react";
import { useRouter, useRouteContext, useParams } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Field, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Trash2, Upload } from "lucide-react";
import { updateCampaignDetailsOnServer } from "../server";
import { CampaignMainDetails } from "./ui/campaign-main-details";
import { CampaignStory } from "./ui/campaign-story";
import type { CampaignDetailRouteContext } from "../campaign-detail-context";

const EDITABLE_STATUSES = ["DRAFT", "ACTIVE", "REJECTED"] as const;

export function CampaignDetails() {
  const context = useRouteContext({
    from: "/o/$orgId/campaigns/$campaignId",
  }) as CampaignDetailRouteContext;
  const { campaign, categories } = context;
  const router = useRouter();

  const params = useParams({ from: "/o/$orgId/campaigns/$campaignId" });

  const isEditable = EDITABLE_STATUSES.includes(
    campaign?.status as (typeof EDITABLE_STATUSES)[number],
  );

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | undefined>(campaign?.coverImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: {
      title: campaign?.title || "",
      beneficiaryName: campaign?.beneficiaryName || "",
      categoryId: campaign?.categoryId || "",
      amount: campaign?.amount ? campaign.amount / 100 : 0,
      description: campaign?.description || "",
      coverImageFile: null as File | null,
      coverImageFileKey: campaign?.coverImage || "",
    },
    validators: {
      onSubmitAsync: async ({ value }) => {
        if (!campaign) {
          return { form: "Campaign not found" };
        }
        const formData = new FormData();
        formData.append("organizationId", params.orgId);
        formData.append("campaignId", campaign.id);
        formData.append("title", value.title);
        formData.append("beneficiaryName", value.beneficiaryName);
        formData.append("categoryId", value.categoryId);
        formData.append("amount", String(Math.round(value.amount * 100)));
        if (value.description) {
          formData.append("description", value.description);
        }
        if (value.coverImageFile) {
          formData.append("coverImage", value.coverImageFile);
        }
        if (value.coverImageFileKey) {
          formData.append("coverImageFileKey", value.coverImageFileKey);
        }

        const result = await updateCampaignDetailsOnServer({
          data: formData,
        });

        if (!result.success) {
          return {
            form: result.error || "Failed to update campaign",
          };
        }

        router.invalidate();
        return null;
      },
    },
  });

  useEffect(() => {
    if (campaign?.coverImage && !form.state.values.coverImageFile) {
      setImagePreviewUrl(campaign.coverImage);
    }
  }, [campaign?.coverImage, form.state.values.coverImageFile]);

  if (!campaign) {
    return <div>Loading...</div>;
  }

  return (
    <form
      key={`${campaign.id}-${campaign.updatedAt}`}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="rounded-xl p-6 border border-solid border-border bg-background overflow-auto space-y-8"
    >
      <fieldset disabled={!isEditable} className="space-y-8">
        <form.Field name="title">
          {(titleField) => (
            <form.Field name="beneficiaryName">
              {(beneficiaryField) => (
                <form.Field name="categoryId">
                  {(categoryField) => (
                    <form.Field name="amount">
                      {(amountField) => (
                        <CampaignMainDetails
                          categories={categories}
                          titleField={titleField}
                          beneficiaryField={beneficiaryField}
                          categoryField={categoryField}
                          amountField={amountField}
                        />
                      )}
                    </form.Field>
                  )}
                </form.Field>
              )}
            </form.Field>
          )}
        </form.Field>

        <Separator />

        <form.Field name="coverImageFile">
          {(fileField) => (
            <form.Field name="coverImageFileKey">
              {(keyField) => {
                const displayUrl = fileField.state.value
                  ? imagePreviewUrl
                  : campaign.coverImage || imagePreviewUrl;

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
                              <div className="h-48 w-full flex flex-col items-center justify-center text-muted-foreground">
                                <Upload className="h-8 w-8 mb-2" />
                                <p className="text-sm">Click to upload or drag and drop</p>
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG, WEBP up to 10MB
                                </p>
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
              }}
            </form.Field>
          )}
        </form.Field>

        <Separator />

        <form.Field name="description">
          {(field) => <CampaignStory field={field} editable={isEditable} />}
        </form.Field>

        <div className="flex justify-end pt-4">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting, state.isDirty]}
          >
            {([canSubmit, isSubmitting, isDirty]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || !isDirty || !isEditable}
              >
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            )}
          </form.Subscribe>
        </div>

        <form.Subscribe selector={(state) => [state.errorMap]}>
          {([errorMap]) =>
            errorMap?.onSubmit?.form ? (
              <p className="text-sm text-destructive text-right">{errorMap.onSubmit.form}</p>
            ) : null
          }
        </form.Subscribe>
      </fieldset>
    </form>
  );
}
