import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { currencies } from "./currencies.schema";

export const countries = pgTable("countries", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  currencyCode: text("currency_code")
    .notNull()
    .references(() => currencies.code),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const countriesRelations = relations(countries, ({ one }) => ({
  currency: one(currencies, {
    fields: [countries.currencyCode],
    references: [currencies.code],
  }),
}));
