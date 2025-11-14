import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import { authMiddleware } from "@/core/middleware/auth";
import { logger } from "@/lib/logger";
import { paystackService } from "@/lib/paystack";
import { financialInsightsModel } from "../models/financial-insights-model";
import { paymentTransactionModel } from "../models/payment-transaction-model";
import { withdrawalAccountModel } from "../models/withdrawal-account-model";
import { requestWithdrawalSchema } from "./make-withdrawal-schemas";

const makeWithdrawalLogger = logger.child("make-withdrawal-actions");

export const requestWithdrawal = createServerFn({ method: "POST" })
  .inputValidator(requestWithdrawalSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    // @ts-expect-error - Type not inferred
    const organizationId = context.session?.session?.activeOrganizationId;
    if (!organizationId) {
      throw new Error("No active organization");
    }

    const { payoutAccountId, amount, currency } = data;

    makeWithdrawalLogger.info("request_withdrawal.start", {
      organizationId,
      payoutAccountId,
      amount,
      currency,
    });

    try {
      const withdrawalAccount = await withdrawalAccountModel.findById(
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

      // Get raw data from models
      const [donations, completedWithdrawals, pendingWithdrawals] = await Promise.all([
        financialInsightsModel.getTotalRaisedByOrganization(organizationId),
        paymentTransactionModel.getTotalWithdrawalsByStatus(organizationId, "SUCCESS"),
        paymentTransactionModel.getTotalWithdrawalsByStatus(organizationId, "PENDING"),
      ]);

      // Business logic calculation
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

      const transaction = await paymentTransactionModel.create({
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

      const paystack = paystackService(env);
      const transferResult = await paystack.initiateTransfer({
        source: "balance",
        amount: amountInMinorUnits,
        recipient: withdrawalAccount.recipientCode,
        reference: reference,
        reason: `Withdrawal to ${withdrawalAccount.name || withdrawalAccount.accountName}`,
        currency: currency as "GHS" | "NGN",
      });

      const updatedTransaction = await paymentTransactionModel.update(transaction.id, {
        processorTransactionId: transferResult.data.transfer_code,
        status: transferResult.data.status === "success" ? "SUCCESS" : "PENDING",
        fees: transferResult.data.fee_charged || 0,
        completedAt: transferResult.data.status === "success" ? new Date() : undefined,
      });

      makeWithdrawalLogger.info("request_withdrawal.success", {
        organizationId,
        transactionId: transaction.id,
        transferCode: transferResult.data.transfer_code,
        status: transferResult.data.status,
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
