import { Gift, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CampaignDetailData } from "../types";
import { formatCampaignForPublic } from "../campaign-utils";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { CampaignProgress } from "./campaign-progress";
import { CampaignStats } from "./campaign-stats";
import { DonationList } from "./donation-list";

type CampaignDetailContentProps = {
  data: CampaignDetailData;
  showPreviewBanner?: boolean;
  isDonateEnabled?: boolean;
  showEmptyDonationsMessage?: boolean;
};

function handleShare() {
  const url = window.location.href;
  const title = document.title;

  if (navigator.share) {
    navigator
      .share({
        title,
        url,
      })
      .catch((err) => console.error("Error sharing:", err));
  } else {
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard!");
    });
  }
}

export function CampaignDetailContent({
  data,
  showPreviewBanner = false,
  isDonateEnabled = false,
  showEmptyDonationsMessage = false,
}: CampaignDetailContentProps) {
  const { campaign, donations } = data;
  const formattedCampaign = formatCampaignForPublic(campaign);

  return (
    <>
      {showPreviewBanner && (
        <div className="sticky top-0 z-50 w-full border-b border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-4 py-3 text-center">
          <p className="font-medium text-amber-900 dark:text-amber-100 text-sm">
            Preview Mode - This is how your campaign will appear to donors
          </p>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:mt-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{campaign.title}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Supporting {campaign.beneficiaryName}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-8 lg:gap-8">
          <div className="lg:col-span-5">
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <img
                src={formattedCampaign.coverImageUrl}
                alt={campaign.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-6 lg:col-span-3">
            <CampaignStats
              location={campaign.country}
              supportersCount={campaign.donationCount}
              endDate={campaign.endDate}
            />

            <CampaignProgress
              raised={campaign.totalRaised}
              target={campaign.amount}
              currency={campaign.currency}
              progress={formattedCampaign.progress}
            />

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full"
                disabled={!isDonateEnabled}
                title={
                  !isDonateEnabled && showPreviewBanner
                    ? "Donate button disabled in preview mode"
                    : undefined
                }
              >
                <Gift className="mr-2 h-5 w-5" />
                {isDonateEnabled
                  ? campaign.donateButtonText || "Donate Now"
                  : showPreviewBanner
                    ? "(Disabled in Preview)"
                    : campaign.donateButtonText || "Donate Now"}
              </Button>

              <Button variant="outline" size="lg" className="w-full" onClick={() => handleShare()}>
                <Share2 className="mr-2 h-5 w-5" />
                Share Campaign
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground">
                {campaign.category.name}
              </span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="story" className="mt-8">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="story">Campaign Story</TabsTrigger>
            <TabsTrigger value="donations">Donations ({campaign.donationCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="story" className="mt-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">About this campaign</h2>
              <div
                className="prose prose-gray dark:prose-invert max-w-none"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized using sanitizeHtml()
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(campaign.description) }}
              />
            </div>
          </TabsContent>

          <TabsContent value="donations" className="mt-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Recent Supporters</h2>
              {donations.length > 0 ? (
                <DonationList donations={donations} />
              ) : (
                showEmptyDonationsMessage && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No donations yet. Donations will appear here once your campaign goes live.
                    </p>
                  </div>
                )
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
