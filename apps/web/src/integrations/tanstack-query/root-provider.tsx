import { retrieveSettingsFromServer } from "@/server/functions/cms";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ms from "ms";

export async function getContext() {
  const settings = await retrieveSettingsFromServer();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: ms("1 minute"),
      },
    },
  });
  return {
    settings,
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
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
