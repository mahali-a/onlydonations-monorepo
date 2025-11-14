import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

const createId = () => nanoid(10);

export const webhookEvent = pgTable("webhook_event", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),

  processor: text("processor").notNull().default("paystack"),
  processorEventId: text("processor_event_id").notNull().unique(),
  eventType: text("event_type").notNull(),
  signature: text("signature").notNull(),
  rawPayload: text("raw_payload").notNull(),
  status: text("status", {
    enum: ["PENDING", "PROCESSED", "FAILED"],
  })
    .default("PENDING")
    .notNull(),
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
