import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import ms from "ms";
import { WithdrawalHistoryComponent } from "@/features/org-payments/withdrawal-history";
import { retrieveWithdrawalHistoryFromServer } from "@/features/org-payments/withdrawal-history/server";

const withdrawalHistoryQueryOptions = (orgId: string) =>
  queryOptions({
    queryKey: ["withdrawal-history", orgId],
    queryFn: () => retrieveWithdrawalHistoryFromServer({ data: { orgId } }),
    staleTime: ms("2 minutes"),
  });

export const Route = createFileRoute("/o/$orgId/payments/withdrawal-history")({
  loader: ({ context }) => {
    const orgId = context.organization?.id;

    if (!orgId) {
      throw new Error("Organization context is required");
    }

    return context.queryClient.ensureQueryData(withdrawalHistoryQueryOptions(orgId));
  },
  component: () => {
    const { organization } = Route.useRouteContext();
    const { data } = useSuspenseQuery(withdrawalHistoryQueryOptions(organization?.id ?? ""));

    if (!organization) {
      return null;
    }

    return <WithdrawalHistoryComponent withdrawals={data.withdrawals} />;
  },
});
