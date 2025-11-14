import { createFileRoute, notFound, Outlet, useNavigate } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import ms from "ms";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { NotFound } from "@/components/not-found";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getOrganizationById, setActiveOrganization } from "@/core/functions/organizations";
import { getAccountUser } from "@/features/account/server";
import { authClient } from "@/lib/auth-client";
import { logger } from "@/lib/logger";
import { promiseHash } from "@/utils/promise-hash";

const orgLogger = logger.child("org-route");

const organizationQueryOptions = (orgId: string) => queryOptions({
  queryKey: ['organization', orgId],
  queryFn: () => getOrganizationById({ data: { organizationId: orgId } }),
  staleTime: ms('30 minutes'), // organization data rarely changes
});

const userQueryOptions = queryOptions({
  queryKey: ['account-user'],
  queryFn: () => getAccountUser(),
  staleTime: ms('30 minutes'), // user data rarely changes
});

export const Route = createFileRoute("/o/$orgId")({
  beforeLoad: async ({ params, context }) => {
    try {
      // Cache organization and user data
      const [organizationData, user] = await Promise.all([
        context.queryClient.ensureQueryData(organizationQueryOptions(params.orgId)),
        context.queryClient.ensureQueryData(userQueryOptions),
      ]);

      await setActiveOrganization({
        data: { organizationId: organizationData.organization.id },
      });

      return {
        organization: organizationData.organization,
        user,
      };
    } catch (error) {
      orgLogger.error("Error loading organization", error, {
        orgId: params.orgId,
      });

      return {
        organization: null,
        user: null,
      };
    }
  },
  loader: async ({ context, params }) => {
    if (!context.organization) {
      orgLogger.warn("Organization not found or access denied", { orgId: params.orgId });
      throw notFound();
    }

    return null;
  },
  notFoundComponent: () => (
    <NotFound>
      <p>This organization doesn't exist or you don't have access to it.</p>
    </NotFound>
  ),
  component: OrganizationLayout,
});

function OrganizationLayout() {
  const navigate = useNavigate();
  const { orgId } = Route.useParams();
  const { user } = Route.useRouteContext();

  const handleAccountClick = () => {
    navigate({ to: "/o/$orgId/account", params: { orgId } });
  };

  const handleLogoutClick = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: "/" });
        },
      },
    });
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        onAccountClick={handleAccountClick}
        onLogoutClick={handleLogoutClick}
        user={{
          name: user?.name || "User",
          email: user?.email || "user@example.com",
          avatar: user?.image || "/placeholder.svg",
        }}
        variant="inset"
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
