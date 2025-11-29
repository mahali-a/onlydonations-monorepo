import { z } from "zod";

export const searchFiltersSchema = z.object({
  query: z.string().default("").catch(""),
  categoryId: z.string().optional(),
  country: z.string().optional(),
  closeToGoal: z.boolean().default(false).catch(false),
  timePeriod: z.enum(["all", "24h", "7d", "30d", "12m"]).default("all").catch("all"),
  page: z.number().int().min(1).default(1).catch(1),
  limit: z.number().int().min(5).max(50).default(12).catch(12),
  sortBy: z.enum(["recent", "raised", "trending"]).default("recent").catch("recent"),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;
