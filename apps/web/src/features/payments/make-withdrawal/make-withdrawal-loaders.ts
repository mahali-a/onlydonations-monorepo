import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/core/middleware/auth";
import { logger } from "@/lib/logger";
import { financialInsightsModel } from "../models/financial-insights-model";
import { paymentTransactionModel } from "../models/payment-transaction-model";
import { withdrawalAccountModel } from "../models/withdrawal-account-model";

const makeWithdrawalLogger = logger.child("make-withdrawal-loaders");

export const getMakeWithdrawalData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ orgId: z.string() }))
  .handler(async ({ context }) => {
    // @ts-expect-error - Type not inferred
    const organizationId = context.session?.session?.activeOrganizationId;
    if (!organizationId) {
      throw new Error("No active organization");
    }

    makeWithdrawalLogger.info("loader.start", { organizationId });

    try {
      // Get raw data from models
      const [withdrawalAccounts, donations, completedWithdrawals, pendingWithdrawals] =
        await Promise.all([
          withdrawalAccountModel.findByOrganizationId(organizationId),
          financialInsightsModel.getTotalRaisedByOrganization(organizationId),
          paymentTransactionModel.getTotalWithdrawalsByStatus(organizationId, "SUCCESS"),
          paymentTransactionModel.getTotalWithdrawalsByStatus(organizationId, "PENDING"),
        ]);

      // Business logic calculation in application
      const availableBalance = Math.max(
        0,
        donations.totalRaised - completedWithdrawals - pendingWithdrawals,
      );

      makeWithdrawalLogger.info("loader.success", {
        organizationId,
        withdrawalAccountsCount: withdrawalAccounts.length,
        availableBalance,
      });

      return {
        withdrawalAccounts,
        availableBalance,
        currency: donations.currency || "GHS",
      };
    } catch (error) {
      makeWithdrawalLogger.error("loader.error", {
        organizationId,
        error,
      });
      throw error;
    }
  });
