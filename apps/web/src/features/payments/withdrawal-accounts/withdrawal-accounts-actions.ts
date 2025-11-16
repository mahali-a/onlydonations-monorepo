import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/server/middleware/auth";
import { requireOrganizationAccess } from "@/server/middleware/access-control";
import { logger } from "@/lib/logger";
import { paystackService } from "@/lib/paystack";
import {
  saveWithdrawalAccountToDatabase,
  retrieveWithdrawalAccountFromDatabaseById,
  deleteWithdrawalAccountInDatabase,
} from "../payments-models";

const withdrawalAccountsLogger = logger.createChildLogger("withdrawal-accounts-actions");

export const createWithdrawalAccountOnServer = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      organizationId: z.string().min(1, "Organization ID is required"),
      accountType: z.enum(["mobile_money", "ghipss"]),
      accountNumber: z.string(),
      bankCode: z.string().optional(),
      name: z.string(),
      mobileMoneyProvider: z.string().optional(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { organizationId, accountType, accountNumber, bankCode, name, mobileMoneyProvider } =
      data;

    await requireOrganizationAccess(organizationId, context.user.id);

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

      const account = await saveWithdrawalAccountToDatabase({
        organizationId,
        accountType,
        bankCode: bankCode || undefined,
        accountNumber,
        accountName: resolvedAccountName || undefined,
        name,
        mobileMoneyProvider: mobileMoneyProvider || undefined,
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

export const deleteWithdrawalAccountOnServer = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      organizationId: z.string().min(1, "Organization ID is required"),
      accountId: z.string(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { organizationId, accountId } = data;

    await requireOrganizationAccess(organizationId, context.user.id);

    try {
      const existingAccount = await retrieveWithdrawalAccountFromDatabaseById(
        accountId,
        organizationId,
      );

      if (!existingAccount) {
        return {
          success: false,
          error: "Account not found",
        };
      }

      const deleted = await deleteWithdrawalAccountInDatabase(accountId, organizationId);

      if (!deleted) {
        throw new Error("Failed to delete withdrawal account");
      }

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

export const resolvePaystackAccountNumberOnServer = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      organizationId: z.string().min(1, "Organization ID is required"),
      accountNumber: z.string(),
      bankCode: z.string(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { organizationId, accountNumber, bankCode } = data;

    await requireOrganizationAccess(organizationId, context.user.id);

    if (!accountNumber || !bankCode) {
      return {
        success: false,
        error: "Account number and bank code are required",
      };
    }

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
