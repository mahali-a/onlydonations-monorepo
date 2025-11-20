import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PublicNavbar } from "@/components/navigation";
import { Footer } from "@/components/layout/footer";
import { Route as RootRoute } from "../__root";

export const Route = createFileRoute("/_public")({
  component: RouteComponent,
});

function RouteComponent() {
  const { settings } = RootRoute.useLoaderData();

  return (
    <div className="light min-h-screen flex flex-col">
      <PublicNavbar settings={settings} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
