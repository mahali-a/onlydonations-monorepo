import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/core/middleware/auth";

export const getAccountUser = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return context.user;
  });
