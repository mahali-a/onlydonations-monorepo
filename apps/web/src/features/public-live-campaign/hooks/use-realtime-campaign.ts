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
      onOpen: () => console.log("[Realtime] Connected", { campaignId }),
      onClose: () => console.log("[Realtime] Disconnected", { campaignId }),
      onError: (error) => console.error("[Realtime] Error", error),
    },
    enabled,
  );

  const handleMessage = useCallback(
    (message: RealtimeMessage) => {
      console.log("[Realtime] Message received:", message);

      switch (message.type) {
        case "DONATION_SUCCESS": {
          // If this is for the current user's donation, trigger callback
          if (donationId && message.donationId === donationId) {
            onDonationSuccess?.(message.donationId);
          }

          // Invalidate donation status query
          queryClient.invalidateQueries({
            queryKey: ["donation-status", message.donationId],
          });

          // Invalidate campaign queries
          if (slug) {
            queryClient.invalidateQueries({
              queryKey: ["live-campaign", slug],
            });
          }

          // Invalidate live donations feed
          queryClient.invalidateQueries({
            queryKey: ["live-donations", message.campaignId],
          });

          break;
        }

        case "CAMPAIGN_UPDATED": {
          // Invalidate all campaign-related queries
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

        default:
          console.warn("[Realtime] Unknown message type:", message);
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
        console.error("[Realtime] Failed to parse message:", error);
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
