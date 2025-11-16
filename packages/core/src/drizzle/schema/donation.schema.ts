import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { auth_user } from "../auth-schema";
import { campaign } from "./campaign.schema";
import { currencies } from "./currencies.schema";
import { paymentTransaction } from "./payment-transaction.schema";

const createId = () => nanoid(10);

export const donation = sqliteTable(
  "donation",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaign.id, { onDelete: "restrict" }),

    amount: integer("amount").notNull(),
    currency: text("currency")
      .notNull()
      .default("GHS")
      .references(() => currencies.code),
    reference: text("reference").unique(),

    paymentTransactionId: text("payment_transaction_id").references(() => paymentTransaction.id),

    isAnonymous: integer("is_anonymous", { mode: "boolean" }).notNull().default(false),
    donorId: text("donor_id").references(() => auth_user.id, {
      onDelete: "set null",
    }),
    donorName: text("donor_name"),
    donorEmail: text("donor_email"),
    donorMessage: text("donor_message"),
    showMessage: integer("show_message", { mode: "boolean" }).notNull().default(true),

    status: text("status").notNull().default("PENDING"),

    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
    completedAt: integer("completed_at", { mode: "timestamp" }),
  },
  (table) => ({
    campaignIdIndex: index("donation_campaign_id_idx").on(table.campaignId),
    donorIdIndex: index("donation_donor_id_idx").on(table.donorId),
    donorEmailIndex: index("donation_donor_email_idx").on(table.donorEmail),
    statusIndex: index("donation_status_idx").on(table.status),
    completedAtIndex: index("donation_completed_at_idx").on(table.completedAt),
    referenceIndex: index("donation_reference_idx").on(table.reference),
  }),
);

export const donationRelations = relations(donation, ({ one }) => ({
  campaign: one(campaign, {
    fields: [donation.campaignId],
    references: [campaign.id],
  }),
  donor: one(auth_user, {
    fields: [donation.donorId],
    references: [auth_user.id],
    relationName: "donor",
  }),
  paymentTransaction: one(paymentTransaction, {
    fields: [donation.paymentTransactionId],
    references: [paymentTransaction.id],
  }),
}));
