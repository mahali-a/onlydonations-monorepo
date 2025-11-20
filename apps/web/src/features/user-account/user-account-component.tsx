import { useRouteContext } from "@tanstack/react-router";
import { AvatarForm } from "./ui/avatar-form";
import { EmailForm } from "./ui/email-form";
import { NameForm } from "./ui/name-form";

export function UserAccountComponent() {
  const { user } = useRouteContext({ strict: false });

  return (
    <div className="space-y-6">
      <NameForm defaultName={user?.name || ""} />
      <EmailForm defaultEmail={user?.email || ""} />
      <AvatarForm currentAvatar={user?.image || ""} userName={user?.name || "User"} />
    </div>
  );
}
