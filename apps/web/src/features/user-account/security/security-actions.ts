import { getAuth } from "@repo/core/auth/server";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { logger } from "@/lib/logger";
import { authMiddleware } from "@/server/middleware/auth";
import { revokeSessionSchema } from "./security-schema";

const securityLogger = logger.createChildLogger("security-actions");

export const deleteSessionOnServer = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected FormData");
    }

    return {
      token: data.get("token")?.toString() || "",
    };
  })
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const auth = getAuth();
    const req = getRequest();

    const result = revokeSessionSchema.safeParse({ token: data.token });

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message || "Invalid session token",
      };
    }

    try {
      await auth.api.revokeSession({
        body: { token: result.data.token },
        headers: req.headers,
      });

      return { success: true };
    } catch (error) {
      securityLogger.error("Failed to revoke session", error, {
        tokenPrefix: result.data.token.substring(0, 8),
      });
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to revoke session. Please try again.",
      };
    }
  });
