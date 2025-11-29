import { z } from "zod";

export const withdrawalAccountsActionSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("create_withdrawal_account"),
    accountType: z.enum(["mobile_money", "ghipss"]),
    bankCode: z.string().optional(),
    accountNumber: z.string().min(1, "Account number is required"),
    accountName: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    mobileMoneyProvider: z.string().optional(),
  }),
  z.object({
    intent: z.literal("delete_withdrawal_account"),
    accountId: z.string().min(1, "Account ID is required"),
  }),
]);
