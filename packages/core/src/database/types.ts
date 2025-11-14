import type {
  auth_account,
  auth_session,
  auth_user,
  auth_verification,
  invitation,
  member,
  organization,
} from "@/drizzle/auth-schema";
import type {
  campaign,
  campaignUpdate,
  category,
  contentModeration,
  countries,
  currencies,
  donation,
  paymentTransaction,
  refund,
  verificationJob,
  webhookEvent,
  withdrawalAccount,
} from "@/drizzle/schema";

export type InsertUser = typeof auth_user.$inferInsert;
export type SelectUser = typeof auth_user.$inferSelect;

export type InsertSession = typeof auth_session.$inferInsert;
export type SelectSession = typeof auth_session.$inferSelect;

export type InsertAccount = typeof auth_account.$inferInsert;
export type SelectAccount = typeof auth_account.$inferSelect;

export type InsertVerification = typeof auth_verification.$inferInsert;
export type SelectVerification = typeof auth_verification.$inferSelect;

export type InsertOrganization = typeof organization.$inferInsert;
export type SelectOrganization = typeof organization.$inferSelect;

export type InsertMember = typeof member.$inferInsert;
export type SelectMember = typeof member.$inferSelect;

export type InsertInvitation = typeof invitation.$inferInsert;
export type SelectInvitation = typeof invitation.$inferSelect;

export type InsertCampaign = typeof campaign.$inferInsert;
export type SelectCampaign = typeof campaign.$inferSelect;

export type InsertCampaignUpdate = typeof campaignUpdate.$inferInsert;
export type SelectCampaignUpdate = typeof campaignUpdate.$inferSelect;

export type InsertCategory = typeof category.$inferInsert;
export type SelectCategory = typeof category.$inferSelect;

export type InsertCountry = typeof countries.$inferInsert;
export type SelectCountry = typeof countries.$inferSelect;

export type InsertCurrency = typeof currencies.$inferInsert;
export type SelectCurrency = typeof currencies.$inferSelect;

export type InsertDonation = typeof donation.$inferInsert;
export type SelectDonation = typeof donation.$inferSelect;

export type InsertVerificationJob = typeof verificationJob.$inferInsert;
export type SelectVerificationJob = typeof verificationJob.$inferSelect;

export type InsertContentModeration = typeof contentModeration.$inferInsert;
export type SelectContentModeration = typeof contentModeration.$inferSelect;

export type InsertPaymentTransaction = typeof paymentTransaction.$inferInsert;
export type SelectPaymentTransaction = typeof paymentTransaction.$inferSelect;

export type InsertRefund = typeof refund.$inferInsert;
export type SelectRefund = typeof refund.$inferSelect;

export type InsertWebhookEvent = typeof webhookEvent.$inferInsert;
export type SelectWebhookEvent = typeof webhookEvent.$inferSelect;

export type InsertWithdrawalAccount = typeof withdrawalAccount.$inferInsert;
export type SelectWithdrawalAccount = typeof withdrawalAccount.$inferSelect;
