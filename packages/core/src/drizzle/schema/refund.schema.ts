import { relations, sql } from "drizzle-orm";
import { check, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { auth_user } from "../auth-schema";
import { paymentTransaction } from "./payment-transaction.schema";

const createId = () => nanoid(10);

export const refund = pgTable(
  "refund",
  {
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

    status: text("status", {
      enum: ["PENDING", "SUCCESS", "FAILED"],
    })
      .notNull()
      .default("PENDING"),

    initiatedBy: text("initiated_by"),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    amountCheck: check(
      "refund_amount_check",
      sql`${table.amount} > 0 AND ${table.amount} <= 500000000`,
    ),
  }),
);

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
