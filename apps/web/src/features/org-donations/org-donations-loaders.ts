import { createServerFn } from "@tanstack/react-start";
import { promiseHash } from "@/lib/promise-hash";
import { authMiddleware, organizationMiddleware } from "@/server/middleware";
import { type DonationStats, type DonorRow, donationModel } from "./org-donations-models";
import {
  type DonationFilters,
  donationFiltersSchema,
  donationStatsRequestSchema,
} from "./org-donations-schema";
import { calculatePaginationMetadata, getDateRange } from "./org-donations-utils";

type RetrieveDonationsResponse = {
  donations: DonorRow[];
  pagination: ReturnType<typeof calculatePaginationMetadata>;
};

export const retrieveDonationsFromServer = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware, organizationMiddleware])
  .inputValidator((data) => donationFiltersSchema.parse(data ?? {}))
  .handler(async ({ data, context }): Promise<RetrieveDonationsResponse> => {
    const filters = data as DonationFilters;

    const { donations, total } = await promiseHash({
      donations: donationModel.retrieveDonationsFromDatabaseByOrganization(
        context.organizationId,
        filters,
      ),
      total: donationModel.retrieveDonationCountFromDatabaseByOrganization(
        context.organizationId,
        filters.search,
      ),
    });

    return {
      donations,
      pagination: calculatePaginationMetadata(filters.page, filters.limit, total),
    };
  });

export const retrieveDonationStatsFromServer = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware, organizationMiddleware])
  .inputValidator((data) => donationStatsRequestSchema.parse(data ?? {}))
  .handler(async ({ context }): Promise<DonationStats> => {
    const currentMonthRange = getDateRange(0);
    const previousMonthRange = getDateRange(-1);

    const { currentStats, previousStats, returningDonorsCurrent, returningDonorsPrevious } =
      await promiseHash({
        currentStats: donationModel.retrieveDonationStatsFromDatabaseByOrganizationAndDateRange(
          context.organizationId,
          currentMonthRange,
        ),
        previousStats: donationModel.retrieveDonationStatsFromDatabaseByOrganizationAndDateRange(
          context.organizationId,
          previousMonthRange,
        ),
        returningDonorsCurrent:
          donationModel.retrieveReturningDonorsCountFromDatabaseByOrganizationAndDateRange(
            context.organizationId,
            currentMonthRange,
          ),
        returningDonorsPrevious:
          donationModel.retrieveReturningDonorsCountFromDatabaseByOrganizationAndDateRange(
            context.organizationId,
            previousMonthRange,
          ),
      });

    return {
      totalDonors: currentStats.totalDonors,
      totalDonorsPrevious: previousStats.totalDonors,
      totalAmount: currentStats.totalAmount,
      totalAmountPrevious: previousStats.totalAmount,
      returningDonors: returningDonorsCurrent,
      returningDonorsPrevious: returningDonorsPrevious,
      averageDonation: currentStats.averageDonation,
      averageDonationPrevious: previousStats.averageDonation,
      topDonor: currentStats.topDonor,
      currency: currentStats.currency,
    };
  });
