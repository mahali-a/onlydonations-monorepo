import { createFileRoute } from "@tanstack/react-router";
import { AvatarForm, EmailForm, NameForm } from "@/features/user-account";

export const Route = createFileRoute("/o/$orgId/account/")({
  component: AccountOverview,
});

function AccountOverview() {
  const { user } = Route.useRouteContext();

  return (
    <div className="space-y-6">
      <NameForm defaultName={user?.name || ""} />
      <EmailForm defaultEmail={user?.email || ""} />
      <AvatarForm currentAvatar={user?.image || ""} userName={user?.name || "User"} />
    </div>
  );
}
