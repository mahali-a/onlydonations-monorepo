import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import ms from "ms";
import { DonateComponent } from "@/features/public-donate/donate-component";
import { DonateNotFound } from "@/features/public-donate/donate-not-found";
import { DonateError } from "@/features/public-donate/donate-error";
import { retrieveDonateDataFromServer } from "@/features/public-donate/server";

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
  component: () => {
    const { slug } = Route.useParams();
    const { data } = useSuspenseQuery(donateQueryOptions(slug));

    if (!data) {
      return <div>Campaign not found</div>;
    }

    return <DonateComponent data={data} />;
  },
  notFoundComponent: DonateNotFound,
  errorComponent: DonateError,
});
