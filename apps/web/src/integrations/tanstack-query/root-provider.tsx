import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ms from "ms";

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Disable automatic refetching to prevent issues during SSR
        staleTime: ms('1 minute'),
      },
    },
  });
  return {
    queryClient,
  };
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
