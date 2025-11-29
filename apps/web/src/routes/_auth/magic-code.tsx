import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { MagicCodeComponent } from "@/features/auth-login";

const magicCodeSearchSchema = z.object({
  email: z.string(),
  next: z.string().default("/app").catch("/app"),
});

export const Route = createFileRoute("/_auth/magic-code")({
  validateSearch: magicCodeSearchSchema,
  component: () => {
    const { email, next } = Route.useSearch();
    return <MagicCodeComponent email={email} next={next} />;
  },
});
