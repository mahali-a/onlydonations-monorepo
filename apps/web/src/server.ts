import { initAuth } from "@repo/core/auth/server";
import { initDatabase } from "@repo/core/database/setup";
import { createEmailQueue } from "@repo/email/email/queue";
import { createModerationQueue } from "@repo/core/queues/moderation-queue";
import { initModerationQueue } from "@repo/core/queues/setup";
import handler from "@tanstack/react-start/server-entry";
import { createAuthEmailHandler } from "@/lib/auth-email-adapter";

export default {
  async fetch(request: Request, env: Env) {
    const db = initDatabase(env.DB);

    const emailQueue = createEmailQueue(env.APP_QUEUE, {
      defaultSource: "auth",
    });

    const moderationQueue = createModerationQueue(env.APP_QUEUE);

    // Initialize global singleton (like database)
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
    });

    return handler.fetch(request, {
      context: {
        fromFetch: true,
      },
    });
  },
};
