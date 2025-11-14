import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/core/middleware/auth";
import { logger } from "@/lib/logger";
import { paystackService } from "@/lib/paystack";
import { withdrawalAccountModel } from "../models/withdrawal-account-model";

const withdrawalAccountsLogger = logger.child("withdrawal-accounts-actions");

export const createWithdrawalAccount = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accountType: z.enum(["mobile_money", "ghipss"]),
      accountNumber: z.string(),
      bankCode: z.string().optional(),
      name: z.string(),
      mobileMoneyProvider: z.string().optional(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    // @ts-expect-error - Type not inferred
    const organizationId = context.session?.session?.activeOrganizationId;
    if (!organizationId) {
      throw new Error("No active organization");
    }

    const { accountType, accountNumber, bankCode, name, mobileMoneyProvider } = data;

    withdrawalAccountsLogger.info("create_withdrawal_account.start", {
      organizationId,
      accountType,
      accountNumber,
    });

    try {
      const paystack = paystackService(env);
      let recipientCode: string;
      let resolvedAccountName: string | undefined;

      if (accountType === "mobile_money") {
        const recipientResult = await paystack.createTransferRecipient({
          type: "mobile_money",
          name,
          account_number: accountNumber,
          bank_code: mobileMoneyProvider || bankCode || "",
          currency: "GHS",
        });
        recipientCode = recipientResult.data.recipient_code;
      } else {
        if (!bankCode) {
          return {
            success: false,
            error: "Bank is required for GHIPSS accounts",
          };
        }

        const resolveResult = await paystack.resolveAccount({
          account_number: accountNumber,
          bank_code: bankCode,
        });

        if (!resolveResult.status || !resolveResult.data) {
          return {
            success: false,
            error: "Unable to verify account details. Please check your account number.",
          };
        }

        resolvedAccountName = resolveResult.data.account_name;

        const recipientResult = await paystack.createTransferRecipient({
          type: "ghipss",
          name,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: "GHS",
        });
        recipientCode = recipientResult.data.recipient_code;
      }

      const account = await withdrawalAccountModel.create({
        organizationId,
        accountType,
        bankCode: bankCode || undefined,
        accountNumber,
        accountName: resolvedAccountName || undefined,
        name,
        mobileMoneyProvider: mobileMoneyProvider || undefined,
        recipientCode,
      });

      withdrawalAccountsLogger.info("create_withdrawal_account.success", {
        organizationId,
        accountId: account?.id,
        recipientCode,
      });

      return {
        success: true,
        account,
      };
    } catch (error) {
      withdrawalAccountsLogger.error("create_withdrawal_account.error", error, {
        organizationId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create withdrawal account",
      };
    }
  });

export const deleteWithdrawalAccount = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accountId: z.string() }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    // @ts-expect-error - Type not inferred
    const organizationId = context.session?.session?.activeOrganizationId;
    if (!organizationId) {
      throw new Error("No active organization");
    }
    const { accountId } = data;

    withdrawalAccountsLogger.info("delete_withdrawal_account.start", {
      organizationId,
      accountId,
    });

    try {
      const existingAccount = await withdrawalAccountModel.findById(accountId, organizationId);

      if (!existingAccount) {
        return {
          success: false,
          error: "Account not found",
        };
      }

      const deleted = await withdrawalAccountModel.softDelete(accountId, organizationId);

      if (!deleted) {
        throw new Error("Failed to delete withdrawal account");
      }

      withdrawalAccountsLogger.info("delete_withdrawal_account.success", {
        organizationId,
        accountId,
      });

      return {
        success: true,
      };
    } catch (error) {
      withdrawalAccountsLogger.error("delete_withdrawal_account.error", error, {
        organizationId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete withdrawal account",
      };
    }
  });

export const resolveAccountNumber = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accountNumber: z.string(), bankCode: z.string() }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    // @ts-expect-error - Type not inferred
    const organizationId = context.session?.session?.activeOrganizationId;
    if (!organizationId) {
      throw new Error("No active organization");
    }
    const { accountNumber, bankCode } = data;

    if (!accountNumber || !bankCode) {
      return {
        success: false,
        error: "Account number and bank code are required",
      };
    }

    withdrawalAccountsLogger.info("resolve_account.start", {
      organizationId,
      accountNumber,
      bankCode,
    });

    try {
      const paystack = paystackService(env);
      const result = await paystack.resolveAccount({
        account_number: accountNumber,
        bank_code: bankCode,
      });

      if (!result.status || !result.data) {
        return {
          success: false,
          error: "Unable to verify account details. Please check your account number.",
        };
      }

      withdrawalAccountsLogger.info("resolve_account.success", {
        organizationId,
        accountName: result.data.account_name,
      });

      return {
        success: true,
        data: {
          account_name: result.data.account_name,
          account_number: result.data.account_number,
        },
      };
    } catch (error) {
      withdrawalAccountsLogger.error("resolve_account.error", error, {
        organizationId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to resolve account",
      };
    }
  });
