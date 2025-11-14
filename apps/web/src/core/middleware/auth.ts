import { getAuth } from "@repo/core/auth/server";
import type { SelectMember, SelectOrganization, SelectUser } from "@repo/core/database/types";
import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { memberModel } from "../models/member-model";

export const authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const auth = getAuth();
  const req = getRequest();

  const session = await auth.api.getSession({
    headers: req.headers,
    query: {
      disableCookieCache: true,
    },
  });

  if (!session?.user) {
    throw redirect({ to: "/" });
  }

  const user = session.user;

  return next({
    context: {
      user: user as SelectUser,
      userId: user.id,
      email: user.email,
      session,
      auth,
    },
  });
});

export const organizationMiddleware = createMiddleware({ type: "function" })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const auth = context.auth;
    const session = context.session;
    const req = getRequest();

    try {
      // @ts-expect-error - Type not inferred due to parameterized createBetterAuth config
      if (!session?.session?.activeOrganizationId) {
        console.error("[organizationMiddleware] No active organization ID in session", {
          userId: context.userId,
          sessionId: session?.session?.id,
        });
        await auth.api.signOut({ headers: req.headers });
        throw redirect({ to: "/" });
      }

      // @ts-expect-error - Type not inferred due to parameterized createBetterAuth config
      const organization = await auth.api.getFullOrganization({
        headers: req.headers,
        query: {
          // @ts-expect-error - Type not inferred due to parameterized createBetterAuth config
          organizationId: session.activeOrganizationId,
        },
      });

      if (!organization) {
        console.error("[organizationMiddleware] Organization not found", {
          userId: context.userId,
          // @ts-expect-error - Type not inferred
          activeOrganizationId: session.activeOrganizationId,
        });
        await auth.api.signOut({ headers: req.headers });
        throw redirect({ to: "/" });
      }

      return next({
        context: {
          organization: organization as SelectOrganization & {
            members?: SelectMember[];
          },
          organizationId: organization.id,
        },
      });
    } catch (error) {
      // Re-throw redirects - they should not be caught
      if (error && typeof error === "object" && "status" in error && error.status === 307) {
        throw error;
      }

      console.error("[organizationMiddleware] Unexpected error:", error);
      await auth.api.signOut({ headers: req.headers });
      throw redirect({ to: "/" });
    }
  });

export const membershipMiddleware = createMiddleware({ type: "function" })
  .middleware([organizationMiddleware])
  .server(async ({ next, context }) => {
    const auth = context.auth;
    const user = context.user;
    const organization = context.organization;
    const req = getRequest();

    const memberships = await memberModel.findByUserId(user.id);
    const membership = memberships.find((m) => m.organizationId === organization.id);

    if (!membership) {
      await auth.api.signOut({ headers: req.headers });
      throw redirect({ to: "/" });
    }

    return next({
      context: {
        membership: membership as SelectMember,
        role: membership.role,
      },
    });
  });

export const withAuthenticatedOrgMember = [membershipMiddleware];
