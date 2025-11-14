import { getAuth } from "@repo/core/auth/server";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireOrganizationAccess } from "@/core/middleware/access-control";
import { authMiddleware } from "@/core/middleware/auth";

/**
 * Server function to get user's organizations
 */
export const getUserOrganizations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const auth = getAuth();
    const req = getRequest();

    // @ts-expect-error - Type not inferred
    const organizations = await auth.api.listOrganizations({
      headers: req.headers,
    });

    return { organizations };
  });

/**
 * Server function to get organization by ID
 * Validates user has access using orgId from params (source of truth)
 */
export const getOrganizationById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator((data: { organizationId: string }) => data)
  .handler(async ({ data, context }) => {
    // Use helper to validate access - single source of truth from params!
    const { organization } = await requireOrganizationAccess(data.organizationId, context.user.id);

    return { organization };
  });

/**
 * Server function to set active organization
 */
export const setActiveOrganization = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((data: { organizationId: string }) => data)
  .handler(async ({ data }) => {
    const auth = getAuth();
    const req = getRequest();

    // @ts-expect-error - Type not inferred
    await auth.api.setActiveOrganization({
      body: { organizationId: data.organizationId },
      headers: req.headers,
    });

    return { success: true };
  });
