import { z } from "zod";

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
  deleteSeoImage: z.boolean().optional(),
});

export type CampaignSharingFormData = z.infer<typeof campaignSharingSchema>;

export const updateCampaignSharingSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  campaignId: z.string().min(1, "Campaign ID is required"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be 50 characters or less")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  seoTitle: z.string().max(60, "SEO title must be 60 characters or less").optional(),
  seoDescription: z.string().max(160, "SEO description must be 160 characters or less").optional(),
  seoImageFileKey: z.string().optional(),
  deleteSeoImage: z.boolean().optional(),
});

export const checkSlugAvailabilitySchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  slug: z.string().min(3).max(50),
  campaignId: z.string().optional(),
});
