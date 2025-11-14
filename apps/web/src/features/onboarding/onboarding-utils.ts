import type { SelectUser } from "@repo/core/database/types";

export type OnboardingStep = "name" | "phone";

export function getRequiredOnboardingStep(user: SelectUser): OnboardingStep | null {
  if (!user?.name) return "name";
  if (!user?.phoneNumber) return "phone";
  return null;
}

export function isOnboardingComplete(user: SelectUser): boolean {
  return getRequiredOnboardingStep(user) === null;
}
