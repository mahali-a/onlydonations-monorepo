import { z } from "zod";

export const requestWithdrawalSchema = z.object({
  payoutAccountId: z.string().min(1, "Payout account is required"),
  amount: z.number().positive("Amount must be positive").min(1, "Minimum withdrawal is 1 GHS"),
  currency: z.string().default("GHS"),
});

export type RequestWithdrawalInput = z.infer<typeof requestWithdrawalSchema>;
