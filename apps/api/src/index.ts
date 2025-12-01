import { env } from "cloudflare:workers";
import { initDatabase } from "@repo/core/database/setup";
import type { EmailQueueMessage } from "@repo/email/email/schema";
import { initEmail } from "@repo/email/email/setup";
import * as Sentry from "@sentry/cloudflare";
import { app } from "@/handlers";
import { validateApiEnv } from "@/lib/env";
import { handleQueueMessage } from "@/queues";

export { CampaignTracker } from "@/durable-objects/campaign-tracker";

export default Sentry.withSentry(
  (env: Cloudflare.Env) => ({
    dsn: env.SENTRY_DSN,
    release: env.CF_VERSION_METADATA?.id,
    environment: env.ENVIRONMENT,
    enabled: env.ENVIRONMENT !== "development",
    enableLogs: true,
    tracesSampleRate: 1.0,
    sendDefaultPii: true,
  }),
  {
    async fetch(request: Request, workerEnv: Cloudflare.Env, ctx: ExecutionContext) {
      validateApiEnv(env);
      initDatabase(env.DB);
      initEmail(env.RESEND_API_KEY, env.EMAIL_FROM);
      return app.fetch(request, workerEnv, ctx);
    },

    async queue(batch: MessageBatch, _workerEnv: Cloudflare.Env, ctx: ExecutionContext) {
      validateApiEnv(env);
      initDatabase(env.DB);
      initEmail(env.RESEND_API_KEY, env.EMAIL_FROM);
      await Promise.allSettled(
        batch.messages.map((message) =>
          handleQueueMessage(message as Message<EmailQueueMessage>, ctx),
        ),
      );
    },
  },
);
