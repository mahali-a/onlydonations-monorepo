import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

const createId = () => nanoid(10);

export const webhookEvent = sqliteTable("webhook_event", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),

  processor: text("processor").notNull().default("paystack"),
  processorEventId: text("processor_event_id").notNull().unique(),
  eventType: text("event_type").notNull(),
  signature: text("signature").notNull(),
  rawPayload: text("raw_payload").notNull(),
  status: text("status").default("PENDING").notNull(),
  processedAt: integer("processed_at", { mode: "timestamp" }),
  errorMessage: text("error_message"),
  receivedAt: integer("received_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const webhookEventProcessorIdx = index("webhook_event_processor_idx").on(
  webhookEvent.processor,
);
export const webhookEventStatusIdx = index("webhook_event_status_idx").on(webhookEvent.status);
export const webhookEventEventTypeIdx = index("webhook_event_event_type_idx").on(
  webhookEvent.eventType,
);
export const webhookEventReceivedAtIdx = index("webhook_event_received_at_idx").on(
  webhookEvent.receivedAt,
);
