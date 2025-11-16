import { getAuth } from "@repo/core/auth/server";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireOrganizationAccess } from "@/server/middleware/access-control";
import { authMiddleware } from "@/server/middleware/auth";

export const retrieveUserOrganizationsFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const auth = getAuth();
    const req = getRequest();

    // @ts-expect-error - Better Auth type inference limitation: when auth client is created with parametrized configuration, TypeScript loses the inferred type of API methods. This method exists at runtime and is correctly implemented.
    const organizations = await auth.api.listOrganizations({
      headers: req.headers,
    });

    return { organizations };
  });

export const retrieveOrganizationFromServerById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator((data: { organizationId: string }) => data)
  .handler(async ({ data, context }) => {
    const { organization } = await requireOrganizationAccess(data.organizationId, context.user.id);

    return { organization };
  });

export const updateActiveOrganizationOnServer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((data: { organizationId: string }) => data)
  .handler(async ({ data, context }) => {
    await requireOrganizationAccess(data.organizationId, context.user.id);

    const auth = getAuth();
    const req = getRequest();

    // @ts-expect-error - Better Auth type inference limitation: when auth client is created with parametrized configuration, TypeScript loses the inferred type of API methods. This method exists at runtime and is correctly implemented.
    await auth.api.setActiveOrganization({
      body: { organizationId: data.organizationId },
      headers: req.headers,
    });

    return { success: true };
  });
