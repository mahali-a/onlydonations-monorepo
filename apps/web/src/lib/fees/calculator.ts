import { FEE_CONFIG } from "./config";

type FeeHandlingType = "DONOR_ASK_COVER" | "DONOR_REQUIRE_COVER" | "CAMPAIGN_ABSORB";

type FeeCalculation = {
  donationAmount: number;
  platformFee: number;
  paymentFee: number;
  totalFees: number;
  donorPays: number;
  campaignReceives: number;
};

export function calculateFees(
  donationAmount: number,
  feeHandling: FeeHandlingType,
  coverFees: boolean = false,
): FeeCalculation {
  const platformFee = Math.round(donationAmount * FEE_CONFIG.platform.percentage * 100) / 100;
  const paymentFee = Math.round(donationAmount * FEE_CONFIG.payment.percentage * 100) / 100;

  const totalFees = platformFee + paymentFee;

  let donorPays: number;
  let campaignReceives: number;

  switch (feeHandling) {
    case "DONOR_ASK_COVER":
      if (coverFees) {
        donorPays = donationAmount + totalFees;
        campaignReceives = donationAmount;
      } else {
        donorPays = donationAmount;
        campaignReceives = donationAmount - totalFees;
      }
      break;

    case "DONOR_REQUIRE_COVER":
      donorPays = donationAmount + totalFees;
      campaignReceives = donationAmount;
      break;

    case "CAMPAIGN_ABSORB":
      donorPays = donationAmount;
      campaignReceives = donationAmount - totalFees;
      break;

    default:
      throw new Error(`Invalid fee handling type: ${feeHandling}`);
  }

  return {
    donationAmount,
    platformFee,
    paymentFee,
    totalFees,
    donorPays: Math.round(donorPays * 100) / 100,
    campaignReceives: Math.round(campaignReceives * 100) / 100,
  };
}

export function formatCurrency(amount: number, currency: string = "GHS"): string {
  const symbols: Record<string, string> = {
    GHS: "₵",
    USD: "$",
    EUR: "€",
    GBP: "£",
    NGN: "₦",
  };

  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}
