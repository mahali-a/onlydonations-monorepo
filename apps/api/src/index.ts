import { WorkerEntrypoint } from "cloudflare:workers";
import { app } from "@/hono/app";
import { handleQueueMessage } from "@/queues";
import type { EmailQueueMessage } from "@repo/email/email/schema";

export default class DataService extends WorkerEntrypoint<Env> {
  fetch(request: Request) {
    return app.fetch(request, this.env, this.ctx);
  }

  /**
   * Email queue consumer
   * Routes messages based on their type field
   */
  async queue(batch: MessageBatch<EmailQueueMessage>): Promise<void> {
    await Promise.allSettled(
      batch.messages.map((message) =>
        handleQueueMessage(message, this.env as unknown as Record<string, unknown>, this.ctx),
      ),
    );
  }
}
