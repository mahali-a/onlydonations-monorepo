import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/core/middleware/auth";
import { logger } from "@/lib/logger";
import { paymentTransactionModel } from "../models/payment-transaction-model";

const withdrawalHistoryLogger = logger.child("withdrawal-history-loaders");

export const getWithdrawalHistory = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    // @ts-expect-error - Type not inferred
    const organizationId = context.session?.session?.activeOrganizationId;
    if (!organizationId) {
      throw new Error("No active organization");
    }

    withdrawalHistoryLogger.info("get_withdrawal_history.start", { organizationId });

    try {
      const withdrawals =
        await paymentTransactionModel.findWithdrawalsByOrganization(organizationId);

      withdrawalHistoryLogger.info("get_withdrawal_history.success", {
        organizationId,
        count: withdrawals.length,
      });

      return {
        withdrawals,
      };
    } catch (error) {
      withdrawalHistoryLogger.error("get_withdrawal_history.error", error, { organizationId });
      throw error;
    }
  });
