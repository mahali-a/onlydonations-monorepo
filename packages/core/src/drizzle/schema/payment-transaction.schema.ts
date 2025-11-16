import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { organization } from "../auth-schema";
import { currencies } from "./currencies.schema";

const createId = () => nanoid(10);

export const paymentTransaction = sqliteTable("payment_transaction", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),

  organizationId: text("organization_id").references(() => organization.id, {
    onDelete: "cascade",
  }),

  processor: text("processor").notNull(),
  processorRef: text("processor_ref").unique().notNull(),
  processorTransactionId: text("processor_transaction_id"),

  amount: integer("amount").notNull(),
  fees: integer("fees").notNull().default(0),
  currency: text("currency")
    .notNull()
    .references(() => currencies.code),
  paymentMethod: text("payment_method"),

  status: text("status").notNull().default("PENDING"),
  statusMessage: text("status_message"),

  metadata: text("metadata"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const paymentTransactionOrganizationIdIdx = index(
  "payment_transaction_organization_id_idx",
).on(paymentTransaction.organizationId);
export const paymentTransactionProcessorIdx = index("payment_transaction_processor_idx").on(
  paymentTransaction.processor,
);
export const paymentTransactionStatusIdx = index("payment_transaction_status_idx").on(
  paymentTransaction.status,
);
// Composite index for common query: organizationId + processor + status
export const paymentTransactionOrgProcessorStatusIdx = index(
  "payment_transaction_org_processor_status_idx",
).on(paymentTransaction.organizationId, paymentTransaction.processor, paymentTransaction.status);
export const paymentTransactionCreatedAtIdx = index("payment_transaction_created_at_idx").on(
  paymentTransaction.createdAt,
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
