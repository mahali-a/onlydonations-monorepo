import { fallback } from "@tanstack/zod-adapter";
import { z } from "zod";

export const searchFiltersSchema = z.object({
  query: fallback(z.string(), "").default(""),
  categoryId: z.string().optional(),
  country: z.string().optional(),
  closeToGoal: fallback(z.boolean(), false).default(false),
  timePeriod: fallback(z.enum(["all", "24h", "7d", "30d", "12m"]), "all").default("all"),
  page: fallback(z.number().int().min(1), 1).default(1),
  limit: fallback(z.number().int().min(5).max(50), 12).default(12),
  sortBy: fallback(z.enum(["recent", "raised", "trending"]), "recent").default("recent"),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;
