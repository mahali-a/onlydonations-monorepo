import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { auth_user } from "../auth-schema";

const createId = () => nanoid(10);

export const contentModeration = pgTable("content_moderation", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),

  contentType: text("content_type", { enum: ["campaign"] }).notNull(),
  contentId: text("content_id").notNull(),

  status: text("status", {
    enum: ["PENDING", "APPROVED", "REJECTED", "REQUIRES_REVIEW"],
  })
    .notNull()
    .default("PENDING"),

  flagged: boolean("flagged").notNull().default(false),
  flaggedCategories: text("flagged_categories"),
  categoryScores: text("category_scores"),

  recommendation: text("recommendation"),

  moderationProvider: text("moderation_provider").notNull().default("openai"),
  openaiModerationId: text("openai_moderation_id"),
  moderatedAt: timestamp("moderated_at").defaultNow().notNull(),

  requiresManualReview: boolean("requires_manual_review").notNull().default(false),
  reviewedBy: text("reviewed_by").references(() => auth_user.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewDecision: text("review_decision", {
    enum: ["APPROVE", "REJECT", "ESCALATE"],
  }),
  reviewNotes: text("review_notes"),

  previousModerationId: text("previous_moderation_id"),
  retryCount: integer("retry_count").notNull().default(0),
  errorMessage: text("error_message"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const contentModerationRelations = relations(contentModeration, ({ one }) => ({
  reviewer: one(auth_user, {
    fields: [contentModeration.reviewedBy],
    references: [auth_user.id],
    relationName: "reviewer",
  }),
}));
