import { env } from "cloudflare:workers";

/**
 * Broadcast donation success to all connected clients via CampaignTracker Durable Object
 * Call this whenever a donation status changes to SUCCESS
 *
 * @param env - Worker environment bindings
 * @param campaignId - Campaign ID receiving the donation
 * @param donationId - Donation ID that succeeded
 * @param ctx - Optional ExecutionContext for non-blocking broadcast
 */
export async function broadcastDonationSuccess(
  campaignId: string,
  donationId: string,
  ctx?: ExecutionContext,
): Promise<void> {
  const broadcast = async () => {
    try {
      const id = env.CAMPAIGN_TRACKER.idFromName(campaignId);
      const tracker = env.CAMPAIGN_TRACKER.get(id);

      await tracker.broadcastDonation(donationId, campaignId);

      console.log("[Broadcast] Donation success sent", {
        campaignId,
        donationId,
      });
    } catch (error) {
      console.error("[Broadcast] Failed to send", {
        campaignId,
        donationId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  if (ctx) {
    ctx.waitUntil(broadcast());
  } else {
    await broadcast();
  }
}
