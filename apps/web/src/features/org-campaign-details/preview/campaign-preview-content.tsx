import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Flag, TrendingUp, Heart, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { CampaignDetailData } from "../../public-campaign-details/public-campaign-details-models";
import { formatCampaignForPublic } from "../../public-campaign-details/public-campaign-details-utils";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { DonationItem } from "../../public-campaign-details/ui/donation-item";
import { TrustBanner } from "../../public-campaign-details/ui/trust-banner";
import { Money } from "@/lib/money";

type CampaignPreviewContentProps = {
  data: CampaignDetailData;
  isDonateEnabled?: boolean;
};

function formatAmount(amount: number, currency: string = "GHS"): string {
  return Money.fromMinor(amount, currency).format();
}

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

export function CampaignPreviewContent({
  data,
  isDonateEnabled = false,
}: CampaignPreviewContentProps) {
  const { campaign, donations } = data;
  const formattedCampaign = formatCampaignForPublic(campaign);

  const raisedAmount = formatAmount(campaign.totalRaised, campaign.currency);
  const goalAmount = formatAmount(campaign.amount, campaign.currency);
  const donationCount = campaign.donationCount.toString();
  const organizer = campaign.beneficiaryName;
  const progress = formattedCampaign.progress;
  const [isLiked, setIsLiked] = useState(false);
  const hasDonations = campaign.donationCount > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-[1152px] px-4 py-8 sm:px-4">
        <div className="mb-6">
          <h1 className="text-[32px] font-bold leading-tight tracking-tight sm:text-[40px]">
            {campaign.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_350px] lg:gap-12">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl bg-muted">
              <img
                src={formattedCampaign.coverImage ?? ""}
                alt={campaign.title}
                className="h-auto w-full object-cover"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground font-bold text-lg">
                {organizer.charAt(0)}
              </div>
              <div className="font-semibold">{organizer}</div>
            </div>

            <Separator />

            <div className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <ShieldCheck className="h-4 w-4" />
              <span>Donation protected</span>
            </div>

            <Separator />

            <div className="prose prose-lg max-w-none">
              <div
                className="space-y-4 text-[16px] leading-relaxed"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized using sanitizeHtml()
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(campaign.description),
                }}
              />
            </div>

            <div className="py-4">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 ${isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground"}`}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                <span>React</span>
              </Button>
            </div>

            <div className="rounded-xl bg-purple-100 p-6 dark:bg-purple-950">
              <h3 className="mb-2 text-xl font-bold text-purple-900 dark:text-purple-100">
                Give GHS 20- and be a founding donor
              </h3>
              <p className="mb-6 text-purple-800 dark:text-purple-200">
                Your donation starts {organizer}'s journey to success by inspiring others to help.
              </p>
              <Button className="rounded-full bg-purple-700 hover:bg-purple-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700">
                Donate
              </Button>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Organizer</h3>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                  {organizer.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{organizer}</div>
                  <div className="text-sm text-muted-foreground">Organizer</div>
                  <div className="text-sm text-muted-foreground">
                    {campaign.country || "Location not specified"}
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 w-full rounded-full font-semibold sm:w-auto"
                  >
                    Contact
                  </Button>
                </div>
              </div>
            </div>

            {/* Words of Support removed for preview */}
            <div className="space-y-4 pt-8 opacity-50">
              <h3 className="text-xl font-bold">Words of support</h3>
              <p className="text-muted-foreground">
                Words of support will appear here once your campaign is live and receiving
                donations.
              </p>
            </div>

            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Flag className="h-4 w-4" />
              <span>Report fundraiser</span>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="relative hidden lg:block">
            <div className="sticky top-4 rounded-xl border bg-card p-6 shadow-lg">
              {!hasDonations ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Be the first to donate</h2>
                      <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary dark:bg-primary/20 dark:text-primary">
                        1ST DONOR
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Inspire others and help {organizer} build momentum.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-bold"
                      onClick={() => handleShare()}
                    >
                      Share
                    </Button>
                    <Button
                      className="w-full rounded-full bg-primary/20 hover:bg-primary/30 text-primary py-6 text-lg font-bold"
                      disabled={!isDonateEnabled}
                    >
                      Donate now
                    </Button>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                    <Heart className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Become the first supporter</div>
                      <div className="text-sm text-muted-foreground">Your donation matters</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold">OnlyDonations protects your donation</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      We guarantee you a full refund for up to a year in the rare case that fraud
                      occurs.{" "}
                      <a href="#" className="underline hover:text-foreground">
                        See our OnlyDonations Giving Guarantee.
                      </a>
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-foreground">{raisedAmount}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      raised of {goalAmount} goal
                    </div>
                    <Progress value={progress} className="mt-3 h-2 w-full" />
                    <div className="mt-3 text-sm font-medium text-foreground">
                      {donationCount} donations
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full rounded-xl py-7 text-lg font-bold"
                      disabled={!isDonateEnabled}
                    >
                      Donate now
                    </Button>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span>{donationCount} people just donated</span>
                    </div>
                    <ul className="mt-4 space-y-4">
                      {donations.slice(0, 4).map((donation) => (
                        <DonationItem key={donation.id} donation={donation} />
                      ))}
                    </ul>
                    {donations.length > 3 && (
                      <Button variant="ghost" className="mt-4 w-full font-semibold">
                        See all
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <TrustBanner />

      {/* Similar Fundraisers removed for preview */}
    </div>
  );
}
