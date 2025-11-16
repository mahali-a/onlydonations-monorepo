import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { auth_user } from "../auth-schema";
import { paymentTransaction } from "./payment-transaction.schema";

const createId = () => nanoid(10);

export const refund = sqliteTable("refund", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  donationId: text("donation_id").notNull(),
  transactionId: text("transaction_id")
    .notNull()
    .references(() => paymentTransaction.id),

  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),

  processor: text("processor").notNull(),
  processorRefundId: text("processor_refund_id"),

  status: text("status").notNull().default("PENDING"),

  initiatedBy: text("initiated_by"),
  processedAt: integer("processed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const refundDonationIdIdx = index("refund_donation_id_idx").on(refund.donationId);
export const refundTransactionIdIdx = index("refund_transaction_id_idx").on(refund.transactionId);
export const refundStatusIdx = index("refund_status_idx").on(refund.status);
export const refundProcessorIdx = index("refund_processor_idx").on(refund.processor);

export const refundRelations = relations(refund, ({ one }) => ({
  transaction: one(paymentTransaction, {
    fields: [refund.transactionId],
    references: [paymentTransaction.id],
  }),
  initiator: one(auth_user, {
    fields: [refund.initiatedBy],
    references: [auth_user.id],
    relationName: "initiator",
  }),
}));
