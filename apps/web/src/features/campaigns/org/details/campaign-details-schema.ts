import { z } from "zod";

export const COVER_IMAGE_ALLOWED_FILE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

export const campaignDetailsSchema = z.object({
  title: z.string().min(1, "Title is required").max(50, "Title must be 50 characters or less"),
  beneficiaryName: z
    .string()
    .min(1, "Beneficiary name is required")
    .max(255, "Beneficiary name must be 255 characters or less"),
  amount: z
    .number()
    .positive("Goal amount must be greater than 0")
    .int("Goal amount must be a whole number"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  coverImageFile: z.instanceof(File).nullable().optional(),
  coverImageFileKey: z.string().optional(),
});

export type CampaignDetailsFormData = z.infer<typeof campaignDetailsSchema>;
