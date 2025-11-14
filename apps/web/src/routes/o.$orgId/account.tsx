import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/o/$orgId/account")({
  component: AccountLayout,
});

function AccountLayout() {
  const { orgId } = Route.useParams();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const currentTab = pathname.endsWith("/security")
    ? "security"
    : pathname.endsWith("/kyc")
      ? "kyc"
      : "account";

  return (
    <div className="container mx-auto px-4 lg:px-8 pt-6 w-full h-full space-y-6 bg-background">
      <div className="w-full flex flex-col md:flex-row items-start md:items-center gap-4 md:justify-between">
        <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Account & Security</h1>
          <p className="text-muted-foreground">
            Manage your account settings, security options, and verification.
          </p>
        </div>
      </div>

      <Tabs className="space-y-6" value={currentTab}>
        <TabsList>
          <TabsTrigger asChild value="account">
            <Link to="/o/$orgId/account" params={{ orgId }}>
              Account
            </Link>
          </TabsTrigger>
          <TabsTrigger asChild value="security">
            <Link to="/o/$orgId/account/security" params={{ orgId }}>
              Security
            </Link>
          </TabsTrigger>
          <TabsTrigger asChild value="kyc">
            <Link to="/o/$orgId/account/kyc" params={{ orgId }}>
              KYC
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value={currentTab}>
          <Outlet />
        </TabsContent>
      </Tabs>
    </div>
  );
}
