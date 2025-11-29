import { z } from "zod";

export const campaignStatusEnum = z.enum([
  "DRAFT",
  "UNDER_REVIEW",
  "ACTIVE",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
]);

export const campaignFiltersSchema = z.object({
  search: z.string().default("").catch(""),
  status: campaignStatusEnum.optional(),
  categoryId: z.string().optional(),
  sortBy: z
    .enum(["title", "status", "goal", "created", "supporters", "raised"])
    .default("created")
    .catch("created"),
  sortOrder: z.enum(["asc", "desc"]).default("desc").catch("desc"),
  page: z.number().int().min(1).default(1).catch(1),
  limit: z.number().int().min(5).max(100).default(10).catch(10),
});

export type CampaignFilters = z.infer<typeof campaignFiltersSchema>;

export const createCampaignSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  title: z.string().min(1, "Title is required").max(50, "Title must be 50 characters or less"),
  categoryId: z.string().min(1, "Category is required"),
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
