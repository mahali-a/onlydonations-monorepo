export const FEE_CONFIG = {
  // Donations - PSP handles fees automatically, we take nothing
  donation: {
    platformPercentage: 0,
    pspPercentage: 0.0195, // For display/info only
  },

  // Withdrawals - we take 4% + PSP transfer fees
  withdrawal: {
    platformPercentage: 0.04, // 4%
    transferFees: {
      mobileMoney: 100, // GHS 1.00 (pesewas)
      bank: 800, // GHS 8.00 (pesewas)
    },
  },
} as const;

export type AccountType = "mobile_money" | "bank";
