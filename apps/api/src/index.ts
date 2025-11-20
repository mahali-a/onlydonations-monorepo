import { env, WorkerEntrypoint } from "cloudflare:workers";
import { initDatabase } from "@repo/core/database/setup";
import { initEmail } from "@repo/email/email/setup";
import { app } from "@/handlers";
import { handleQueueMessage } from "@/queues";
import type { EmailQueueMessage } from "@repo/email/email/schema";

export default class DataService extends WorkerEntrypoint<Env> {
  fetch(request: Request) {
    initDatabase(env.DB);
    initEmail(env.RESEND_API_KEY, env.EMAIL_FROM);
    return app.fetch(request, this.env, this.ctx);
  }

  async queue(batch: MessageBatch<EmailQueueMessage>): Promise<void> {
    initDatabase(env.DB);
    initEmail(env.RESEND_API_KEY, env.EMAIL_FROM);
    await Promise.allSettled(
      batch.messages.map((message) => handleQueueMessage(message, this.ctx)),
    );
  }
}
