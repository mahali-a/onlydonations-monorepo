import { createFileRoute } from "@tanstack/react-router";
import { UserAccountComponent } from "@/features/user-account";

export const Route = createFileRoute("/o/$orgId/account/")({
  component: UserAccountComponent,
});
