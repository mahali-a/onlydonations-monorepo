import { z } from "zod";

export const donationFiltersSchema = z.object({
  search: z.string().default("").catch(""),
  status: z.enum(["PENDING", "SUCCESS", "FAILED"]).optional(),
  campaignId: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  page: z.number().int().min(1).default(1).catch(1),
  limit: z.number().int().min(5).max(100).default(50).catch(50),
  sortBy: z
    .enum(["donorName", "donorEmail", "amount", "status", "createdAt", "campaignTitle"])
    .default("createdAt")
    .catch("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc").catch("desc"),
});

export type DonationFilters = z.infer<typeof donationFiltersSchema>;

export const donationStatsRequestSchema = z.object({}).optional();

export const createDonationSchema = z.object({
  campaignId: z.string(),
  amount: z.number().int().min(1),
  currency: z.string().length(3),
  donorName: z.string().min(2).max(255).optional(),
  donorEmail: z.string().email().max(254),
  donorMessage: z.string().max(500).optional(),
  isAnonymous: z.boolean().default(false),
  showMessage: z.boolean().default(true),
  coverFees: z.boolean().default(false),
});

export type CreateDonation = z.infer<typeof createDonationSchema>;

export const updateDonationStatusSchema = z.object({
  donationId: z.string(),
  status: z.enum(["PENDING", "SUCCESS", "FAILED"]),
  reference: z.string().optional(),
});
