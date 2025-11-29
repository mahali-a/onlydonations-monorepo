import { fallback } from "@tanstack/zod-adapter";
import { z } from "zod";

export const donationFiltersSchema = z.object({
  search: fallback(z.string(), ""),
  status: z.enum(["PENDING", "SUCCESS", "FAILED"]).optional(),
  campaignId: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  page: fallback(z.number().int().min(1), 1),
  limit: fallback(z.number().int().min(5).max(100), 50),
  sortBy: fallback(
    z.enum(["donorName", "donorEmail", "amount", "status", "createdAt", "campaignTitle"]),
    "createdAt",
  ),
  sortOrder: fallback(z.enum(["asc", "desc"]), "desc"),
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
