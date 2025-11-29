import { createFileRoute, redirect } from "@tanstack/react-router";
import { getIsOnboardingCompleteFromServer } from "@/features/auth-onboarding/server";
import { logger } from "@/lib/logger";
import { retrieveUserOrganizationsFromServer } from "@/server/functions/organizations";

const appRouterLogger = logger.createChildLogger("app-router");

export const Route = createFileRoute("/app/")({
  loader: async () => {
    const { requiredStep } = await getIsOnboardingCompleteFromServer();

    if (requiredStep) {
      throw redirect({
        to: "/onboarding",
        search: { step: requiredStep, next: "/app" },
      });
    }

    try {
      const { organizations } = await retrieveUserOrganizationsFromServer();

      if (organizations && organizations.length > 0) {
        const firstOrg = organizations[0];
        if (firstOrg) {
          throw redirect({ to: `/o/$orgId`, params: { orgId: firstOrg.id } });
        }
      }

      throw redirect({
        to: "/onboarding",
        search: { step: "name", next: "/app" },
      });
    } catch (error) {
      if (error && typeof error === "object" && "headers" in error) {
        throw error;
      }

      appRouterLogger.error("Error fetching organizations", error);
      throw redirect({
        to: "/onboarding",
        search: { step: "name", next: "/app" },
      });
    }
  },
  component: () => null,
});
