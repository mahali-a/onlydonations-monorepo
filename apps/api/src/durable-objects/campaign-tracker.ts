import { DurableObject } from "cloudflare:workers";

type RealtimeMessage =
  | { type: "CAMPAIGN_UPDATED"; campaignId: string }
  | { type: "DONATION_SUCCESS"; donationId: string; campaignId: string };

/**
 * CampaignTracker Durable Object
 * Manages WebSocket connections for real-time campaign updates using hibernation
 */
export class CampaignTracker extends DurableObject<Cloudflare.Env> {
  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade");

    if (upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.ctx.acceptWebSocket(server);

    console.log("[CampaignTracker] Connection established", {
      connections: this.ctx.getWebSockets().length,
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(_ws: WebSocket, message: string | ArrayBuffer) {
    console.log("[CampaignTracker] Client message", {
      type: typeof message === "string" ? "text" : "binary",
    });
  }

  webSocketClose(_ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    console.log("[CampaignTracker] Connection closed", {
      code,
      reason,
      wasClean,
      connections: this.ctx.getWebSockets().length,
    });
  }

  webSocketError(_ws: WebSocket, error: unknown) {
    console.error("[CampaignTracker] WebSocket error", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  /**
   * Broadcast donation success to all connected clients (RPC method)
   */
  broadcastDonation(donationId: string, campaignId: string) {
    return this.broadcast({
      type: "DONATION_SUCCESS",
      donationId,
      campaignId,
    });
  }

  /**
   * Broadcast campaign update to all connected clients (RPC method)
   */
  broadcastCampaignUpdate(campaignId: string) {
    return this.broadcast({
      type: "CAMPAIGN_UPDATED",
      campaignId,
    });
  }

  /**
   * Internal method to broadcast a message to all connected WebSockets
   */
  private broadcast(message: RealtimeMessage) {
    const sockets = this.ctx.getWebSockets();
    const payload = JSON.stringify(message);

    console.log("[CampaignTracker] Broadcasting", {
      type: message.type,
      recipients: sockets.length,
    });

    for (const socket of sockets) {
      try {
        socket.send(payload);
      } catch (error) {
        console.error("[CampaignTracker] Send failed", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { success: true, recipients: sockets.length };
  }
}
