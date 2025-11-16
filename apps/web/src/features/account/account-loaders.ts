import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/server/middleware/auth";

export const retrieveAccountUserFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return context.user;
  });
