import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { auth_user, organization } from "../auth-schema";
import { category } from "./category.schema";
import { countries } from "./countries.schema";
import { currencies } from "./currencies.schema";

const createId = () => nanoid(10);

export const campaign = sqliteTable("campaign", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  slug: text("slug").notNull().unique(),
  status: text("status").default("DRAFT").notNull(),

  amount: integer("goal_amount").notNull(),
  currency: text("currency")
    .notNull()
    .default("GHS")
    .references(() => currencies.code),
  coverImage: text("cover_image_file_key").notNull(),
  title: text("title").notNull(),
  beneficiaryName: text("beneficiary_name").notNull(),
  country: text("country")
    .notNull()
    .default("GH")
    .references(() => countries.code),
  description: text("description").notNull(),
  categoryId: text("category_id")
    .references(() => category.id)
    .notNull(),
  createdBy: text("created_by").references(() => auth_user.id),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),

  isUnlisted: integer("is_unlisted", { mode: "boolean" }),
  endDate: integer("end_date", { mode: "timestamp" }),
  donateButtonText: text("donate_button_text"),

  thankYouMessage: text("thank_you_message"),

  feeHandling: text("fee_handling").default("DONOR_ASK_COVER").notNull(),

  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoImage: text("seo_image_file_key"),

  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const campaignOrganizationIdIdx = index("campaign_organization_id_idx").on(
  campaign.organizationId,
);
export const campaignStatusIdx = index("campaign_status_idx").on(campaign.status);
export const campaignDeletedAtIdx = index("campaign_deleted_at_idx").on(campaign.deletedAt);
export const campaignCategoryIdIdx = index("campaign_category_id_idx").on(campaign.categoryId);
// Composite index for common query pattern: organizationId + deletedAt + status
export const campaignOrgDeletedStatusIdx = index("campaign_org_deleted_status_idx").on(
  campaign.organizationId,
  campaign.deletedAt,
  campaign.status,
);
// Index for slug lookups within organization
export const campaignSlugOrgIdx = index("campaign_slug_org_idx").on(
  campaign.slug,
  campaign.organizationId,
);

export const campaignRelations = relations(campaign, ({ one }) => ({
  category: one(category, {
    fields: [campaign.categoryId],
    references: [category.id],
  }),
  creator: one(auth_user, {
    fields: [campaign.createdBy],
    references: [auth_user.id],
    relationName: "creator",
  }),
  organization: one(organization, {
    fields: [campaign.organizationId],
    references: [organization.id],
  }),
  country: one(countries, {
    fields: [campaign.country],
    references: [countries.code],
  }),
  currencyRef: one(currencies, {
    fields: [campaign.currency],
    references: [currencies.code],
  }),
}));
