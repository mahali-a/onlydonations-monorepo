import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import ms from "ms";
import { MakeWithdrawalComponent } from "@/features/org-payments/make-withdrawal";
import { retrieveMakeWithdrawalDataFromServer } from "@/features/org-payments/make-withdrawal/server";

const makeWithdrawalQueryOptions = (orgId: string) =>
  queryOptions({
    queryKey: ["make-withdrawal", orgId],
    queryFn: () => retrieveMakeWithdrawalDataFromServer({ data: { orgId } }),
    staleTime: ms("5 minutes"),
  });

export const Route = createFileRoute("/o/$orgId/payments/")({
  loader: ({ context }) => {
    const orgId = context.organization?.id;

    if (!orgId) {
      throw new Error("Organization context is required");
    }

    return context.queryClient.ensureQueryData(makeWithdrawalQueryOptions(orgId));
  },
  component: () => {
    const { organization } = Route.useRouteContext();
    const { data } = useSuspenseQuery(makeWithdrawalQueryOptions(organization?.id ?? ""));

    if (!organization) {
      return null;
    }

    return (
      <MakeWithdrawalComponent
        withdrawalAccounts={data.withdrawalAccounts}
        availableBalance={data.availableBalance}
        currency={data.currency}
      />
    );
  },
});
