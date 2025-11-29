import { getAuth } from "@repo/core/auth/server";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { nanoid } from "nanoid";
import { logger } from "@/lib/logger";
import { authMiddleware } from "@/server/middleware/auth";
import { updateOnboardingUserInDatabase } from "./auth-onboarding-models";
import { organizationSchema, phoneSchema, profileSchema } from "./auth-onboarding-schema";

const onboardingLogger = logger.createChildLogger("auth-onboarding-actions");

function sanitizeSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 30);
}

export const updateUserProfileOnServer = createServerFn({ method: "POST" })
  .inputValidator(profileSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user;
    const name = `${data.firstName} ${data.lastName}`;

    await updateOnboardingUserInDatabase(user.id, {
      name,
    });

    return { success: true };
  });

export const updateUserPhoneOnServer = createServerFn({ method: "POST" })
  .inputValidator(phoneSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user;
    const auth = getAuth();

    await updateOnboardingUserInDatabase(user.id, {
      phoneNumber: data.phoneNumber,
      phoneNumberVerified: false,
    });

    // @ts-expect-error - Better Auth type inference limitation: when auth client is created with parametrized configuration, TypeScript loses the inferred type of API methods. This method exists at runtime and is correctly implemented.
    await auth.api.sendPhoneNumberOTP({
      body: {
        phoneNumber: data.phoneNumber,
      },
    });

    return { success: true, phoneNumber: data.phoneNumber };
  });

export const createOrganizationOnServer = createServerFn({ method: "POST" })
  .inputValidator(organizationSchema)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const auth = getAuth();
    const req = getRequest();

    const baseSlug = sanitizeSlug(data.organizationName);
    const slug = `${baseSlug}-${nanoid(6)}`;

    // @ts-expect-error - Better Auth type inference limitation: when auth client is created with parametrized configuration, TypeScript loses the inferred type of API methods. This method exists at runtime and is correctly implemented.
    const organization = await auth.api.createOrganization({
      body: {
        name: data.organizationName,
        slug,
      },
      headers: req.headers,
    });

    if (!organization) {
      throw new Error("Failed to create organization");
    }

    // @ts-expect-error - Better Auth type inference limitation: when auth client is created with parametrized configuration, TypeScript loses the inferred type of API methods. This method exists at runtime and is correctly implemented.
    await auth.api.setActiveOrganization({
      body: { organizationId: organization.id },
      headers: req.headers,
    });

    return {
      success: true,
      slug: organization.slug,
      organizationId: organization.id,
    };
  });

export const createDefaultOrganizationOnServer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user;
    const auth = getAuth();
    const req = getRequest();

    try {
      const baseSlug = sanitizeSlug(user.name || "user");
      const slug = `${baseSlug}-${nanoid(6)}`;

      // @ts-expect-error - Better Auth type inference limitation: when auth client is created with parametrized configuration, TypeScript loses the inferred type of API methods. This method exists at runtime and is correctly implemented.
      const organization = await auth.api.createOrganization({
        body: {
          name: `${user.name}'s Organization`,
          slug,
        },
        headers: req.headers,
      });

      if (!organization) {
        throw new Error("Failed to create organization");
      }

      // @ts-expect-error - Better Auth type inference limitation: when auth client is created with parametrized configuration, TypeScript loses the inferred type of API methods. This method exists at runtime and is correctly implemented.
      await auth.api.setActiveOrganization({
        body: { organizationId: organization.id },
        headers: req.headers,
      });

      return {
        success: true,
        slug: organization.slug,
        organizationId: organization.id,
      };
    } catch (error) {
      onboardingLogger.error("Failed to create organization", error, {
        userId: user.id,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });
