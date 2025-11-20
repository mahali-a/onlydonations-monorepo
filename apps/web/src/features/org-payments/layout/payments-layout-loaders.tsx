import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { z } from "zod";
import { authMiddleware } from "@/server/middleware";
import {
  retrieveTotalRaisedFromDatabaseByOrganization,
  retrieveTotalRaisedFromDatabaseByOrganizationAndPeriod,
  retrieveWithdrawalAggregateFromDatabaseByOrganizationAndStatus,
} from "../org-payments-models";
import { promiseHash } from "@/utils/promise-hash";

export const retrievePaymentLayoutMetricsFromServer = createServerFn({ method: "GET" })
  .inputValidator(z.object({ organizationId: z.string() }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const thirtyDaysAgo = dayjs().subtract(30, "days").toDate();
    const sixtyDaysAgo = dayjs().subtract(60, "days").toDate();

    const {
      allTimeDonations,
      allTimeCompletedWithdrawals,
      allTimePendingWithdrawals,
      periodDonations,
      periodCompletedWithdrawals,
      periodPendingWithdrawals,
    } = await promiseHash({
      allTimeDonations: retrieveTotalRaisedFromDatabaseByOrganization(data.organizationId),
      allTimeCompletedWithdrawals: retrieveWithdrawalAggregateFromDatabaseByOrganizationAndStatus(
        data.organizationId,
        "SUCCESS",
      ),
      allTimePendingWithdrawals: retrieveWithdrawalAggregateFromDatabaseByOrganizationAndStatus(
        data.organizationId,
        "PENDING",
      ),
      periodDonations: retrieveTotalRaisedFromDatabaseByOrganizationAndPeriod(
        data.organizationId,
        sixtyDaysAgo,
        thirtyDaysAgo,
      ),
      periodCompletedWithdrawals: retrieveWithdrawalAggregateFromDatabaseByOrganizationAndStatus(
        data.organizationId,
        "SUCCESS",
      ),
      periodPendingWithdrawals: retrieveWithdrawalAggregateFromDatabaseByOrganizationAndStatus(
        data.organizationId,
        "PENDING",
      ),
    });

    const allTimeStats = {
      totalRaised: Number(allTimeDonations.totalRaised) || 0,
      totalWithdrawals: allTimeCompletedWithdrawals,
      availableBalance: Math.max(
        0,
        allTimeDonations.totalRaised - allTimeCompletedWithdrawals - allTimePendingWithdrawals,
      ),
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
