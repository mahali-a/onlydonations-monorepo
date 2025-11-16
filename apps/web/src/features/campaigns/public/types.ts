import type { SelectCampaign, SelectCategory } from "@repo/core/database/types";

export type PublicCampaign = {
  id: string;
  slug: string;
  title: string;
  beneficiaryName: string;
  description: string;
  amount: number;
  currency: string;
  coverImage: string | null;
  country: string | null;
  endDate: Date | null;
  publishedAt: Date | null;
  status: SelectCampaign["status"];
  organizationId?: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoImage: string | null;
  donateButtonText: string | null;
  thankYouMessage: string | null;
  feeHandling: SelectCampaign["feeHandling"];
  category: {
    id: string;
    name: string;
  };
  totalRaised: number;
  donationCount: number;
};

export type PublicDonation = {
  id: string;
  amount: number;
  currency: string;
  donorName: string | null;
  donorEmail: string | null;
  donorMessage: string | null;
  isAnonymous: boolean;
  status: string;
  createdAt: Date;
};

type CampaignUpdate = {
  id: string;
  title: string;
  content: string;
  campaignId: string;
  authorId: string;
  isPinned: boolean;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CampaignDetailData = {
  campaign: PublicCampaign;
  donations: PublicDonation[];
  categories: SelectCategory[];
  updates?: CampaignUpdate[];
};
