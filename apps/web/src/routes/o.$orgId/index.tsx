import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import ms from "ms";
import { retrieveDashboardDataFromServer } from "@/features/org-dashboard/dashboard-loaders";
import { Dashboard } from "@/features/org-dashboard/dashboard";

const dashboardQueryOptions = (orgId: string) =>
  queryOptions({
    queryKey: ["dashboard", orgId],
    queryFn: () => retrieveDashboardDataFromServer(),
    staleTime: ms("1 minute"),
  });

export const Route = createFileRoute("/o/$orgId/")({
  component: DashboardPage,
  beforeLoad: async ({ context }) => {
    const orgId = context.organization?.id;

    if (!orgId) {
      throw new Error("Organization context is required");
    }

    const data = await context.queryClient.ensureQueryData(dashboardQueryOptions(orgId));

    return {
      dashboardData: data,
    };
  },
  loader: async ({ context }) => {
    const orgId = context.organization?.id;

    if (!orgId) {
      throw new Error("Organization context is required");
    }

    const data = await context.queryClient.ensureQueryData(dashboardQueryOptions(orgId));

    return data;
  },
});

function DashboardPage() {
  const data = Route.useLoaderData();
  const { user } = Route.useRouteContext();

  return (
    <Dashboard
      user={user}
      allTimeStats={data.allTimeStats}
      currentMonthTotal={data.currentMonthTotal}
      previousMonthTotal={data.previousMonthTotal}
      recentDonations={data.recentDonations}
      topCampaigns={data.topCampaigns}
      chartData={data.chartData}
    />
  );
}
