import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { auth_user } from "../auth-schema";

const createId = () => nanoid(10);

export const userKycStatus = sqliteTable("user_kyc_status", {
  userId: text("user_id")
    .primaryKey()
    .references(() => auth_user.id, { onDelete: "cascade" }),
  kycStatus: text("kyc_status").notNull().default("PENDING"),
  kycVerifiedAt: integer("kyc_verified_at", { mode: "timestamp" }),
  smileJobId: text("smile_job_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const verificationJob = sqliteTable("verification_job", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => auth_user.id, { onDelete: "cascade" }),
  smileJobId: text("smile_job_id").notNull().unique(),
  product: text("product").notNull(),
  status: text("status").notNull().default("pending"),
  resultCode: text("result_code"),
  resultText: text("result_text"),
  rawResult: text("raw_result"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const verificationJobUserIdIdx = index("verification_job_user_id_idx").on(
  verificationJob.userId,
);
export const verificationJobStatusIdx = index("verification_job_status_idx").on(
  verificationJob.status,
);
export const verificationJobCreatedAtIdx = index("verification_job_created_at_idx").on(
  verificationJob.createdAt,
);

export const smileWebhookEvent = sqliteTable("smile_webhook_event", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => verificationJob.smileJobId, { onDelete: "cascade" }),
  eventType: text("event_type").notNull().default("verification_complete"),
  signature: text("signature").notNull(),
  rawPayload: text("raw_payload").notNull(),
  status: text("status").notNull().default("pending"),
  processedAt: integer("processed_at", { mode: "timestamp" }),
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const smileWebhookEventJobIdIdx = index("smile_webhook_event_job_id_idx").on(
  smileWebhookEvent.jobId,
);
export const smileWebhookEventStatusIdx = index("smile_webhook_event_status_idx").on(
  smileWebhookEvent.status,
);

export const verificationJobRelations = relations(verificationJob, ({ one }) => ({
  user: one(auth_user, {
    fields: [verificationJob.userId],
    references: [auth_user.id],
  }),
}));
