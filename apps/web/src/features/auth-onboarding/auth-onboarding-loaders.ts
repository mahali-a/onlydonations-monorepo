import { getAuth } from "@repo/core/auth/server";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { logger } from "@/lib/logger";
import { authMiddleware } from "@/server/middleware/auth";

const onboardingLogger = logger.createChildLogger("auth-onboarding-loaders");

type OnboardingStep = "name" | "phone" | "organization";

function getNextOnboardingStep(user: {
  name?: string | null;
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean | null;
}): OnboardingStep | null {
  if (!user?.name) {
    return "name";
  }
  if (!user?.phoneNumberVerified) {
    return "phone";
  }
  return null;
}

export const getIsOnboardingCompleteFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user;
    const auth = getAuth();
    const req = getRequest();

    let requiredStep: OnboardingStep | null = null;

    if (!user?.name) {
      requiredStep = "name";
    } else {
      try {
        // @ts-expect-error - Better Auth type inference limitation
        const organizations = await auth.api.listOrganizations({
          headers: req.headers,
        });

        if (!organizations || organizations.length === 0) {
          requiredStep = "organization";
        }
      } catch (error) {
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

export const retrieveOnboardingUserFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user;
    const auth = getAuth();
    const req = getRequest();

    const stepFromUser = getNextOnboardingStep(user);

    // Step 1: Name is required first
    if (stepFromUser === "name") {
      return { user, requiredStep: "name" as OnboardingStep };
    }

    // Step 2: Phone verification is required after name
    if (stepFromUser === "phone") {
      return { user, requiredStep: "phone" as OnboardingStep };
    }

    // Step 3: Check if user has any organizations
    try {
      // @ts-expect-error - Better Auth type inference limitation
      const organizations = await auth.api.listOrganizations({
        headers: req.headers,
      });

      if (!organizations || organizations.length === 0) {
        return { user, requiredStep: "organization" as OnboardingStep };
      }
    } catch (error) {
      onboardingLogger.error("Failed to fetch organizations", error);
      return { user, requiredStep: "organization" as OnboardingStep };
    }

    return { user, requiredStep: null };
  });
