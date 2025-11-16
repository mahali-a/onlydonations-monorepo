import { getAuth } from "@repo/core/auth/server";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { UAParser } from "ua-parser-js";
import { authMiddleware } from "@/server/middleware/auth";

export const retrieveSessionsFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const auth = getAuth();
    const req = getRequest();

    const sessionsResponse = await auth.api.listSessions({
      headers: req.headers,
    });

    const currentSession = await auth.api.getSession({
      headers: req.headers,
    });

    const currentToken = currentSession?.session.token;

    const sessions = (sessionsResponse || [])
      .map((session) => {
        const parser = new UAParser(session.userAgent || "");
        const browser = parser.getBrowser().name || "Unknown";
        const os = parser.getOS().name || "Unknown";

        return {
          id: session.id,
          token: session.token,
          ipAddress: session.ipAddress,
          browser,
          os,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          expiresAt: session.expiresAt,
          isCurrent: session.token === currentToken,
        };
      })
      .sort((a, b) => {
        if (a.isCurrent) return -1;
        if (b.isCurrent) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

    return sessions;
  });

export const retrieveLoginMethodFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user;

    const loginMethodMap: Record<string, string> = {
      "email-otp": "One-time code",
      google: "Google",
      github: "GitHub",
    };

    const loginMethod = user.lastLoginMethod
      ? loginMethodMap[user.lastLoginMethod] || user.lastLoginMethod
      : "One-time code";

    return loginMethod;
  });
