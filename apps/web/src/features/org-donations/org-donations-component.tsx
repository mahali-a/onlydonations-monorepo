import type { DonationStats, DonorRow } from "./org-donations-models";
import { DonationStatsCard, DonationsFilters, DonationsPagination, DonationsTable } from "./ui";

type DonationsComponentProps = {
  donations: DonorRow[];
  stats: DonationStats | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export function DonationsComponent({ donations, stats, pagination }: DonationsComponentProps) {
  return (
    <div className="container mx-auto px-4 lg:px-8 pt-6 w-full space-y-6 bg-background pb-8 overflow-x-auto">
      <div className="w-full flex flex-col md:flex-row items-start md:items-center gap-4 md:justify-between">
        <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Donation Insights</h1>
          <p className="text-muted-foreground">
            Track donation activity and donor engagement across all campaigns
          </p>
        </div>
      </div>

      <DonationStatsCard stats={stats} />

      <div className="space-y-6">
        <DonationsFilters />

        <div className="space-y-4">
          <DonationsTable donations={donations} />
          {pagination.totalPages > 1 && <DonationsPagination pagination={pagination} />}
        </div>
      </div>
    </div>
  );
}
