import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import ms from "ms";
import { DonationStatus } from "@/features/public-donation-status";
import { DonationStatusNotFound } from "@/features/public-donation-status/donation-status-not-found";
import { DonationStatusError } from "@/features/public-donation-status/donation-status-error";
import { retrieveDonationStatusDataFromServer } from "@/features/public-donation-status/donation-status-loaders";

const donationStatusQueryOptions = (donationId: string) =>
  queryOptions({
    queryKey: ["donation-status", donationId],
    queryFn: () => retrieveDonationStatusDataFromServer({ data: { donationId } }),
    staleTime: ms("30 seconds"),
  });

export const Route = createFileRoute("/d/$donationId/donation-status")({
  loader: async ({ params, context }) => {
    const { donationId } = params;

    if (!donationId) {
      throw new Response("Donation ID is required", { status: 400 });
    }

    const data = await context.queryClient.ensureQueryData(donationStatusQueryOptions(donationId));

    if (!data) {
      throw notFound();
    }
  },
  component: () => {
    const { donationId } = Route.useParams();
    const { data } = useSuspenseQuery(donationStatusQueryOptions(donationId));

    if (!data) {
      return <div>Donation not found</div>;
    }

    return <DonationStatus data={data} />;
  },
  notFoundComponent: DonationStatusNotFound,
  errorComponent: DonationStatusError,
});
