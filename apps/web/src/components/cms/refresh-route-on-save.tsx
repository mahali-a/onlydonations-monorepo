import { RefreshRouteOnSave as PayloadLivePreview } from "@payloadcms/live-preview-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

export function RefreshRouteOnSave({ cmsApiUrl }: { cmsApiUrl: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <PayloadLivePreview
      refresh={() => {
        queryClient.invalidateQueries({ queryKey: ["cms-page"] });
        router.invalidate();
      }}
      serverURL={cmsApiUrl.replace("/api", "")}
    />
  );
}
