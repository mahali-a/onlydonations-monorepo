import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { organization } from "./auth.schema";

const createId = () => nanoid(10);

export const withdrawalAccount = sqliteTable("withdrawal_account", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  accountType: text("account_type").notNull(),
  bankCode: text("bank_code"),
  accountNumber: text("account_number").notNull(),
  accountName: text("account_name"),
  name: text("name"),
  mobileMoneyProvider: text("mobile_money_provider"),
  recipientCode: text("recipient_code").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const withdrawalAccountOrganizationIdIdx = index(
  "withdrawal_account_organization_id_idx",
).on(withdrawalAccount.organizationId);
export const withdrawalAccountDeletedAtIdx = index("withdrawal_account_deleted_at_idx").on(
  withdrawalAccount.deletedAt,
);
// Composite index for common query: organizationId + deletedAt
export const withdrawalAccountOrgDeletedIdx = index("withdrawal_account_org_deleted_idx").on(
  withdrawalAccount.organizationId,
  withdrawalAccount.deletedAt,
);

export const withdrawalAccountRelations = relations(withdrawalAccount, ({ one }) => ({
  organization: one(organization, {
    fields: [withdrawalAccount.organizationId],
    references: [organization.id],
  }),
}));
