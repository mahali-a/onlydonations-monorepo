import { useRouteContext, useRouter, useParams } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { updateCampaignSharingOnServer } from "../../server";
import { CustomSlug } from "./ui/custom-slug";
import { LiveDisplay } from "./ui/live-display";
import { SeoSettings } from "./ui/seo-settings";
import { campaignSharingSchema } from "./campaign-sharing-schema";
import type { CampaignDetailRouteContext } from "../../campaign-detail-context";

const EDITABLE_STATUSES = ["DRAFT", "ACTIVE", "REJECTED"] as const;

export function CampaignSharing() {
  const context = useRouteContext({
    from: "/o/$orgId/campaigns/$campaignId",
  }) as CampaignDetailRouteContext;
  const { campaign } = context;
  const router = useRouter();

  const params = useParams({ from: "/o/$orgId/campaigns/$campaignId" });

  const isEditable = EDITABLE_STATUSES.includes(
    campaign?.status as (typeof EDITABLE_STATUSES)[number],
  );

  const form = useForm({
    defaultValues: {
      slug: campaign?.slug || "",
      seoTitle: campaign?.seoTitle || "",
      seoDescription: campaign?.seoDescription || "",
      seoImageFile: null as File | null,
      seoImageFileKey: campaign?.seoImage || "",
    },
    validators: {
      onChange: campaignSharingSchema.parse,
      onSubmitAsync: async ({ value }) => {
        if (!campaign) {
          return { form: "Campaign not found" };
        }
        const formData = new FormData();
        formData.append("organizationId", params.orgId);
        formData.append("campaignId", campaign.id);
        formData.append("slug", value.slug);
        if (value.seoTitle) {
          formData.append("seoTitle", value.seoTitle);
        }
        if (value.seoDescription) {
          formData.append("seoDescription", value.seoDescription);
        }
        if (value.seoImageFile) {
          formData.append("seoImage", value.seoImageFile);
        }
        if (value.seoImageFileKey) {
          formData.append("seoImageFileKey", value.seoImageFileKey);
        }

        const result = await updateCampaignSharingOnServer({
          data: formData,
        });

        if (!result.success) {
          return {
            form: result.error || "Failed to update sharing settings",
          };
        }

        router.invalidate();
        return null;
      },
    },
  });

  if (!campaign) {
    return <div>Loading...</div>;
  }

  return (
    <form
      key={campaign.id}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="rounded-xl p-6 border border-solid border-border bg-background overflow-auto space-y-8"
    >
      <fieldset disabled={!isEditable} className="space-y-8">
        <form.Field
          name="slug"
          validators={{
            onChange: campaignSharingSchema.shape.slug,
          }}
        >
          {(field) => (
            <CustomSlug field={field} defaultSlug={campaign.slug} campaignId={campaign.id} />
          )}
        </form.Field>

        <Separator />

        <LiveDisplay campaignId={campaign.id} />

        <Separator />

        <form.Field name="seoTitle">
          {(titleField) => (
            <form.Field name="seoDescription">
              {(descField) => (
                <form.Field name="seoImageFile">
                  {(fileField) => (
                    <form.Field name="seoImageFileKey">
                      {(keyField) => (
                        <SeoSettings
                          titleField={titleField}
                          descriptionField={descField}
                          fileField={fileField}
                          keyField={keyField}
                          seoImage={campaign?.seoImage}
                        />
                      )}
                    </form.Field>
                  )}
                </form.Field>
              )}
            </form.Field>
          )}
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
                {isSubmitting ? "Saving..." : "Save Changes"}
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
