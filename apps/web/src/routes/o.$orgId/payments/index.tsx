import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import ms from "ms";
import { MakeWithdrawalComponent } from "@/features/payments/make-withdrawal";
import { getMakeWithdrawalData } from "@/features/payments/make-withdrawal/server";

const makeWithdrawalQueryOptions = (orgId: string) => queryOptions({
  queryKey: ['make-withdrawal', orgId],
  queryFn: () => getMakeWithdrawalData({ data: { orgId } }),
  staleTime: ms('5 minutes'),
});

export const Route = createFileRoute("/o/$orgId/payments/")({
  component: MakeWithdrawal,
  loader: ({ context }) => {
    const orgId = context.organization?.id;

    if (!orgId) {
      throw new Error("Organization context is required");
    }

    return context.queryClient.ensureQueryData(makeWithdrawalQueryOptions(orgId));
  },
});

function MakeWithdrawal() {
  const { organization } = Route.useRouteContext();

  if (!organization) {
    return null;
  }

  const { data } = useSuspenseQuery(makeWithdrawalQueryOptions(organization.id));

  return (
    <MakeWithdrawalComponent
      withdrawalAccounts={data.withdrawalAccounts}
      availableBalance={data.availableBalance}
      currency={data.currency}
      organizationSlug={organization.slug}
    />
  );
}
