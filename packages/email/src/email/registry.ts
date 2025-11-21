import type { ComponentType } from "react";
import type { ChangeEmailData } from "@/templates/change-email-schema";
import { changeEmailSchema } from "@/templates/change-email-schema";
import ChangeEmailTemplate from "@/templates/change-email";
import type { EmailOtpData } from "@/templates/email-otp-schema";
import { emailOtpSchema } from "@/templates/email-otp-schema";
import EmailOtpTemplate from "@/templates/email-otp";
import type { CampaignApprovedData } from "@/templates/campaign-approved-schema";
import { campaignApprovedSchema } from "@/templates/campaign-approved-schema";
import CampaignApprovedTemplate from "@/templates/campaign-approved";
import type { CampaignRejectedData } from "@/templates/campaign-rejected-schema";
import { campaignRejectedSchema } from "@/templates/campaign-rejected-schema";
import CampaignRejectedTemplate from "@/templates/campaign-rejected";
import type { DonationThankYouData } from "@/templates/donation-thank-you-schema";
import { donationThankYouSchema } from "@/templates/donation-thank-you-schema";
import DonationThankYouTemplate from "@/templates/donation-thank-you";

type EmailTemplate<T> = {
  subject: string;
  schema: unknown;
  component: ComponentType<Omit<T, "email">>;
};

export const EMAIL_TEMPLATES = {
  "email-otp": {
    subject: "Your verification code",
    schema: emailOtpSchema,
    component: EmailOtpTemplate,
  } satisfies EmailTemplate<EmailOtpData>,
  "change-email": {
    subject: "Approve your email change",
    schema: changeEmailSchema,
    component: ChangeEmailTemplate,
  } satisfies EmailTemplate<ChangeEmailData>,
  "campaign-approved": {
    subject: "Your campaign is now live! 🎉",
    schema: campaignApprovedSchema,
    component: CampaignApprovedTemplate,
  } satisfies EmailTemplate<CampaignApprovedData>,
  "campaign-rejected": {
    subject: "Campaign review update",
    schema: campaignRejectedSchema,
    component: CampaignRejectedTemplate,
  } satisfies EmailTemplate<CampaignRejectedData>,
  "donation-thank-you": {
    subject: "Thank you for your donation",
    schema: donationThankYouSchema,
    component: DonationThankYouTemplate,
  } satisfies EmailTemplate<DonationThankYouData>,
} as const;
