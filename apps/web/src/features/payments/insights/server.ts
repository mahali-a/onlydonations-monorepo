import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/core/middleware/auth";
import { insightsLoader } from "./insights-loaders";

export { insightsLoader } from "./insights-loaders";

export const getFinancialInsights = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      organizationId: z.string(),
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().default(10),
    }),
  )
  .handler(async ({ data }) => {
    return await insightsLoader(data.organizationId, data.page, data.limit);
  });
