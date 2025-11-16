import type { PublicCampaign } from "./types";

export function calculateProgress(raised: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((raised / target) * 100));
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function retrieveImageUrl(fileKey: string | null): string {
  if (!fileKey) {
    return "/placeholder-campaign.jpg";
  }

  if (fileKey.startsWith("http://") || fileKey.startsWith("https://")) {
    return fileKey;
  }

  return `/uploads/${fileKey}`;
}

export function calculateDaysRemaining(endDate: Date | null): number | null {
  if (!endDate) return null;

  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

export function formatCampaignForPublic(campaign: PublicCampaign) {
  return {
    ...campaign,
    coverImageUrl: retrieveImageUrl(campaign.coverImage),
    seoImageUrl: campaign.seoImage ? retrieveImageUrl(campaign.seoImage) : null,
    progress: calculateProgress(campaign.totalRaised, campaign.amount),
    daysRemaining: calculateDaysRemaining(campaign.endDate),
    formattedRaised: formatCurrency(campaign.totalRaised, campaign.currency),
    formattedTarget: formatCurrency(campaign.amount, campaign.currency),
  };
}
