import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { auth_user, organization } from "../auth-schema";
import { category } from "./category.schema";
import { countries } from "./countries.schema";
import { currencies } from "./currencies.schema";

const createId = () => nanoid(10);

export const campaign = pgTable("campaign", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  slug: text("slug").notNull().unique(),
  status: text("status", {
    enum: ["DRAFT", "UNDER_REVIEW", "COMPLETED", "REJECTED", "ACTIVE", "CANCELLED"],
  })
    .default("DRAFT")
    .notNull(),

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

  isUnlisted: boolean("is_unlisted"),
  endDate: timestamp("end_date"),
  donateButtonText: text("donate_button_text"),

  thankYouMessage: text("thank_you_message"),

  feeHandling: text("fee_handling", {
    enum: ["DONOR_ASK_COVER", "DONOR_REQUIRE_COVER", "CAMPAIGN_ABSORB"],
  })
    .default("DONOR_ASK_COVER")
    .notNull(),

  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoImage: text("seo_image_file_key"),

  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"),
});

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
