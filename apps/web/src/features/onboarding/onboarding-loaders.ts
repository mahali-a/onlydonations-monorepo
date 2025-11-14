import { getAuth } from "@repo/core/auth/server";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { authMiddleware } from "@/core/middleware/auth";
import { logger } from "@/lib/logger";

const onboardingLogger = logger.child("onboarding-loaders");

export type OnboardingStep = "name" | "phone" | "organization";

export const checkOnboardingStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user;
    const auth = getAuth();
    const req = getRequest();

    // Determine required step
    let requiredStep: OnboardingStep | null = null;

    if (!user?.name) {
      requiredStep = "name";
    } else if (!user?.phoneNumber || !user?.phoneNumberVerified) {
      requiredStep = "phone";
    } else {
      // Check if user has any organizations
      try {
        // @ts-expect-error - Type not inferred
        const organizations = await auth.api.listOrganizations({
          headers: req.headers,
        });

        if (!organizations || organizations.length === 0) {
          requiredStep = "organization";
        }
      } catch (error) {
        // If we can't fetch orgs, assume they need to create one
        onboardingLogger.error("Failed to fetch organizations for onboarding check", error);
        requiredStep = "organization";
      }
    }

    return {
      user,
      requiredStep,
      isComplete: !requiredStep,
    };
  });

export const getOnboardingUser = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user;
    const auth = getAuth();
    const req = getRequest();

    // Determine required step
    let requiredStep: OnboardingStep | null = null;

    if (!user?.name) {
      requiredStep = "name";
    } else if (!user?.phoneNumber || !user?.phoneNumberVerified) {
      requiredStep = "phone";
    } else {
      // Check if user has any organizations
      try {
        // @ts-expect-error - Type not inferred
        const organizations = await auth.api.listOrganizations({
          headers: req.headers,
        });

        if (!organizations || organizations.length === 0) {
          requiredStep = "organization";
        }
      } catch (error) {
        // If we can't fetch orgs, assume they need to create one
        onboardingLogger.error("Failed to fetch organizations for onboarding check", error);
        requiredStep = "organization";
      }
    }

    return { user, requiredStep };
  });
