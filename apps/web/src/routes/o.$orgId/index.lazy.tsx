import { createLazyFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/features/org-dashboard/org-dashboard-component";

export const Route = createLazyFileRoute("/o/$orgId/")({
  component: DashboardPage,
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
