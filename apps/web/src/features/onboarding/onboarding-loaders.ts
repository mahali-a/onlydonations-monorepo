import { getAuth } from "@repo/core/auth/server";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { authMiddleware } from "@/server/middleware/auth";
import { logger } from "@/lib/logger";

const onboardingLogger = logger.createChildLogger("onboarding-loaders");

type OnboardingStep = "name" | "phone" | "organization";

export const getIsOnboardingCompleteFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user;
    const auth = getAuth();
    const req = getRequest();

    let requiredStep: OnboardingStep | null = null;

    if (!user?.name) {
      requiredStep = "name";
    } else if (!user?.phoneNumber || !user?.phoneNumberVerified) {
      requiredStep = "phone";
    } else {
      try {
        // @ts-expect-error - Better Auth type inference limitation: when auth client is created with parametrized configuration, TypeScript loses the inferred type of API methods. This method exists at runtime and is correctly implemented.
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

    let requiredStep: OnboardingStep | null = null;

    if (!user?.name) {
      requiredStep = "name";
    } else if (!user?.phoneNumber || !user?.phoneNumberVerified) {
      requiredStep = "phone";
    } else {
      try {
        // @ts-expect-error - Better Auth type inference limitation: when auth client is created with parametrized configuration, TypeScript loses the inferred type of API methods. This method exists at runtime and is correctly implemented.
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

    return { user, requiredStep };
  });
