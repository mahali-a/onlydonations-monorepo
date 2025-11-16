import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { auth_user } from "../auth-schema";
import { campaign } from "./campaign.schema";

const createId = () => nanoid(10);

export const campaignUpdate = sqliteTable("campaign_update", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaign.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => auth_user.id),

  isPinned: integer("is_pinned", { mode: "boolean" }),
  isHidden: integer("is_hidden", { mode: "boolean" }),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const campaignUpdateRelations = relations(campaignUpdate, ({ one }) => ({
  campaign: one(campaign, {
    fields: [campaignUpdate.campaignId],
    references: [campaign.id],
  }),
  author: one(auth_user, {
    fields: [campaignUpdate.authorId],
    references: [auth_user.id],
  }),
}));
