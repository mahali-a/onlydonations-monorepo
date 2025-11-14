import type { SelectUser } from "@repo/core/types";
import { createServerFn } from "@tanstack/react-start";
import {
  authMiddleware,
  membershipMiddleware,
  organizationMiddleware,
} from "@/core/middleware/auth";

export const getAuthenticatedUser = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<SelectUser> => {
    return context.user as SelectUser;
  });

export const getAuthenticatedOrganization = createServerFn({ method: "GET" })
  .middleware([organizationMiddleware])
  .handler(async ({ context }) => {
    return {
      user: context.user,
      organization: context.organization,
    };
  });

export const getAuthenticatedOrgMember = createServerFn({ method: "GET" })
  .middleware([membershipMiddleware])
  .handler(async ({ context }) => {
    return {
      user: context.user,
      organization: context.organization,
      membership: context.membership,
    };
  });
