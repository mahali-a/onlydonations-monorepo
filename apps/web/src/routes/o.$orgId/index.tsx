import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/o/$orgId/")({
  component: DashboardPage,
});

function DashboardPage() {
  return <div className="space-y-6"></div>;
}
