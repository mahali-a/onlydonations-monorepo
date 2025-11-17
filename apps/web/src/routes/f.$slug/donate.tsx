import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import ms from "ms";
import { DonateComponent } from "@/features/donations/public/donate/donate-component";
import { retrieveDonateDataFromServer } from "@/features/donations/public/donate/server";

const donateQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["donate", slug],
    queryFn: () => retrieveDonateDataFromServer({ data: { slug } }),
    staleTime: ms("2 minutes"),
  });

export const Route = createFileRoute("/f/$slug/donate")({
  loader: async ({ params, context }) => {
    const { slug } = params;

    if (!slug) {
      throw new Response("Campaign slug is required", { status: 400 });
    }

    const data = await context.queryClient.ensureQueryData(donateQueryOptions(slug));

    if (!data) {
      throw notFound();
    }
  },

  component: DonateRoute,

  notFoundComponent: () => {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Campaign Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The campaign you're looking for doesn't exist or is no longer available.
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
            We encountered an error loading this donation form.
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

function DonateRoute() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(donateQueryOptions(slug));

  if (!data) {
    return <div>Campaign not found</div>;
  }

  return <DonateComponent data={data} />;
}
