import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { generateLoginHoneypotFromServer, LoginComponent } from "@/features/auth-login";

const loginSearchSchema = z.object({
  next: z.string().default("/app").catch("/app"),
});

export const Route = createFileRoute("/_auth/login")({
  validateSearch: loginSearchSchema,
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
