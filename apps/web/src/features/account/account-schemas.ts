import { z } from "zod";

export const nameSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .refine(
      (val) => val.trim().split(/\s+/).length >= 2,
      "Please enter at least first and last name",
    ),
});

export const emailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

export const avatarSchema = z.object({
  avatar: z.instanceof(File).nullable(),
});

export type NameFormData = z.infer<typeof nameSchema>;
export type EmailFormData = z.infer<typeof emailSchema>;
export type AvatarFormData = z.infer<typeof avatarSchema>;
