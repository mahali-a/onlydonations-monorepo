import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import ms from "ms";
import { z } from "zod";
import { OnboardingLayout, OrganizationForm, PhoneForm, ProfileForm } from "@/features/onboarding";
import {
  retrieveOnboardingUserFromServer,
  createOrganizationOnServer,
  updateUserPhoneOnServer,
  updateUserProfileOnServer,
} from "@/features/onboarding/server";

const onboardingSearchSchema = z.object({
  step: fallback(z.enum(["name", "phone", "organization"]), "name").default("name"),
  next: fallback(z.string(), "/app").default("/app"),
  change: z.string().optional(),
});

const onboardingUserQueryOptions = queryOptions({
  queryKey: ["onboarding-user"],
  queryFn: () => retrieveOnboardingUserFromServer(),
  staleTime: ms("2 minutes"),
});

export const Route = createFileRoute("/onboarding/")({
  validateSearch: zodValidator(onboardingSearchSchema),
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

    if (!requiredStep) {
      throw redirect({ to: deps.next });
    }

    if (deps.change === "phone" && deps.step === "phone") {
      return { user, requiredStep };
    }

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

  const handleProfileSubmit = async (values: {
    firstName: string;
    lastName: string;
    subscribeToUpdates: boolean;
  }) => {
    const result = await updateUserProfileOnServer({ data: values });
    if (result.success) {
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
    }
    return null;
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
      {step === "phone" && <PhoneForm onSubmit={handlePhoneSubmit} />}
      {step === "organization" && (
        <OrganizationForm onSubmit={handleOrganizationSubmit} defaultName={`My Organization`} />
      )}
    </OnboardingLayout>
  );
}
