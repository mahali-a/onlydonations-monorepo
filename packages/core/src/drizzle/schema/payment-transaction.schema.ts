import { relations, sql } from "drizzle-orm";
import { check, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { organization } from "../auth-schema";
import { currencies } from "./currencies.schema";

const createId = () => nanoid(10);

export const paymentTransaction = pgTable(
  "payment_transaction",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),

    organizationId: text("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),

    processor: text("processor").notNull(),
    processorRef: text("processor_ref").unique().notNull(),
    processorTransactionId: text("processor_transaction_id").default(sql`NULL`),

    amount: integer("amount").notNull(),
    fees: integer("fees").notNull().default(0),
    currency: text("currency")
      .notNull()
      .references(() => currencies.code),
    paymentMethod: text("payment_method"),

    status: text("status", {
      enum: ["PENDING", "SUCCESS", "FAILED", "DISPUTED", "REFUNDED", "REFUND_PENDING"],
    })
      .notNull()
      .default("PENDING"),
    statusMessage: text("status_message"),

    metadata: text("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    amountCheck: check(
      "payment_amount_check",
      sql`${table.amount} > 0 AND ${table.amount} <= 500000000`,
    ),
  }),
);

export const paymentTransactionRelations = relations(paymentTransaction, ({ one }) => ({
  currency: one(currencies, {
    fields: [paymentTransaction.currency],
    references: [currencies.code],
  }),
  organization: one(organization, {
    fields: [paymentTransaction.organizationId],
    references: [organization.id],
  }),
}));
