import { type AccountType, FEE_CONFIG } from "./config";

// =============================================================================
// DONATION FEES
// =============================================================================

type FeeHandlingType = "DONOR_ASK_COVER" | "DONOR_REQUIRE_COVER" | "CAMPAIGN_ABSORB";

type FeeCalculation = {
  donationAmount: number;
  platformFee: number;
  paymentFee: number;
  totalFees: number;
  donorPays: number;
  campaignReceives: number;
};

/**
 * Calculate donation fees
 * Note: Platform fee is 0, PSP handles their fees automatically
 */
export function calculateFees(
  donationAmount: number,
  feeHandling: FeeHandlingType,
  coverFees: boolean = false,
): FeeCalculation {
  const platformFee =
    Math.round(donationAmount * FEE_CONFIG.donation.platformPercentage * 100) / 100;
  const paymentFee = Math.round(donationAmount * FEE_CONFIG.donation.pspPercentage * 100) / 100;

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

// =============================================================================
// WITHDRAWAL FEES
// =============================================================================

export type WithdrawalFeeBreakdown = {
  requestedAmount: number; // What user wants to receive (in minor units)
  platformFee: number; // Our 4% cut (in minor units)
  transferFee: number; // PSP transfer fee (in minor units)
  totalFees: number; // platformFee + transferFee
  totalDeduction: number; // requestedAmount + totalFees (deducted from balance)
};

/**
 * Calculate withdrawal fees
 * @param amountInMinorUnits - Amount user wants to receive (in pesewas)
 * @param accountType - "mobile_money" or "bank"
 */
export function calculateWithdrawalFees(
  amountInMinorUnits: number,
  accountType: AccountType,
): WithdrawalFeeBreakdown {
  const platformFee = Math.round(amountInMinorUnits * FEE_CONFIG.withdrawal.platformPercentage);
  const transferFee =
    accountType === "mobile_money"
      ? FEE_CONFIG.withdrawal.transferFees.mobileMoney
      : FEE_CONFIG.withdrawal.transferFees.bank;

  const totalFees = platformFee + transferFee;
  const totalDeduction = amountInMinorUnits + totalFees;

  return {
    requestedAmount: amountInMinorUnits,
    platformFee,
    transferFee,
    totalFees,
    totalDeduction,
  };
}

/**
 * Get transfer fee for account type (for display purposes)
 */
export function getTransferFee(accountType: AccountType): number {
  return accountType === "mobile_money"
    ? FEE_CONFIG.withdrawal.transferFees.mobileMoney
    : FEE_CONFIG.withdrawal.transferFees.bank;
}

/**
 * Get platform fee percentage (for display purposes)
 */
export function getPlatformFeePercentage(): number {
  return FEE_CONFIG.withdrawal.platformPercentage;
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
