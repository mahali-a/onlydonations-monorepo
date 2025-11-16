import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import ms from "ms";
import { SecuritySection } from "@/features/security";
import {
  retrieveLoginMethodFromServer,
  retrieveSessionsFromServer,
} from "@/features/security/server";
import { promiseHash } from "@/utils/promise-hash";

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
