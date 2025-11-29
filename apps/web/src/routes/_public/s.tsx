import { createFileRoute } from "@tanstack/react-router";
import { SearchComponent, searchFiltersSchema } from "@/features/public-search";

export const Route = createFileRoute("/_public/s")({
  validateSearch: searchFiltersSchema,
  component: SearchComponent,
});
