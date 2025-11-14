import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { z } from "zod";
import { authMiddleware } from "@/core/middleware";
import { financialInsightsModel } from "../models/financial-insights-model";
import { paymentTransactionModel } from "../models/payment-transaction-model";

export const getPaymentLayoutMetrics = createServerFn({ method: "GET" })
  .inputValidator(z.object({ organizationId: z.string() }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const thirtyDaysAgo = dayjs().subtract(30, "days").toDate();
    const sixtyDaysAgo = dayjs().subtract(60, "days").toDate();

    // Get raw data from models
    const [
      allTimeDonations,
      allTimeCompletedWithdrawals,
      allTimePendingWithdrawals,
      periodDonations,
      periodCompletedWithdrawals,
      periodPendingWithdrawals,
    ] = await Promise.all([
      financialInsightsModel.getTotalRaisedByOrganization(data.organizationId),
      paymentTransactionModel.getTotalWithdrawalsByStatus(data.organizationId, "SUCCESS"),
      paymentTransactionModel.getTotalWithdrawalsByStatus(data.organizationId, "PENDING"),
      financialInsightsModel.getTotalRaisedByOrganizationForPeriod(
        data.organizationId,
        sixtyDaysAgo,
        thirtyDaysAgo,
      ),
      paymentTransactionModel.getTotalWithdrawalsByStatus(data.organizationId, "SUCCESS"),
      paymentTransactionModel.getTotalWithdrawalsByStatus(data.organizationId, "PENDING"),
    ]);

    // Business logic calculations in application
    const allTimeStats = {
      totalRaised: Number(allTimeDonations.totalRaised) || 0,
      totalWithdrawals: allTimeCompletedWithdrawals, // Business decision: only confirmed
      availableBalance: Math.max(
        0,
        allTimeDonations.totalRaised - allTimeCompletedWithdrawals - allTimePendingWithdrawals,
      ), // Business calculation
      currency: allTimeDonations.currency || "GHS",
    };

    const previousPeriodStats = {
      totalRaised: Number(periodDonations) || 0,
      totalWithdrawals: periodCompletedWithdrawals,
      availableBalance: Math.max(
        0,
        periodDonations - periodCompletedWithdrawals - periodPendingWithdrawals,
      ),
      currency: "GHS",
    };

    return {
      financialStats: {
        totalRaised: allTimeStats.totalRaised,
        totalRaisedPrevious: previousPeriodStats.totalRaised,
        totalWithdrawals: allTimeStats.totalWithdrawals,
        totalWithdrawalsPrevious: previousPeriodStats.totalWithdrawals,
        availableBalance: allTimeStats.availableBalance,
        availableBalancePrevious: previousPeriodStats.availableBalance,
        currency: allTimeStats.currency,
      },
    };
  });
