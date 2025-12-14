import { Flag, Heart, Share2, ShieldCheck, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Money } from "@/lib/money";
import { sanitizeHtml } from "@/lib/sanitize-html";
import type { CampaignDetailData } from "../public-campaign-details-models";
import { formatCampaignForPublic } from "../public-campaign-details-utils";
import { DonationItem } from "./donation-item";
import { SimilarFundraisers } from "./similar-fundraisers";
import { TrustBanner } from "./trust-banner";
import { WordsOfSupport } from "./words-of-support";

type CampaignDetailContentProps = {
  data: CampaignDetailData;
  showPreviewBanner?: boolean;
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

import { Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const DonationsModal = lazy(() =>
  import("./donations-modal").then((m) => ({ default: m.DonationsModal })),
);

export function CampaignDetailContent({
  data,
  showPreviewBanner = false,
  isDonateEnabled = false,
}: CampaignDetailContentProps) {
  const { campaign, donations } = data;
  const formattedCampaign = formatCampaignForPublic(campaign);

  const raisedAmount = formatAmount(campaign.totalRaised, campaign.currency);
  const goalAmount = formatAmount(campaign.amount, campaign.currency);
  const donationCount = campaign.donationCount.toString();
  const organizer = campaign.beneficiaryName;
  const progress = formattedCampaign.progress;
  const [isLiked, setIsLiked] = useState(false);
  const [isDonationsModalOpen, setIsDonationsModalOpen] = useState(false);
  const hasDonations = campaign.donationCount > 0;

  return (
    <>
      {showPreviewBanner && (
        <div className="sticky top-0 z-50 w-full border-b border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-4 py-3 text-center">
          <p className="font-medium text-amber-900 dark:text-amber-100 text-sm">
            Preview Mode - This is how your campaign will appear to donors
          </p>
        </div>
      )}

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
              <div className="overflow-hidden rounded-xl bg-muted min-h-[400px] max-h-[600px] flex items-center justify-center">
                <img
                  src={formattedCampaign.coverImage ?? ""}
                  alt={campaign.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3C/svg%3E';
                    e.currentTarget.style.opacity = "0";
                  }}
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
                  data-track="campaign_reacted"
                  data-campaign-id={campaign.id}
                  data-campaign-slug={campaign.slug}
                  data-liked={!isLiked}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                  <span>React</span>
                </Button>
              </div>

              {!hasDonations && (
                <div className="rounded-xl bg-secondary text-secondary-foreground p-6">
                  <h3 className="mb-2 text-xl font-bold">Give GHS 50- and be a founding donor</h3>
                  <p className="mb-6 opacity-90">
                    Your donation starts {organizer}'s journey to success by inspiring others to
                    help.
                  </p>
                  <Button
                    className="rounded-full bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90"
                    disabled={!isDonateEnabled}
                    asChild
                    data-track="first_donor_cta_clicked"
                    data-campaign-id={campaign.id}
                    data-campaign-slug={campaign.slug}
                  >
                    <Link
                      to="/f/$slug/donate"
                      params={{
                        slug: campaign.slug,
                      }}
                    >
                      Donate
                    </Link>
                  </Button>
                </div>
              )}

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

              <WordsOfSupport campaignId={campaign.id} />

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
                        className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground py-5 font-semibold"
                        onClick={() => handleShare()}
                        data-track="campaign_shared"
                        data-campaign-id={campaign.id}
                        data-campaign-slug={campaign.slug}
                        data-source="campaign_sidebar_no_donations"
                      >
                        Share
                      </Button>
                      <Button
                        className="w-full rounded-full bg-primary/20 hover:bg-primary/30 text-primary py-5 font-semibold"
                        disabled={!isDonateEnabled}
                        asChild
                        data-track="donate_button_clicked"
                        data-campaign-id={campaign.id}
                        data-campaign-slug={campaign.slug}
                        data-source="campaign_sidebar_no_donations"
                      >
                        <Link
                          to="/f/$slug/donate"
                          params={{
                            slug: campaign.slug,
                          }}
                        >
                          Donate now
                        </Link>
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
                        className="w-full rounded-xl py-5 font-semibold"
                        disabled={!isDonateEnabled}
                        asChild
                        data-track="donate_button_clicked"
                        data-campaign-id={campaign.id}
                        data-campaign-slug={campaign.slug}
                        data-source="campaign_sidebar"
                      >
                        <Link
                          to="/f/$slug/donate"
                          params={{
                            slug: campaign.slug,
                          }}
                        >
                          Donate now
                        </Link>
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
                        <Button
                          variant="ghost"
                          className="mt-4 w-full font-semibold"
                          onClick={() => setIsDonationsModalOpen(true)}
                          data-track="donations_modal_opened"
                          data-campaign-id={campaign.id}
                          data-campaign-slug={campaign.slug}
                          data-total-donations={campaign.donationCount}
                        >
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

        <SimilarFundraisers categoryId={campaign.category.id} excludeCampaignId={campaign.id} />

        {isDonationsModalOpen && (
          <Suspense fallback={null}>
            <DonationsModal
              isOpen={isDonationsModalOpen}
              onClose={() => setIsDonationsModalOpen(false)}
              campaignId={campaign.id}
              totalDonations={campaign.donationCount}
              onDonate={() => {
                // Handle donate click - maybe scroll to top or open donate modal if separate
                setIsDonationsModalOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </Suspense>
        )}

        {/* Mobile Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 lg:hidden">
          <div className="mx-auto flex max-w-[1152px] items-center gap-3">
            <div className="flex-1">
              <div className="text-lg font-bold">{raisedAmount}</div>
              <div className="text-xs text-muted-foreground">
                {hasDonations ? `raised of ${goalAmount} goal` : "Be the first to donate"}
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => handleShare()}
              data-track="campaign_shared"
              data-campaign-id={campaign.id}
              data-campaign-slug={campaign.slug}
              data-source="campaign_mobile_bar"
            >
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Share</span>
            </Button>
            {hasDonations && (
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setIsDonationsModalOpen(true)}
              >
                <Heart className="h-5 w-5" />
                <span className="sr-only">View donations</span>
              </Button>
            )}
            <Button
              className="h-10 rounded-full px-5 text-sm font-medium"
              disabled={!isDonateEnabled}
              asChild
              data-track="donate_button_clicked"
              data-campaign-id={campaign.id}
              data-campaign-slug={campaign.slug}
              data-source="campaign_mobile_bar"
            >
              <Link
                to="/f/$slug/donate"
                params={{
                  slug: campaign.slug,
                }}
              >
                Donate
              </Link>
            </Button>
          </div>
        </div>

        {/* Spacer for mobile bottom bar */}
        <div className="h-24 lg:hidden" />
      </div>
    </>
  );
}
