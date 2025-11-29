import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import { logger } from "@/lib/logger";
import { paystackService } from "@/lib/paystack";
import { promiseHash } from "@/lib/promise-hash";
import { requireOrganizationAccess } from "@/server/middleware/access-control";
import { authMiddleware } from "@/server/middleware/auth";
import {
  retrieveTotalRaisedFromDatabaseByOrganization,
  retrieveWithdrawalAccountFromDatabaseById,
  retrieveWithdrawalAggregateFromDatabaseByOrganizationAndStatus,
  savePaymentTransactionToDatabase,
  updatePaymentTransactionInDatabase,
} from "../org-payments-models";
import { requestWithdrawalSchema } from "./make-withdrawal-schema";

const makeWithdrawalLogger = logger.createChildLogger("make-withdrawal-actions");

export const createWithdrawalRequestOnServer = createServerFn({ method: "POST" })
  .inputValidator(requestWithdrawalSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { organizationId, payoutAccountId, amount, currency } = data;

    await requireOrganizationAccess(organizationId, context.user.id);

    makeWithdrawalLogger.error("request_withdrawal.start", {
      organizationId,
      payoutAccountId,
      amount,
      currency,
    });

    try {
      const withdrawalAccount = await retrieveWithdrawalAccountFromDatabaseById(
        payoutAccountId,
        organizationId,
      );

      if (!withdrawalAccount) {
        return {
          success: false,
          error: "Withdrawal account not found",
        };
      }

      const amountInMinorUnits = Math.round(amount * 100);

      const transferFee = withdrawalAccount.accountType === "mobile_money" ? 100 : 800;

      const totalAmount = amountInMinorUnits + transferFee;

      const { donations, completedWithdrawals, pendingWithdrawals } = await promiseHash({
        donations: retrieveTotalRaisedFromDatabaseByOrganization(organizationId),
        completedWithdrawals: retrieveWithdrawalAggregateFromDatabaseByOrganizationAndStatus(
          organizationId,
          "SUCCESS",
        ),
        pendingWithdrawals: retrieveWithdrawalAggregateFromDatabaseByOrganizationAndStatus(
          organizationId,
          "PENDING",
        ),
      });

      const availableBalance = Math.max(
        0,
        donations.totalRaised - completedWithdrawals - pendingWithdrawals,
      );

      if (totalAmount > availableBalance) {
        return {
          success: false,
          error: "Insufficient balance (including transfer fee)",
        };
      }

      const reference = `wdl_${nanoid(16)}`;

      const transaction = await savePaymentTransactionToDatabase({
        organizationId,
        processor: "paystack_transfer",
        processorRef: reference,
        processorTransactionId: undefined,
        amount: amountInMinorUnits,
        fees: 0,
        currency: currency,
        status: "PENDING",
        metadata: JSON.stringify({
          organizationId,
          withdrawalAccountId: payoutAccountId,
          type: "withdrawal",
          recipientCode: withdrawalAccount.recipientCode,
        }),
      });

      if (!transaction) {
        throw new Error("Failed to create transaction record");
      }

      const paystack = paystackService();
      const transferResult = await paystack.initiateTransfer({
        source: "balance",
        amount: amountInMinorUnits,
        recipient: withdrawalAccount.recipientCode,
        reference: reference,
        reason: `Withdrawal to ${withdrawalAccount.name || withdrawalAccount.accountName}`,
        currency: currency as "GHS" | "NGN",
      });

      const updatedTransaction = await updatePaymentTransactionInDatabase(transaction.id, {
        processorTransactionId: transferResult.data.transfer_code,
        status: transferResult.data.status === "success" ? "SUCCESS" : "PENDING",
        fees: transferResult.data.fee_charged || 0,
        completedAt: transferResult.data.status === "success" ? new Date() : undefined,
      });

      return {
        success: true,
        transaction: updatedTransaction,
        transferStatus: transferResult.data.status,
      };
    } catch (error) {
      makeWithdrawalLogger.error("request_withdrawal.error", error, {
        organizationId,
        payoutAccountId,
        amount,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process withdrawal",
      };
    }
  });
