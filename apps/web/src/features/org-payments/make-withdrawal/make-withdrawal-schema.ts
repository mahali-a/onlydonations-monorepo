import { z } from "zod";

export const requestWithdrawalSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  payoutAccountId: z.string().min(1, "Payout account is required"),
  amount: z.number().positive("Amount must be positive").min(1, "Minimum withdrawal is 1 GHS"),
  currency: z.string().default("GHS"),
});
