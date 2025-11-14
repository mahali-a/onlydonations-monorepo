import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import ms from "ms";
import { WithdrawalAccountsComponent } from "@/features/payments/withdrawal-accounts";
import { getWithdrawalAccountsData } from "@/features/payments/withdrawal-accounts/server";

const withdrawalAccountsQueryOptions = (orgId: string) => queryOptions({
  queryKey: ['withdrawal-accounts', orgId],
  queryFn: () => getWithdrawalAccountsData({ data: { orgId } }),
  staleTime: ms('5 minutes'),
});

export const Route = createFileRoute("/o/$orgId/payments/withdrawal-accounts")({
  component: WithdrawalAccounts,
  loader: ({ context }) => {
    const orgId = context.organization?.id;

    if (!orgId) {
      throw new Error("Organization context is required");
    }

    return context.queryClient.ensureQueryData(withdrawalAccountsQueryOptions(orgId));
  },
});

function WithdrawalAccounts() {
  const { organization } = Route.useRouteContext();

  if (!organization) {
    throw new Error("Organization context is required");
  }

  const { data } = useSuspenseQuery(withdrawalAccountsQueryOptions(organization.id));

  return (
    <WithdrawalAccountsComponent
      withdrawalAccounts={data.withdrawalAccounts}
      mobileMoneyBanks={data.mobileMoneyBanks}
      ghipssBanks={data.ghipssBanks}
    />
  );
}
