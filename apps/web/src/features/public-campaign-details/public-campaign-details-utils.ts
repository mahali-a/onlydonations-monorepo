import { formatCurrency } from "@/lib/money";
import type { PublicCampaign } from "./public-campaign-details-models";

export function calculateProgress(raised: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((raised / target) * 100));
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
    progress: calculateProgress(campaign.totalRaised, campaign.amount),
    daysRemaining: calculateDaysRemaining(campaign.endDate),
    formattedRaised: formatCurrency(campaign.totalRaised, campaign.currency, {
      isMinorUnits: true,
    }),
    formattedTarget: formatCurrency(campaign.amount, campaign.currency, { isMinorUnits: true }),
  };
}
