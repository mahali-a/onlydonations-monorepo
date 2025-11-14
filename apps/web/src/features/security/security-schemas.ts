import { z } from "zod";

export const revokeSessionSchema = z.object({
  token: z.string().min(1, "Session token is required"),
});
