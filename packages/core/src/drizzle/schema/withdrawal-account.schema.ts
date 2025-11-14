import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { organization } from "../auth-schema";

const createId = () => nanoid(10);

export const withdrawalAccount = pgTable("withdrawal_account", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  accountType: text("account_type", {
    enum: ["mobile_money", "ghipss"],
  }).notNull(),
  bankCode: text("bank_code"),
  accountNumber: text("account_number").notNull(),
  accountName: text("account_name"),
  name: text("name"),
  mobileMoneyProvider: text("mobile_money_provider"),
  recipientCode: text("recipient_code").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const withdrawalAccountRelations = relations(withdrawalAccount, ({ one }) => ({
  organization: one(organization, {
    fields: [withdrawalAccount.organizationId],
    references: [organization.id],
  }),
}));
