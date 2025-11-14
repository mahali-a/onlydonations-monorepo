import { relations } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { auth_user } from "../auth-schema";

const createId = () => nanoid(10);

export const userKycStatus = pgTable("user_kyc_status", {
  userId: text("user_id")
    .primaryKey()
    .references(() => auth_user.id, { onDelete: "cascade" }),
  kycStatus: text("kyc_status", {
    enum: ["PENDING", "VERIFIED", "REJECTED", "REQUIRES_INPUT"],
  })
    .notNull()
    .default("PENDING"),
  kycVerifiedAt: timestamp("kyc_verified_at"),
  smileJobId: text("smile_job_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const verificationJob = pgTable("verification_job", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => auth_user.id, { onDelete: "cascade" }),
  smileJobId: text("smile_job_id").notNull().unique(),
  product: text("product", {
    enum: ["biometric_kyc", "doc_verification", "authentication"],
  }).notNull(),
  status: text("status", {
    enum: ["pending", "completed", "failed", "cancelled"],
  })
    .notNull()
    .default("pending"),
  resultCode: text("result_code"),
  resultText: text("result_text"),
  rawResult: jsonb("raw_result"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const smileWebhookEvent = pgTable("smile_webhook_event", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => verificationJob.smileJobId, { onDelete: "cascade" }),
  eventType: text("event_type").notNull().default("verification_complete"),
  signature: text("signature").notNull(),
  rawPayload: jsonb("raw_payload").notNull(),
  status: text("status", {
    enum: ["pending", "processed", "failed"],
  })
    .notNull()
    .default("pending"),
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const verificationJobRelations = relations(verificationJob, ({ one }) => ({
  user: one(auth_user, {
    fields: [verificationJob.userId],
    references: [auth_user.id],
  }),
}));
