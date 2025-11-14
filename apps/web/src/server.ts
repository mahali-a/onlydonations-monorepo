import { setAuth } from "@repo/core/auth/server";
import { initDatabase } from "@repo/core/database/setup";
import { initEmail } from "@repo/email/email/setup";
import handler from "@tanstack/react-start/server-entry";
import { logger } from "@/lib/logger";

logger.info("using custom server entry in 'src/server.ts'");

export default {
  async fetch(request: Request, env: Env) {
    const db = await initDatabase(env.DATABASE_URL);

    // const value = await db.execute("SELECT 1");

    // console.log("db", { value });

    initEmail(env.RESEND_API_KEY, env.EMAIL_FROM, {
      isDev: env.ENVIRONMENT === "development",
    });

    setAuth({
      secret: env.BETTER_AUTH_SECRET,
      socialProviders: {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      },
      adapter: {
        drizzleDb: db,
        provider: "mysql",
      },
    });
    return handler.fetch(request, {
      context: {
        fromFetch: true,
      },
    });
  },
};
