export const PAYSTACK_GHANA = {
  platform: {
    percentage: 0.01, // 1%
  },
  payment: {
    percentage: 0.0195, // 1.95%
  },
  withdrawal: {
    mobileMoney: 0, // Free
    bank: 0, // Free
  },
} as const;
