import { createServerFn } from "@tanstack/react-start";
import { authMiddleware, organizationMiddleware } from "@/server/middleware";
import { logger } from "@/lib/logger";
import { dashboardModel } from "./dashboard-models";
import { promiseHash } from "@/utils/promise-hash";

const dashboardLogger = logger.createChildLogger("dashboard-loaders");

export const retrieveDashboardDataFromServer = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware, organizationMiddleware])
  .handler(async ({ context }) => {
    try {
      const now = new Date();
      const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const { allTimeStats, recentDonations, topCampaigns, chartData } = await promiseHash({
        allTimeStats: dashboardModel.retrieveAllTimeStatsFromDatabaseByOrganization(
          context.organizationId,
        ),
        recentDonations: dashboardModel.retrieveRecentDonationsFromDatabaseByOrganization(
          context.organizationId,
          10,
        ),
        topCampaigns: dashboardModel.retrieveTopCampaignsFromDatabaseByOrganization(
          context.organizationId,
          5,
        ),
        chartData: dashboardModel.retrieveDailyDonationChartDataFromDatabaseByOrganization(
          context.organizationId,
          30,
        ),
      });

      const currentMonthData = chartData.filter((d) => new Date(d.date) >= startOfCurrentMonth);
      const previousMonthData = chartData.filter(
        (d) => new Date(d.date) >= startOfPreviousMonth && new Date(d.date) <= endOfPreviousMonth,
      );

      const currentMonthTotal = currentMonthData.reduce((sum, d) => sum + d.amount, 0);
      const previousMonthTotal = previousMonthData.reduce((sum, d) => sum + d.amount, 0);

      return {
        allTimeStats,
        currentMonthTotal,
        previousMonthTotal,
        recentDonations,
        topCampaigns,
        chartData,
      };
    } catch (error) {
      dashboardLogger.error("Dashboard data fetch error", error);
      throw error;
    }
  });
