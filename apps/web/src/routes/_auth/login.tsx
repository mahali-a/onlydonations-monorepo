import { createFileRoute, redirect } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { generateLoginHoneypotFromServer } from "@/features/login";
import { LoginComponent } from "@/features/login/login-component";

const loginSearchSchema = z.object({
  next: fallback(z.string(), "/app").default("/app"),
});

export const Route = createFileRoute("/_auth/login")({
  validateSearch: zodValidator(loginSearchSchema),
  loader: async ({ context }) => {
    if (context.user) {
      throw redirect({ to: "/app" });
    }

    const honeypotProps = await generateLoginHoneypotFromServer();
    return { honeypotProps };
  },
  component: LoginPage,
});

function LoginPage() {
  const { next } = Route.useSearch();
  const { honeypotProps } = Route.useLoaderData();

  return <LoginComponent next={next} honeypotProps={honeypotProps} />;
}
