import { relations, sql } from "drizzle-orm";
import { boolean, check, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { auth_user } from "../auth-schema";
import { campaign } from "./campaign.schema";
import { currencies } from "./currencies.schema";
import { paymentTransaction } from "./payment-transaction.schema";

const createId = () => nanoid(10);

export const donation = pgTable(
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

    isAnonymous: boolean("is_anonymous").notNull().default(false),
    donorId: text("donor_id").references(() => auth_user.id, {
      onDelete: "set null",
    }),
    donorName: text("donor_name"),
    donorEmail: text("donor_email"),
    donorMessage: text("donor_message"),
    showMessage: boolean("show_message").notNull().default(true),

    status: text("status", {
      enum: ["PENDING", "SUCCESS", "FAILED"],
    })
      .notNull()
      .default("PENDING"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    amountCheck: check("amount_check", sql`${table.amount} > 0 AND ${table.amount} <= 100000000`),
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
