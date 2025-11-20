import { createFileRoute } from "@tanstack/react-router";
import { DiscoverComponent, discoverPageQueryOptions } from "@/features/public-discover";

export const Route = createFileRoute("/_public/discover/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(discoverPageQueryOptions(3));
  },
  component: DiscoverComponent,
});
