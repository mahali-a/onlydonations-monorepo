import type { SelectUser } from "@repo/core/types";
import { createServerFn } from "@tanstack/react-start";
import {
  authMiddleware,
  membershipMiddleware,
  organizationMiddleware,
} from "@/server/middleware/auth";

export const retrieveAuthenticatedUserFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<SelectUser> => {
    return context.user as SelectUser;
  });

export const retrieveAuthenticatedOrganizationFromServer = createServerFn({ method: "GET" })
  .middleware([organizationMiddleware])
  .handler(async ({ context }) => {
    return {
      user: context.user,
      organization: context.organization,
    };
  });

export const retrieveAuthenticatedOrgMemberFromServer = createServerFn({ method: "GET" })
  .middleware([membershipMiddleware])
  .handler(async ({ context }) => {
    return {
      user: context.user,
      organization: context.organization,
      membership: context.membership,
    };
  });
