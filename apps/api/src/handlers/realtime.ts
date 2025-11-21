import { Hono } from "hono";

const realtime = new Hono<{ Bindings: Env }>();

/**
 * WebSocket upgrade endpoint for campaign real-time updates
 * Connects clients to CampaignTracker Durable Object for live donation feeds
 */
realtime.get("/campaigns/:campaignId/ws", async (c) => {
  const { campaignId } = c.req.param();

  const upgradeHeader = c.req.header("Upgrade");
  if (upgradeHeader !== "websocket") {
    return c.json({ error: "Expected WebSocket upgrade" }, 426);
  }

  console.log("[Realtime] Upgrade request", { campaignId });

  const id = c.env.CAMPAIGN_TRACKER.idFromName(campaignId);
  const tracker = c.env.CAMPAIGN_TRACKER.get(id);

  return tracker.fetch(c.req.raw);
});

export default realtime;
