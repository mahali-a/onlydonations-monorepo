import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PublicNavbar } from "@/components/navigation/public-navbar";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const { settings } = Route.useRouteContext();

  return (
    <>
      <PublicNavbar settings={settings ?? null} />
      <Outlet />
    </>
  );
}
