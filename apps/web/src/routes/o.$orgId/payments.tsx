import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import ms from "ms";
import PaymentsLayout from "@/features/org-payments/layout/payments-layout";
import { retrievePaymentLayoutMetricsFromServer } from "@/features/org-payments/layout/server";

const paymentLayoutMetricsQueryOptions = (orgId: string) =>
  queryOptions({
    queryKey: ["payment-layout-metrics", orgId],
    queryFn: () => retrievePaymentLayoutMetricsFromServer({ data: { organizationId: orgId } }),
    staleTime: ms("5 minutes"),
  });

export const Route = createFileRoute("/o/$orgId/payments")({
  component: RouteComponent,
  loader: ({ context }) => {
    const orgId = context.organization?.id;

    if (!orgId) {
      throw new Error("Organization context is required");
    }

    return context.queryClient.ensureQueryData(paymentLayoutMetricsQueryOptions(orgId));
  },
});

function RouteComponent() {
  const { organization } = Route.useRouteContext();

  if (!organization) {
    throw new Error("Organization context is required");
  }

  const {
    data: { financialStats },
  } = useSuspenseQuery(paymentLayoutMetricsQueryOptions(organization.id));

  return <PaymentsLayout organization={organization} financialStats={financialStats} />;
}
