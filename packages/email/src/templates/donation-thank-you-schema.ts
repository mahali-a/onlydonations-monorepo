import { z } from "zod";

export const donationThankYouSchema = z.object({
  email: z.string(),
  donorName: z.string(),
  amount: z.string(),
  currency: z.string(),
  campaignTitle: z.string(),
  campaignUrl: z.string(),
  customThankYouMessage: z.string().optional(),
  donatedAt: z.string(),
  donationShareUrl: z.string(),
});

export type DonationThankYouData = z.infer<typeof donationThankYouSchema>;
