import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import ms from "ms";
import { SecuritySection } from "@/features/user-account/security";
import {
  retrieveLoginMethodFromServer,
  retrieveSessionsFromServer,
} from "@/features/user-account/security/server";
import { promiseHash } from "@/lib/promise-hash";

const sessionsQueryOptions = queryOptions({
  queryKey: ["sessions"],
  queryFn: () => retrieveSessionsFromServer(),
  staleTime: ms("2 minutes"),
});

const loginMethodQueryOptions = queryOptions({
  queryKey: ["login-method"],
  queryFn: () => retrieveLoginMethodFromServer(),
  staleTime: ms("30 minutes"),
});

export const Route = createFileRoute("/o/$orgId/account/security")({
  loader: async ({ context }) => {
    await promiseHash({
      sessions: context.queryClient.ensureQueryData(sessionsQueryOptions),
      loginMethod: context.queryClient.ensureQueryData(loginMethodQueryOptions),
    });
  },
  component: SecuritySettings,
});

function SecuritySettings() {
  const { data: sessions } = useSuspenseQuery(sessionsQueryOptions);
  const { data: loginMethod } = useSuspenseQuery(loginMethodQueryOptions);

  return <SecuritySection sessions={sessions} loginMethod={loginMethod} />;
}
