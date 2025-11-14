import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const currencies = pgTable("currencies", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
