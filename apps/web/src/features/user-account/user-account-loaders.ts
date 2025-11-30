import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import ms from "ms";
import { authMiddleware } from "@/server/middleware/auth";

export const retrieveAccountUserFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return context.user;
  });

export const accountUserQueryOptions = queryOptions({
  queryKey: ["account-user"],
  queryFn: () => retrieveAccountUserFromServer(),
  staleTime: ms("30 minutes"),
});
