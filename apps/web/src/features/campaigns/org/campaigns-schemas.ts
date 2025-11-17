import { z } from "zod";

export const campaignStatusEnum = z.enum([
  "DRAFT",
  "UNDER_REVIEW",
  "ACTIVE",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
]);

export const feeHandlingEnum = z.enum([
  "DONOR_ASK_COVER",
  "DONOR_REQUIRE_COVER",
  "CAMPAIGN_ABSORB",
]);

export const campaignFiltersSchema = z.object({
  search: z.string().optional(),
  status: campaignStatusEnum.optional(),
  categoryId: z.string().optional(),
  sortBy: z
    .enum(["title", "status", "goal", "created", "supporters", "raised"])
    .optional()
    .default("created"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(5).max(100).optional().default(10),
});

export type CampaignFilters = z.infer<typeof campaignFiltersSchema>;

export const createCampaignSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(50, "Title must be 50 characters or less"),
  categoryId: z.string().min(1, "Category is required"),
});

export const updateCampaignDetailsSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  campaignId: z.string().min(1, "Campaign ID is required"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(50, "Title must be 50 characters or less"),
  beneficiaryName: z.string().min(1, "Beneficiary name is required").max(255),
  categoryId: z.string().min(1, "Category is required"),
  amount: z.number().int().positive("Goal amount must be positive"),
  description: z.string().optional(),
  coverImageFileKey: z.string().optional(),
});

export const updateCampaignSharingSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  campaignId: z.string().min(1, "Campaign ID is required"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be 50 characters or less")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens",
    ),
  seoTitle: z
    .string()
    .max(60, "SEO title must be 60 characters or less")
    .optional(),
  seoDescription: z
    .string()
    .max(160, "SEO description must be 160 characters or less")
    .optional(),
  seoImageFileKey: z.string().optional(),
});

export const updateCampaignSettingsSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  campaignId: z.string().min(1, "Campaign ID is required"),
  publishCampaign: z.boolean().optional(),
  endDate: z.date().optional().nullable(),
  donateButtonText: z
    .string()
    .max(50, "Button text must be 50 characters or less")
    .optional(),
  feeHandling: feeHandlingEnum,
  thankYouMessage: z.string().optional(),
});

export const deleteCampaignSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  campaignId: z.string().min(1, "Campaign ID is required"),
});

export const toggleCampaignStatusSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  campaignId: z.string().min(1, "Campaign ID is required"),
  status: campaignStatusEnum,
});

export const publishCampaignSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  campaignId: z.string().min(1, "Campaign ID is required"),
});

export const checkSlugAvailabilitySchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  slug: z.string().min(3).max(50),
  campaignId: z.string().optional(),
});
