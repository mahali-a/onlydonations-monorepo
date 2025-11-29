import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { MagicCodeComponent } from "@/features/auth-login";

const magicCodeSearchSchema = z.object({
  email: z.string(),
  next: fallback(z.string(), "/app"),
});

export const Route = createFileRoute("/_auth/magic-code")({
  validateSearch: zodValidator(magicCodeSearchSchema),
  component: () => {
    const { email, next } = Route.useSearch();
    return <MagicCodeComponent email={email} next={next} />;
  },
});
