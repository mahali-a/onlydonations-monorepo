import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import ms from "ms";
import { DonationStatus } from "@/features/donations/public/donation-status";
import { retrieveDonationStatusDataFromServer } from "@/features/donations/public/donation-status/server";

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

  component: DonationStatusRoute,

  notFoundComponent: () => {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Donation Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The donation you're looking for doesn't exist or is no longer available.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  },

  errorComponent: () => {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">
            We encountered an error loading this donation status.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  },
});

function DonationStatusRoute() {
  const { donationId } = Route.useParams();
  const { data } = useSuspenseQuery(donationStatusQueryOptions(donationId));

  if (!data) {
    return <div>Donation not found</div>;
  }

  return <DonationStatus data={data} />;
}
