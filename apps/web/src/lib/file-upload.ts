import { nanoid } from "nanoid";
import { env } from "cloudflare:workers";
import { logger } from "@/lib/logger";

const fileUploadLogger = logger.createChildLogger("file-upload");

export const IMAGE_ALLOWED_FILE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

type UploadError = { type: "validation" | "upload"; message: string };

type EntityType = "campaign-cover" | "campaign-seo" | "organization-logo" | "user-avatar";

const entityConfig: Record<EntityType, { basePath: string; subPath: string; label: string }> = {
  "campaign-cover": { basePath: "campaigns", subPath: "cover", label: "Cover image" },
  "campaign-seo": { basePath: "campaigns", subPath: "seo", label: "SEO image" },
  "organization-logo": { basePath: "organizations", subPath: "logo", label: "Logo" },
  "user-avatar": { basePath: "users", subPath: "avatar", label: "Avatar" },
};

function generateFileKey(entityType: EntityType, entityId: string, filename: string): string {
  const config = entityConfig[entityType];
  const timestamp = Date.now();
  const id = nanoid();
  const extension = filename.split(".").pop()?.toLowerCase() || "jpg";
  return `${config.basePath}/${entityId}/${config.subPath}/${timestamp}-${id}.${extension}`;
}

function validateImageType(filename: string): boolean {
  const extension = filename.split(".").pop()?.toLowerCase();
  const typeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  const contentType = extension ? typeMap[extension] : "";
  return contentType ? IMAGE_ALLOWED_FILE_TYPES.has(contentType) : false;
}

function validateFileSize(size: number, maxSizeBytes: number): boolean {
  return size <= maxSizeBytes;
}

async function upload(
  file: File,
  entityType: EntityType,
  entityId: string,
  options?: { maxSizeBytes?: number },
): Promise<{ key?: string; error?: UploadError }> {
  const config = entityConfig[entityType];
  const filename = file.name || "image";
  const maxSize = options?.maxSizeBytes || 10 * 1024 * 1024;

  if (!validateImageType(filename)) {
    return {
      error: {
        type: "validation",
        message: `Unsupported file type for ${config.label.toLowerCase()}. Please use PNG, JPG, JPEG, or WebP.`,
      },
    };
  }

  if (!validateFileSize(file.size, maxSize)) {
    return {
      error: {
        type: "validation",
        message: `${config.label} exceeds the ${Math.round(maxSize / 1024 / 1024)}MB limit`,
      },
    };
  }

  try {
    const key = generateFileKey(entityType, entityId, filename);
    await env.ASSETS.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || "image/jpeg",
      },
    });

    fileUploadLogger.info("upload.success", { key, entityType, entityId });

    return { key };
  } catch (error) {
    fileUploadLogger.error("upload.error", error, { entityType, entityId, filename });

    return {
      error: {
        type: "upload",
        message:
          error instanceof Error
            ? error.message
            : `We couldn't upload the ${config.label.toLowerCase()}. Please try again.`,
      },
    };
  }
}

async function deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    await env.ASSETS.delete(key);
    fileUploadLogger.info("delete.success", { key });
    return { success: true };
  } catch (error) {
    fileUploadLogger.error("delete.error", error, { key });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

function getPublicUrl(key: string): string {
  const sanitizedKey = key.replace(/\.\./g, "").replace(/^\/+/, "");
  return `${env.R2_PUBLIC_URL}/${sanitizedKey}`;
}

function transformKeysToUrls<T extends Record<string, unknown>>(data: T): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (
      (key.toLowerCase().includes("image") || key.toLowerCase().includes("cover")) &&
      typeof value === "string" &&
      value.trim() &&
      !value.startsWith("http")
    ) {
      result[key] = getPublicUrl(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

export const fileService = {
  upload,
  delete: deleteFile,
  getPublicUrl,
  transformKeysToUrls,
};
