import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { currencies } from "./currencies.schema";

export const countries = sqliteTable("countries", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  currencyCode: text("currency_code")
    .notNull()
    .references(() => currencies.code),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const countriesRelations = relations(countries, ({ one }) => ({
  currency: one(currencies, {
    fields: [countries.currencyCode],
    references: [currencies.code],
  }),
}));
