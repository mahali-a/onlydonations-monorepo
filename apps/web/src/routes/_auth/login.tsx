import { createFileRoute, redirect } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { generateLoginHoneypotFromServer, LoginComponent } from "@/features/auth-login";

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
  component: () => {
    const { next } = Route.useSearch();
    const { honeypotProps } = Route.useLoaderData();
    return <LoginComponent next={next} honeypotProps={honeypotProps} />;
  },
});
