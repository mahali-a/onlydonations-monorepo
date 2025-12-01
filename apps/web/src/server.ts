import { initAuth } from "@repo/core/auth/server";
import { initDatabase } from "@repo/core/database/setup";
import { createModerationQueue } from "@repo/core/queues/moderation-queue";
import { initModerationQueue } from "@repo/core/queues/setup";
import { createSMSQueue } from "@repo/core/queues/sms-queue";
import { createEmailQueue } from "@repo/email/email/queue";
import * as Sentry from "@sentry/cloudflare";
import handler from "@tanstack/react-start/server-entry";
import { createAuthEmailHandler } from "@/lib/auth-email-adapter";
import { createAuthSMSHandler } from "@/lib/auth-sms-adapter";
import { validateWebEnv } from "@/lib/env";

export default Sentry.withSentry(
  (env: Env) => ({
    dsn: env.VITE_SENTRY_DSN,
    release: env.CF_VERSION_METADATA?.id,
    environment: env.ENVIRONMENT,
    enabled: env.ENVIRONMENT !== "development",
    enableLogs: true,
    tracesSampleRate: 1.0,
    sendDefaultPii: true,
  }),
  {
    async fetch(request: Request, env: Env) {
      if (process.env.NODE_ENV === "production") {
        validateWebEnv(env);
      }

      const db = initDatabase(env.DB);

      const emailQueue = createEmailQueue(env.APP_QUEUE, {
        defaultSource: "auth",
      });

      const smsQueue = createSMSQueue(env.APP_QUEUE, {
        defaultSource: "auth",
      });

      const moderationQueue = createModerationQueue(env.APP_QUEUE);

      initModerationQueue(moderationQueue);

      initAuth({
        db,
        provider: "sqlite",
        secret: env.BETTER_AUTH_SECRET,
        socialProviders: {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        },
        emailHandler: createAuthEmailHandler(emailQueue),
        smsHandler: createAuthSMSHandler(smsQueue),
      });

      return handler.fetch(request, {
        context: {
          fromFetch: true,
        },
      });
    },
  },
);
