import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

const createId = () => nanoid(10);

export const category = pgTable("category", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text("name").notNull().unique(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
