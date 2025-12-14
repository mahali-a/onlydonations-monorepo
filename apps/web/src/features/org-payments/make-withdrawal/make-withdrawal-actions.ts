import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import { retrieveUserKycStatusFromDatabaseByUser } from "@/features/user-account/kyc/kyc-models";
import { calculateWithdrawalFees } from "@/lib/fees/calculator";
import { logger } from "@/lib/logger";
import { paystackService } from "@/lib/paystack";
import { promiseHash } from "@/lib/promise-hash";
import { requireOrganizationAccess } from "@/server/middleware/access-control";
import { authMiddleware } from "@/server/middleware/auth";
import {
  retrieveTotalRaisedFromDatabaseByOrganization,
  retrieveWithdrawalAccountFromDatabaseById,
  retrieveWithdrawalAccountsFromDatabaseByOrganization,
  retrieveWithdrawalAggregateFromDatabaseByOrganizationAndStatus,
  savePaymentTransactionToDatabase,
  updatePaymentTransactionInDatabase,
} from "../org-payments-models";
import { requestWithdrawalSchema } from "./make-withdrawal-schema";

const makeWithdrawalLogger = logger.createChildLogger("make-withdrawal-actions");

class WithdrawalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WithdrawalError";
  }
}

export const createWithdrawalRequestOnServer = createServerFn({ method: "POST" })
  .inputValidator(requestWithdrawalSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { organizationId, payoutAccountId, amount, currency } = data;

    await requireOrganizationAccess(organizationId, context.user.id);

    const user = context.user;

    // Validate phone verification
    const phoneVerified = Boolean(user.phoneNumber && user.phoneNumberVerified);
    if (!phoneVerified) {
      throw new WithdrawalError("Phone number must be verified before making withdrawals");
    }

    // Validate KYC
    const kycStatus = await retrieveUserKycStatusFromDatabaseByUser(user.id);
    if (kycStatus?.kycStatus !== "VERIFIED") {
      throw new WithdrawalError("KYC verification must be completed before making withdrawals");
    }

    // Validate payout accounts exist
    const withdrawalAccounts =
      await retrieveWithdrawalAccountsFromDatabaseByOrganization(organizationId);
    if (withdrawalAccounts.length === 0) {
      throw new WithdrawalError("No payout account configured. Please add a payout account first");
    }

    // Validate selected payout account
    const withdrawalAccount = await retrieveWithdrawalAccountFromDatabaseById(
      payoutAccountId,
      organizationId,
    );
    if (!withdrawalAccount) {
      throw new WithdrawalError("Withdrawal account not found");
    }

    // Calculate fees
    const amountInMinorUnits = Math.round(amount * 100);
    const accountType = withdrawalAccount.accountType as "mobile_money" | "bank";
    const fees = calculateWithdrawalFees(amountInMinorUnits, accountType);

    // Check available balance
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

    if (fees.totalDeduction > availableBalance) {
      throw new WithdrawalError(
        `Insufficient balance. You need at least ${(fees.totalDeduction / 100).toFixed(2)} ${currency} (including fees) but only have ${(availableBalance / 100).toFixed(2)} ${currency} available.`,
      );
    }

    const reference = `wdl_${nanoid(16)}`;
    const transaction = await savePaymentTransactionToDatabase({
      organizationId,
      processor: "paystack_transfer",
      processorRef: reference,
      processorTransactionId: undefined,
      amount: amountInMinorUnits,
      fees: fees.totalFees,
      currency: currency,
      status: "PENDING",
      metadata: JSON.stringify({
        organizationId,
        withdrawalAccountId: payoutAccountId,
        type: "withdrawal",
        recipientCode: withdrawalAccount.recipientCode,
        platformFee: fees.platformFee,
        transferFee: fees.transferFee,
      }),
    });

    if (!transaction) {
      throw new Error("Failed to create transaction record");
    }

    // Initiate transfer with Paystack
    const paystack = paystackService();
    const transferResult = await paystack.initiateTransfer({
      source: "balance",
      amount: amountInMinorUnits,
      recipient: withdrawalAccount.recipientCode,
      reference: reference,
      reason: `Withdrawal to ${withdrawalAccount.name || withdrawalAccount.accountName}`,
      currency: currency as "GHS" | "NGN",
    });

    const paystackStatus = transferResult.data.status;
    const mapPaystackStatusToInternal = (
      status: string,
    ): "PENDING" | "SUCCESS" | "FAILED" | "OTP" => {
      switch (status) {
        case "success":
          return "SUCCESS";
        case "failed":
        case "reversed":
        case "abandoned":
        case "blocked":
        case "rejected":
          return "FAILED";
        case "otp":
          return "OTP";
        default:
          return "PENDING";
      }
    };

    const internalStatus = mapPaystackStatusToInternal(paystackStatus);

    const updatedTransaction = await updatePaymentTransactionInDatabase(transaction.id, {
      processorTransactionId: transferResult.data.transfer_code,
      status: internalStatus,
      fees: fees.totalFees,
      completedAt: internalStatus === "SUCCESS" ? new Date() : undefined,
      statusMessage:
        internalStatus === "FAILED"
          ? `Transfer ${paystackStatus}: ${transferResult.data.reason || "No reason provided"}`
          : internalStatus === "OTP"
            ? "OTP verification required"
            : undefined,
    });

    makeWithdrawalLogger.info("request_withdrawal.success", {
      organizationId,
      transactionId: updatedTransaction?.id,
      amount: amountInMinorUnits,
      fees: fees.totalFees,
      paystackStatus,
      internalStatus,
    });

    return {
      success: true,
      transaction: updatedTransaction,
      transferStatus: paystackStatus,
    };
  });
