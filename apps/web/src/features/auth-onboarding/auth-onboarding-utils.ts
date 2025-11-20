import type { SelectUser } from "@repo/core/database/types";

type OnboardingStep = "name" | "phone";

export function retrieveRequiredOnboardingStep(user: SelectUser): OnboardingStep | null {
  if (!user?.name) return "name";
  if (!user?.phoneNumber) return "phone";
  return null;
}

export function isOnboardingComplete(user: SelectUser): boolean {
  return retrieveRequiredOnboardingStep(user) === null;
}
