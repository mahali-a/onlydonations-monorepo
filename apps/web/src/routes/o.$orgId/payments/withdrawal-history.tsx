import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import ms from "ms";
import { WithdrawalHistoryComponent } from "@/features/payments/withdrawal-history";
import { getWithdrawalHistory } from "@/features/payments/withdrawal-history/server";

const withdrawalHistoryQueryOptions = (orgId: string) => queryOptions({
  queryKey: ['withdrawal-history', orgId],
  queryFn: () => getWithdrawalHistory(),
  staleTime: ms('2 minutes'),
});

export const Route = createFileRoute("/o/$orgId/payments/withdrawal-history")({
  component: WithdrawalHistory,
  loader: ({ context }) => {
    const orgId = context.organization?.id;

    if (!orgId) {
      throw new Error("Organization context is required");
    }

    return context.queryClient.ensureQueryData(withdrawalHistoryQueryOptions(orgId));
  },
});

function WithdrawalHistory() {
  const { organization } = Route.useRouteContext();

  if (!organization) {
    return null;
  }

  const { data } = useSuspenseQuery(withdrawalHistoryQueryOptions(organization.id));

  return (
    <WithdrawalHistoryComponent
      withdrawals={data.withdrawals}
      organizationSlug={organization.slug}
    />
  );
}
