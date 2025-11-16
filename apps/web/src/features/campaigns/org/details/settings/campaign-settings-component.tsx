import { useRouteContext, useRouter, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { updateCampaignSettingsOnServer } from "../../server";
import { GeneralSettings } from "./ui/general-settings";
import { TipsFees } from "./ui/tips-fees";
import { ThankYouMessage } from "./ui/thank-you-message";
import { useForm } from "@tanstack/react-form";
import type { CampaignDetailRouteContext } from "../../campaign-detail-context";

const EDITABLE_STATUSES = ["DRAFT", "ACTIVE", "REJECTED"] as const;

export function CampaignSettings() {
  const context = useRouteContext({
    from: "/o/$orgId/campaigns/$campaignId",
  }) as CampaignDetailRouteContext;
  const campaign = context.campaign;
  const router = useRouter();

  const params = useParams({ from: "/o/$orgId/campaigns/$campaignId" });

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

      router.invalidate();
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
