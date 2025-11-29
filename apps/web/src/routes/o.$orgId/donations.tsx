import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { DonationsComponent } from "@/features/org-donations/org-donations-component";
import { DonationsError } from "@/features/org-donations/org-donations-error";
import type { DonationFilters } from "@/features/org-donations/org-donations-schema";
import { donationFiltersSchema } from "@/features/org-donations/org-donations-schema";
import {
  retrieveDonationStatsFromServer,
  retrieveDonationsFromServer,
} from "@/features/org-donations/server";

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

export const Route = createFileRoute("/o/$orgId/donations")({
  validateSearch: donationFiltersSchema,
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(donationsQueryOptions(params.orgId));
    context.queryClient.ensureQueryData(donationStatsQueryOptions(params.orgId));
  },
  component: () => {
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
  },
  errorComponent: DonationsError,
});
