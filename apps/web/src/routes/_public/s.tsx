import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { SearchComponent, searchFiltersSchema } from "@/features/public-search";

export const Route = createFileRoute("/_public/s")({
  validateSearch: zodValidator(searchFiltersSchema),
  component: SearchComponent,
});
