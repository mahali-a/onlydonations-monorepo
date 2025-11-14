import { getAuth } from "@repo/core/auth/server";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { nanoid } from "nanoid";
import { authMiddleware } from "@/core/middleware/auth";
import { logger } from "@/lib/logger";
import { userModel } from "./models/user-model";
import { organizationSchema, phoneSchema, profileSchema } from "./onboarding-schemas";

const onboardingLogger = logger.child("onboarding-actions");

/**
 * Sanitize a string to be used as a URL slug
 */
function sanitizeSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 30);
}

export const handleProfileForm = createServerFn({ method: "POST" })
  .inputValidator(profileSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user;
    const name = `${data.firstName} ${data.lastName}`;

    await userModel.update(user.id, {
      name,
      subscribedAt: data.subscribeToUpdates ? new Date() : undefined,
    });

    return { success: true };
  });

export const handlePhoneForm = createServerFn({ method: "POST" })
  .inputValidator(phoneSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user;
    const auth = getAuth();

    await userModel.update(user.id, {
      phoneNumber: data.phoneNumber,
      phoneNumberVerified: false,
    });

    // Send OTP via Better Auth
    // @ts-expect-error - Type not inferred due to parameterized createBetterAuth config
    await auth.api.sendPhoneNumberOTP({
      body: {
        phoneNumber: data.phoneNumber,
      },
    });

    return { success: true, phoneNumber: data.phoneNumber };
  });

export const handleOrganizationForm = createServerFn({ method: "POST" })
  .inputValidator(organizationSchema)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const auth = getAuth();
    const req = getRequest();

    // Generate unique slug from organization name + random suffix
    const baseSlug = sanitizeSlug(data.organizationName);
    const slug = `${baseSlug}-${nanoid(6)}`;

    // Create organization via Better Auth
    // @ts-expect-error - Type not inferred due to parameterized createBetterAuth config
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

    // Set as active organization in session
    // @ts-expect-error - Type not inferred
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

export const createDefaultOrganization = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user;
    const auth = getAuth();
    const req = getRequest();

    try {
      // Generate unique slug from user name + random suffix
      const baseSlug = sanitizeSlug(user.name || "user");
      const slug = `${baseSlug}-${nanoid(6)}`;

      // Create organization via Better Auth
      // @ts-expect-error - Type not inferred due to parameterized createBetterAuth config
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

      // Set as active organization in session
      // @ts-expect-error - Type not inferred
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
