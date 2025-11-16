import { nanoid } from "nanoid";
import { env } from "cloudflare:workers";
import { logger } from "@/lib/logger";
import { COVER_IMAGE_ALLOWED_FILE_TYPES } from "../campaign-details-schema";
import { SEO_IMAGE_ALLOWED_FILE_TYPES } from "../sharing/campaign-sharing-schema";

const campaignsLogger = logger.createChildLogger("campaigns-file-upload");

type UploadError = { type: "validation" | "upload"; message: string };

export function generateFileKey(
  organizationId: string,
  campaignId: string,
  filename: string,
): string {
  const timestamp = Date.now();
  const id = nanoid();
  const extension = filename.split(".").pop()?.toLowerCase() || "jpg";
  return `campaigns/${organizationId}/${campaignId}/${timestamp}-${id}.${extension}`;
}

export function getPublicImageUrl(fileKey: string): string {
  const sanitizedKey = fileKey.replace(/\.\./g, "").replace(/^\/+/, "");
  return `${env.R2_PUBLIC_URL}/${sanitizedKey}`;
}

export function validateCoverImageType(filename: string): boolean {
  const extension = filename.split(".").pop()?.toLowerCase();
  const typeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  const contentType = extension ? typeMap[extension] : "";
  return contentType ? COVER_IMAGE_ALLOWED_FILE_TYPES.has(contentType) : false;
}

export function validateSeoImageType(filename: string): boolean {
  const extension = filename.split(".").pop()?.toLowerCase();
  const typeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  const contentType = extension ? typeMap[extension] : "";
  return contentType ? SEO_IMAGE_ALLOWED_FILE_TYPES.has(contentType) : false;
}

export function validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size <= maxSize;
}

export async function uploadCoverImage(
  file: File,
  organizationId: string,
  campaignId: string,
): Promise<{ key?: string; error?: UploadError }> {
  const filename = file.name || "cover-image";

  if (!validateCoverImageType(filename)) {
    return {
      error: {
        type: "validation",
        message: "Unsupported file type for cover image. Please use PNG, JPG, JPEG, or WebP.",
      },
    };
  }

  if (!validateFileSize(file.size)) {
    return {
      error: {
        type: "validation",
        message: "Cover image exceeds the 10MB limit",
      },
    };
  }

  try {
    const key = generateFileKey(organizationId, campaignId, filename);
    await env.ASSETS.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || "image/jpeg",
      },
    });

    campaignsLogger.info("Cover image uploaded successfully", { key, organizationId, campaignId });

    return { key };
  } catch (error) {
    campaignsLogger.error("Failed to upload cover image", error, {
      organizationId,
      campaignId,
      filename,
    });

    return {
      error: {
        type: "upload",
        message:
          error instanceof Error
            ? error.message
            : "We couldn't upload the cover image. Please try again.",
      },
    };
  }
}

export async function uploadSeoImage(
  file: File,
  organizationId: string,
  campaignId: string,
): Promise<{ key?: string; error?: UploadError }> {
  const filename = file.name || "seo-image";

  if (!validateSeoImageType(filename)) {
    return {
      error: {
        type: "validation",
        message: "Unsupported file type for SEO image. Please use PNG, JPG, JPEG, or WebP.",
      },
    };
  }

  if (!validateFileSize(file.size)) {
    return {
      error: {
        type: "validation",
        message: "SEO image exceeds the 10MB limit",
      },
    };
  }

  try {
    const key = generateFileKey(organizationId, campaignId, filename);
    await env.ASSETS.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || "image/jpeg",
      },
    });

    campaignsLogger.info("SEO image uploaded successfully", { key, organizationId, campaignId });

    return { key };
  } catch (error) {
    campaignsLogger.error("Failed to upload SEO image", error, {
      organizationId,
      campaignId,
      filename,
    });

    return {
      error: {
        type: "upload",
        message:
          error instanceof Error
            ? error.message
            : "We couldn't upload the SEO image. Please try again.",
      },
    };
  }
}

export async function deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    await env.ASSETS.delete(key);
    campaignsLogger.info("File deleted successfully", { key });
    return { success: true };
  } catch (error) {
    campaignsLogger.error("Failed to delete file", error, { key });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

export function transformImageKeysToPublicUrls<T extends Record<string, unknown>>(data: T): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (
      (key.toLowerCase().includes("image") || key.toLowerCase().includes("cover")) &&
      typeof value === "string" &&
      value.trim() &&
      !value.startsWith("http")
    ) {
      result[key] = getPublicImageUrl(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
