import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/server/middleware/auth";
import { retrieveFinancialInsightsFromServer as insightsLoaderUtil } from "./insights-loaders";

export const retrieveFinancialInsightsFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      organizationId: z.string(),
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().default(10),
    }),
  )
  .handler(async ({ data }) => {
    return await insightsLoaderUtil(data.organizationId, data.page, data.limit);
  });
