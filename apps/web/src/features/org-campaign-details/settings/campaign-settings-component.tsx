import { useForm } from "@tanstack/react-form";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Suspense } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { campaignDetailQueryOptions } from "@/features/org-campaigns/server";
import { updateCampaignSettingsOnServer } from "./campaign-settings-actions";
import { GeneralSettings } from "./ui/general-settings";
import { ThankYouMessage } from "./ui/thank-you-message";
import { TipsFees } from "./ui/tips-fees";

const EDITABLE_STATUSES = ["DRAFT", "ACTIVE", "REJECTED"] as const;

function CampaignSettingsLoading() {
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
        </div>
      </div>
      <Separator />
      <Skeleton className="h-32" />
      <Separator />
      <Skeleton className="h-48" />
    </div>
  );
}

function CampaignSettingsContent() {
  const params = useParams({ from: "/o/$orgId/campaigns/$campaignId" });
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery(campaignDetailQueryOptions(params.orgId, params.campaignId));

  const { campaign } = data;

  const isEditable = campaign
    ? EDITABLE_STATUSES.includes(campaign.status as (typeof EDITABLE_STATUSES)[number])
    : false;

  const form = useForm({
    defaultValues: {
      publishCampaign: !!campaign?.publishedAt,
      endDate: campaign?.endDate || null,
      donateButtonText: campaign?.donateButtonText || "",
      feeHandling: (campaign?.feeHandling || "DONOR_ASK_COVER") as
        | "DONOR_ASK_COVER"
        | "DONOR_REQUIRE_COVER"
        | "CAMPAIGN_ABSORB",
      thankYouMessage:
        campaign?.thankYouMessage ||
        "<p>Thank you for your generous donation! Your support means the world to us.</p>",
    },
    onSubmit: async ({ value }) => {
      const result = await updateCampaignSettingsOnServer({
        data: {
          organizationId: params.orgId,
          campaignId: campaign.id,
          publishCampaign: value.publishCampaign,
          endDate: value.endDate ? new Date(value.endDate) : null,
          donateButtonText: value.donateButtonText,
          feeHandling: value.feeHandling,
          thankYouMessage: value.thankYouMessage,
        },
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to update settings");
      }

      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["campaign-detail", params.orgId, params.campaignId],
      });
    },
  });

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
        <form.Field name="publishCampaign">
          {(publishCampaignField) => (
            <form.Field name="endDate">
              {(endDateField) => (
                <form.Field name="donateButtonText">
                  {(donateButtonTextField) => (
                    <GeneralSettings
                      publishCampaignField={publishCampaignField}
                      endDateField={endDateField}
                      donateButtonTextField={donateButtonTextField}
                      defaultEndDate={campaign?.endDate ? new Date(campaign.endDate) : null}
                      isPublished={!!campaign?.publishedAt}
                      isEditable={isEditable}
                    />
                  )}
                </form.Field>
              )}
            </form.Field>
          )}
        </form.Field>

        <Separator />

        <form.Field name="feeHandling">
          {(feeHandlingField) => (
            <TipsFees
              feeHandlingField={feeHandlingField}
              hasDonations={false}
              isEditable={isEditable}
            />
          )}
        </form.Field>

        <Separator />

        <form.Field name="thankYouMessage">
          {(thankYouMessageField) => <ThankYouMessage field={thankYouMessageField} />}
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
                {isSubmitting ? "Saving..." : "Save Settings"}
              </Button>
            )}
          </form.Subscribe>
        </div>

        <form.Subscribe selector={(state) => [state.errors]}>
          {([errors]) => {
            const formError = errors && errors.length > 0 ? errors[0] : null;
            return formError ? (
              <p className="text-sm text-destructive text-right">
                {typeof formError === "string" ? formError : "An error occurred"}
              </p>
            ) : null;
          }}
        </form.Subscribe>
      </fieldset>
    </form>
  );
}

export function CampaignSettings() {
  return (
    <Suspense fallback={<CampaignSettingsLoading />}>
      <CampaignSettingsContent />
    </Suspense>
  );
}
