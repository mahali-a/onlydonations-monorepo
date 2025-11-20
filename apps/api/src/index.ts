import { env, WorkerEntrypoint } from "cloudflare:workers";
import { initDatabase } from "@repo/core/database/setup";
import { app } from "@/handlers";
import { handleQueueMessage } from "@/queues";
import type { EmailQueueMessage } from "@repo/email/email/schema";

export default class DataService extends WorkerEntrypoint<Env> {
  fetch(request: Request) {
    initDatabase(env.DB);
    return app.fetch(request, this.env, this.ctx);
  }

  async queue(batch: MessageBatch<EmailQueueMessage>): Promise<void> {
    initDatabase(env.DB);
    await Promise.allSettled(
      batch.messages.map((message) => handleQueueMessage(message, this.ctx)),
    );
  }
}
