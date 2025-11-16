import { z } from "zod";

export const SEO_IMAGE_ALLOWED_FILE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

export const campaignSharingSchema = z.object({
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be at most 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .regex(/^[a-z0-9]/, "Slug must start with a letter or number")
    .regex(/[a-z0-9]$/, "Slug must end with a letter or number"),
  seoTitle: z
    .string()
    .max(60, "SEO title should be at most 60 characters for optimal display")
    .optional()
    .nullable(),
  seoDescription: z
    .string()
    .max(160, "SEO description should be at most 160 characters for optimal display")
    .optional()
    .nullable(),
  seoImageFile: z.instanceof(File).nullable().optional(),
  seoImageFileKey: z.string().optional(),
});

export type CampaignSharingFormData = z.infer<typeof campaignSharingSchema>;
