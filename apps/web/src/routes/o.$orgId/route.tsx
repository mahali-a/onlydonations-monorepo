import {
  createFileRoute,
  redirect,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import ms from "ms";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  retrieveOrganizationFromServerById,
  updateActiveOrganizationOnServer,
} from "@/server/functions/organizations";
import { retrieveAccountUserFromServer } from "@/features/user-account/server";
import { authClient } from "@/lib/auth-client";
import { logger } from "@/lib/logger";
import { promiseHash } from "@/utils/promise-hash";

const orgLogger = logger.createChildLogger("org-route");

const organizationQueryOptions = (orgId: string) =>
  queryOptions({
    queryKey: ["organization", orgId],
    queryFn: () => retrieveOrganizationFromServerById({ data: { organizationId: orgId } }),
    staleTime: ms("30 minutes"),
  });

const userQueryOptions = queryOptions({
  queryKey: ["account-user"],
  queryFn: () => retrieveAccountUserFromServer(),
  staleTime: ms("30 minutes"),
});

export const Route = createFileRoute("/o/$orgId")({
  beforeLoad: async ({ params, context }) => {
    try {
      const { organizationData, user } = await promiseHash({
        organizationData: context.queryClient.ensureQueryData(
          organizationQueryOptions(params.orgId),
        ),
        user: context.queryClient.ensureQueryData(userQueryOptions),
      });

      await updateActiveOrganizationOnServer({
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
      throw redirect({ to: "/" });
    }

    return null;
  },
  component: OrganizationLayout,
});

function OrganizationLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orgId } = Route.useParams();
  const { user } = Route.useRouteContext();

  const isPreviewPage = location.pathname.includes("/campaign-previews/");

  if (isPreviewPage) {
    return <Outlet />;
  }

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
