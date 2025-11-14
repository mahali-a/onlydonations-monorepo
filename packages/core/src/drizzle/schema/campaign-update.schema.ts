import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { auth_user } from "../auth-schema";
import { campaign } from "./campaign.schema";

const createId = () => nanoid(10);

export const campaignUpdate = pgTable("campaign_update", {
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

  isPinned: boolean("is_pinned"),
  isHidden: boolean("is_hidden"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
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
