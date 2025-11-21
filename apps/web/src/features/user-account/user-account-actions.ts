import { env } from "cloudflare:workers";
import { getAuth } from "@repo/core/auth/server";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { nanoid } from "nanoid";
import { logger } from "@/lib/logger";
import { authMiddleware } from "@/server/middleware/auth";
import { updateUserInDatabase } from "./user-account-models";
import { emailSchema, nameSchema } from "./user-account-schemas";

const accountLogger = logger.createChildLogger("user-account-actions");

export const updateUserNameOnServer = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected FormData");
    }

    return {
      name: data.get("name")?.toString() || "",
    };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user;

    const result = nameSchema.safeParse({ name: data.name });

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message || "Invalid name",
      };
    }

    try {
      await updateUserInDatabase(user.id, {
        name: result.data.name,
      });

      return { success: true };
    } catch (error) {
      accountLogger.error("Failed to update name", error, {
        userId: user.id,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update name",
      };
    }
  });

export const updateUserEmailOnServer = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected FormData");
    }

    return {
      email: data.get("email")?.toString() || "",
    };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user;
    const auth = getAuth();
    const req = getRequest();

    const result = emailSchema.safeParse({ email: data.email });

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message || "Invalid email",
      };
    }

    try {
      await auth.api.changeEmail({
        body: {
          newEmail: result.data.email,
        },
        headers: req.headers,
      });

      return { success: true };
    } catch (error) {
      accountLogger.error("Failed to update email", error, {
        userId: user.id,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update email",
      };
    }
  });

export const updateUserAvatarOnServer = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected FormData");
    }

    return {
      file: data.get("avatar") as File | null,
    };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user;

    if (!data.file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    if (!data.file.type.match(/^image\/(png|jpeg)$/)) {
      return {
        success: false,
        error: "Only PNG and JPEG images are allowed",
      };
    }

    const maxSize = 2 * 1024 * 1024;
    if (data.file.size > maxSize) {
      return {
        success: false,
        error: "File size must be less than 2MB",
      };
    }

    try {
      const extension = data.file.type === "image/png" ? "png" : "jpg";
      const key = `avatars/${user.id}-${nanoid()}.${extension}`;

      await env.ASSETS.put(key, data.file.stream());

      const avatarUrl = `${env.R2_PUBLIC_URL}/${key}`;
      const oldImageUrl = user.image;

      await updateUserInDatabase(user.id, {
        image: avatarUrl,
      });

      if (oldImageUrl?.startsWith(env.R2_PUBLIC_URL)) {
        try {
          const key = oldImageUrl.substring(env.R2_PUBLIC_URL.length + 1);

          if (key.startsWith("avatars/") && !key.includes("..") && !key.includes("//")) {
            await env.ASSETS.delete(key);
          }
        } catch (error) {
          accountLogger.error("Failed to delete old avatar", error, {
            userId: user.id,
          });
        }
      }

      return { success: true };
    } catch (error) {
      accountLogger.error("Failed to update avatar", error, {
        userId: user.id,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update avatar",
      };
    }
  });
