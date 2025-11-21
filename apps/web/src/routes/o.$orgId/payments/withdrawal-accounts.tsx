import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import ms from "ms";
import { WithdrawalAccountsComponent } from "@/features/org-payments/withdrawal-accounts";
import { retrieveWithdrawalAccountsFromServer } from "@/features/org-payments/withdrawal-accounts/server";

const withdrawalAccountsQueryOptions = (orgId: string) =>
  queryOptions({
    queryKey: ["withdrawal-accounts", orgId],
    queryFn: () => retrieveWithdrawalAccountsFromServer({ data: { orgId } }),
    staleTime: ms("5 minutes"),
  });

export const Route = createFileRoute("/o/$orgId/payments/withdrawal-accounts")({
  loader: ({ context }) => {
    const orgId = context.organization?.id;

    if (!orgId) {
      throw new Error("Organization context is required");
    }

    return context.queryClient.ensureQueryData(withdrawalAccountsQueryOptions(orgId));
  },
  component: () => {
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
  },
});
