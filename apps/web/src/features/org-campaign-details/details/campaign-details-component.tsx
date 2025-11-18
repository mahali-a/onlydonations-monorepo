import { useState, useRef, useEffect, Suspense } from "react";
import { useParams } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Trash2, Upload } from "lucide-react";
import { campaignDetailQueryOptions } from "@/features/org-campaigns/server";
import { updateCampaignDetailsOnServer } from "./campaign-details-actions";
import { CampaignMainDetails } from "./ui/campaign-main-details";
import { CampaignStory } from "./ui/campaign-story";

const EDITABLE_STATUSES = ["DRAFT", "ACTIVE", "REJECTED"] as const;
const MAX_FILE_SIZE = 1 * 1024 * 1024;

function CampaignDetailsLoading() {
  return (
    <div className="rounded-xl p-6 border border-solid border-border bg-background space-y-8">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="col-span-7 col-start-6 space-y-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      </div>
      <Separator />
      <Skeleton className="h-48" />
      <Separator />
      <Skeleton className="h-64" />
    </div>
  );
}

function CampaignDetailsContent() {
  const params = useParams({ from: "/o/$orgId/campaigns/$campaignId" });
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery(
    campaignDetailQueryOptions(params.orgId, params.campaignId)
  );

  const { campaign, categories } = data;

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
      deleteCoverImage: false,
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
        if (value.deleteCoverImage) {
          formData.append("deleteCoverImage", "true");
        }

        const result = await updateCampaignDetailsOnServer({
          data: formData,
        });

        if (!result.success) {
          return {
            form: result.error || "Failed to update campaign",
          };
        }

        toast.success("Campaign details updated successfully");
        queryClient.invalidateQueries({
          queryKey: ["campaign-detail", params.orgId, params.campaignId],
        });
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
              {(keyField) => (
                <form.Field name="deleteCoverImage">
                  {(deleteField) => (
                    <form.Subscribe selector={(state) => [state.values.deleteCoverImage]}>
                      {([isDeleted]) => {
                        const displayUrl = isDeleted
                          ? undefined
                          : fileField.state.value
                            ? imagePreviewUrl
                            : campaign.coverImage || imagePreviewUrl;

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
                          setImagePreviewUrl(undefined);
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
                              <div className="h-96 w-full flex flex-col items-center justify-center text-muted-foreground">
                                <Upload className="h-8 w-8 mb-2" />
                                <p className="text-sm">Click to upload or drag and drop</p>
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG, WEBP up to 1MB
                                </p>
                              </div>
                            ) : (
                              <div className="h-96 w-full relative">
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
                    </form.Subscribe>
                  )}
                </form.Field>
              )}
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

export function CampaignDetails() {
  return (
    <Suspense fallback={<CampaignDetailsLoading />}>
      <CampaignDetailsContent />
    </Suspense>
  );
}
