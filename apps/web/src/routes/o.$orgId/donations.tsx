import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { DonationsComponent } from "@/features/donations/donations-component";
import {
  retrieveDonationsFromServer,
  retrieveDonationStatsFromServer,
} from "@/features/donations/server";
import { donationFiltersSchema } from "@/features/donations/donations-schemas";
import type { DonationFilters } from "@/features/donations/donations-schemas";

export const donationsQueryOptions = (orgId: string, filters?: Partial<DonationFilters>) =>
  queryOptions({
    queryKey: ["donations", orgId, filters],
    queryFn: () =>
      retrieveDonationsFromServer({
        data: donationFiltersSchema.parse(filters || {}),
      }),
  });

export const donationStatsQueryOptions = (orgId: string) =>
  queryOptions({
    queryKey: ["donation-stats", orgId],
    queryFn: () => retrieveDonationStatsFromServer(),
  });

type DonationsSearchParams = Partial<DonationFilters>;

export const Route = createFileRoute("/o/$orgId/donations")({
  validateSearch: (search): DonationsSearchParams => {
    return {
      page: search.page as number | undefined,
      limit: search.limit as number | undefined,
      search: search.search as string | undefined,
      status: search.status as "PENDING" | "SUCCESS" | "FAILED" | undefined,
      sortBy: search.sortBy as DonationFilters["sortBy"] | undefined,
      sortOrder: search.sortOrder as "asc" | "desc" | undefined,
    };
  },
  beforeLoad: ({ context, params }) => {
    context.queryClient.ensureQueryData(donationsQueryOptions(params.orgId));
    context.queryClient.ensureQueryData(donationStatsQueryOptions(params.orgId));
  },
  component: DonationsPage,
  errorComponent: () => <div>Error loading donations</div>,
});

function DonationsPage() {
  const { orgId } = Route.useParams();
  const search = Route.useSearch();

  const donationsQuery = useSuspenseQuery(donationsQueryOptions(orgId, search));
  const statsQuery = useSuspenseQuery(donationStatsQueryOptions(orgId));

  return (
    <DonationsComponent
      donations={donationsQuery.data.donations}
      stats={statsQuery.data}
      pagination={donationsQuery.data.pagination}
    />
  );
}
