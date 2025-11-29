import { env, WorkerEntrypoint } from "cloudflare:workers";
import { initDatabase } from "@repo/core/database/setup";
import type { EmailQueueMessage } from "@repo/email/email/schema";
import { initEmail } from "@repo/email/email/setup";
import { app } from "@/handlers";
import { validateApiEnv } from "@/lib/env";
import { handleQueueMessage } from "@/queues";

export { CampaignTracker } from "@/durable-objects/campaign-tracker";

export default class DataService extends WorkerEntrypoint {
  fetch(request: Request) {
    validateApiEnv(env);
    initDatabase(env.DB);
    initEmail(env.RESEND_API_KEY, env.EMAIL_FROM);
    return app.fetch(request, this.env, this.ctx);
  }

  async queue(batch: MessageBatch<EmailQueueMessage>): Promise<void> {
    validateApiEnv(env);
    initDatabase(env.DB);
    initEmail(env.RESEND_API_KEY, env.EMAIL_FROM);
    await Promise.allSettled(
      batch.messages.map((message) => handleQueueMessage(message, this.ctx)),
    );
  }
}
