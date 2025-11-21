import { queryOptions } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import ms from "ms";
import { retrieveDashboardDataFromServer } from "@/features/org-dashboard/org-dashboard-loaders";

const dashboardQueryOptions = (orgId: string) =>
  queryOptions({
    queryKey: ["dashboard", orgId],
    queryFn: () => retrieveDashboardDataFromServer(),
    staleTime: ms("1 minute"),
  });

export const Route = createFileRoute("/o/$orgId/")({
  loader: async ({ context }) => {
    const orgId = context.organization?.id;

    if (!orgId) {
      throw new Error("Organization context is required");
    }

    const data = await context.queryClient.ensureQueryData(dashboardQueryOptions(orgId));

    return data;
  },
});
