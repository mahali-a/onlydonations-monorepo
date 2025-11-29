import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { auth_user } from "./auth.schema";

const createId = () => nanoid(10);

export const contentModeration = sqliteTable("content_moderation", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),

  contentType: text("content_type").notNull(),
  contentId: text("content_id").notNull(),

  status: text("status").notNull().default("PENDING"),

  flagged: integer("flagged", { mode: "boolean" }).notNull().default(false),
  flaggedCategories: text("flagged_categories"),
  categoryScores: text("category_scores"),

  recommendation: text("recommendation"),

  moderationProvider: text("moderation_provider").notNull().default("openai"),
  openaiModerationId: text("openai_moderation_id"),
  moderatedAt: integer("moderated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),

  requiresManualReview: integer("requires_manual_review", { mode: "boolean" })
    .notNull()
    .default(false),
  reviewedBy: text("reviewed_by").references(() => auth_user.id),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
  reviewDecision: text("review_decision"),
  reviewNotes: text("review_notes"),

  previousModerationId: text("previous_moderation_id"),
  retryCount: integer("retry_count").notNull().default(0),
  errorMessage: text("error_message"),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const contentModerationRelations = relations(contentModeration, ({ one }) => ({
  reviewer: one(auth_user, {
    fields: [contentModeration.reviewedBy],
    references: [auth_user.id],
    relationName: "reviewer",
  }),
}));
