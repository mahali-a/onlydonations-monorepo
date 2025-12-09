import { queryOptions, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import ms from "ms";
import { z } from "zod";
import {
  OnboardingLayout,
  OrganizationForm,
  PhoneForm,
  ProfileForm,
} from "@/features/auth-onboarding";
import {
  createDefaultOrganizationOnServer,
  createOrganizationOnServer,
  retrieveOnboardingUserFromServer,
  updateUserPhoneOnServer,
  updateUserProfileOnServer,
} from "@/features/auth-onboarding/server";

const onboardingSearchSchema = z.object({
  step: z.enum(["name", "phone", "organization"]).default("name").catch("name"),
  next: z.string().default("/app").catch("/app"),
  change: z.string().optional(),
});

const onboardingUserQueryOptions = queryOptions({
  queryKey: ["onboarding-user"],
  queryFn: () => retrieveOnboardingUserFromServer(),
  staleTime: ms("2 minutes"),
});

export const Route = createFileRoute("/onboarding/")({
  validateSearch: onboardingSearchSchema,
  loaderDeps: ({ search }) => ({
    next: search.next,
    step: search.step,
    change: search.change,
  }),
  loader: async ({ deps, location, context }) => {
    const { user, requiredStep } = await context.queryClient.ensureQueryData(
      onboardingUserQueryOptions,
    );

    const isOnboardingSubRoute = location.pathname !== "/onboarding";

    if (isOnboardingSubRoute) {
      return { user, requiredStep };
    }

    // Onboarding complete - redirect to destination
    if (!requiredStep) {
      throw redirect({ to: deps.next });
    }

    // Allow changing phone number
    if (deps.change === "phone" && deps.step === "phone") {
      return { user, requiredStep };
    }

    // After name step, show phone step (optional but shown)
    if (requiredStep === "organization" && deps.step === "phone") {
      // User completed name, now on phone step - allow it
      return { user, requiredStep: "phone" };
    }

    // Allow organization step if user skipped phone
    if (requiredStep === "organization" && deps.step === "organization") {
      return { user, requiredStep };
    }

    // Redirect to required step if mismatch
    if (deps.step !== requiredStep) {
      throw redirect({
        to: "/onboarding",
        search: { step: requiredStep, next: deps.next, change: undefined },
      });
    }

    return { user, requiredStep };
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const search = Route.useSearch();
  const { step = "name" } = search;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleProfileSubmit = async (values: {
    firstName: string;
    lastName: string;
    subscribeToUpdates: boolean;
  }) => {
    const result = await updateUserProfileOnServer({ data: values });
    if (result.success) {
      // Invalidate cache so the loader fetches fresh user data
      await queryClient.invalidateQueries({ queryKey: ["onboarding-user"] });
      navigate({ to: "/onboarding", search: { step: "phone", next: "/app" } });
    }
    return null;
  };

  const handlePhoneSubmit = async (values: { phoneNumber: string }) => {
    const result = await updateUserPhoneOnServer({ data: values });
    if (result.success) {
      navigate({
        to: "/onboarding/verify",
        search: { phone: result.phoneNumber, next: "/app" },
      });
      return null;
    }
    return { error: result.error ?? "Failed to update phone number" };
  };

  const handlePhoneSkip = async () => {
    const orgResult = await createDefaultOrganizationOnServer();

    if (orgResult.success && orgResult.organizationId) {
      navigate({ to: `/o/${orgResult.organizationId}` });
    } else {
      navigate({ to: "/onboarding", search: { step: "organization", next: "/app" } });
    }
  };

  const handleOrganizationSubmit = async (values: { organizationName: string }) => {
    const result = await createOrganizationOnServer({ data: values });
    if (result.success && result.organizationId) {
      navigate({ to: `/o/${result.organizationId}` });
    }
    return null;
  };

  return (
    <OnboardingLayout step={step}>
      {step === "name" && <ProfileForm onSubmit={handleProfileSubmit} />}
      {step === "phone" && <PhoneForm onSubmit={handlePhoneSubmit} onSkip={handlePhoneSkip} />}
      {step === "organization" && (
        <OrganizationForm onSubmit={handleOrganizationSubmit} defaultName={`My Organization`} />
      )}
    </OnboardingLayout>
  );
}
