import { z } from "zod";

export const changeEmailSchema = z.object({
  email: z.string().email(),
  newEmail: z.string().email(),
  url: z.string().url(),
});

export type ChangeEmailData = z.infer<typeof changeEmailSchema>;
