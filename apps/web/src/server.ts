import { initAuth } from "@repo/core/auth/server";
import { initDatabase } from "@repo/core/database/setup";
import { createEmailQueue } from "@repo/email/email/queue";
import handler from "@tanstack/react-start/server-entry";
import { createAuthEmailHandler } from "@/lib/auth-email-adapter";

export default {
  async fetch(request: Request, env: Env) {
    const db = initDatabase(env.DB);
    const emailQueue = createEmailQueue(env.EMAIL_QUEUE, {
      defaultSource: "auth",
    });

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
