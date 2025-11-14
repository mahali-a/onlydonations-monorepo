import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUserOrganizations } from "@/core/functions/organizations";
import { checkOnboardingStatus } from "@/features/onboarding/server";
import { logger } from "@/lib/logger";

const appRouterLogger = logger.child("app-router");

export const Route = createFileRoute("/app/")({
  loader: async () => {
    const { requiredStep } = await checkOnboardingStatus();

    if (requiredStep) {
      throw redirect({
        to: "/onboarding",
        search: { step: requiredStep, next: "/app" },
      });
    }

    try {
      const { organizations } = await getUserOrganizations();

      if (organizations && organizations.length > 0) {
        const firstOrg = organizations[0];
        throw redirect({ to: `/o/$orgId`, params: { orgId: firstOrg.id } });
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
