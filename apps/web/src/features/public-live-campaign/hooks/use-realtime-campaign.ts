import * as Sentry from "@sentry/tanstackstart-react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { getWebSocketConnectionUrlFromServer } from "@/lib/websocket-url";

type RealtimeMessage =
  | { type: "CAMPAIGN_UPDATED"; campaignId: string }
  | { type: "DONATION_SUCCESS"; donationId: string; campaignId: string };

interface UseRealtimeCampaignOptions {
  campaignId: string;
  slug?: string;
  donationId?: string;
  enabled?: boolean;
  onDonationSuccess?: (donationId: string) => void;
}

/**
 * Real-time campaign updates hook
 * Connects to CampaignTracker Durable Object via WebSocket
 * Automatically invalidates TanStack Query caches on donation success
 */
export function useRealtimeCampaign({
  campaignId,
  slug,
  donationId,
  enabled = true,
  onDonationSuccess,
}: UseRealtimeCampaignOptions) {
  const queryClient = useQueryClient();

  const { data: urlData } = useSuspenseQuery({
    queryKey: ["websocket-url"],
    queryFn: () => getWebSocketConnectionUrlFromServer(),
    staleTime: Number.POSITIVE_INFINITY, // URL never changes during session
  });

  const socketUrl = `${urlData.wsUrl}/campaigns/${campaignId}/ws`;

  const { lastMessage, readyState } = useWebSocket(
    socketUrl,
    {
      shouldReconnect: () => enabled,
      reconnectInterval: 3000,
      reconnectAttempts: 10,
      share: true,
    },
    enabled,
  );

  const handleMessage = useCallback(
    (message: RealtimeMessage) => {
      switch (message.type) {
        case "DONATION_SUCCESS": {
          if (donationId && message.donationId === donationId) {
            onDonationSuccess?.(message.donationId);
          }

          queryClient.invalidateQueries({
            queryKey: ["donation-status", message.donationId],
          });

          if (slug) {
            queryClient.invalidateQueries({
              queryKey: ["live-campaign", slug],
            });
          }

          queryClient.invalidateQueries({
            queryKey: ["live-donations", message.campaignId],
          });

          break;
        }

        case "CAMPAIGN_UPDATED": {
          if (slug) {
            queryClient.invalidateQueries({
              queryKey: ["live-campaign", slug],
            });
          }

          queryClient.invalidateQueries({
            queryKey: ["live-donations", message.campaignId],
          });

          break;
        }
      }
    },
    [queryClient, slug, donationId, onDonationSuccess],
  );

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const message = JSON.parse(lastMessage.data) as RealtimeMessage;
        handleMessage(message);
      } catch (error) {
        Sentry.captureException(error, { extra: { data: lastMessage.data } });
      }
    }
  }, [lastMessage, handleMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Connected",
    [ReadyState.CLOSING]: "Disconnecting",
    [ReadyState.CLOSED]: "Disconnected",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return {
    connectionStatus,
    readyState,
    isConnected: readyState === ReadyState.OPEN,
  };
}
