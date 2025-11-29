import { z } from "zod";
import type { BaseQueueMessage } from "./types";

/**
 * SMS queue data schema
 */
export const smsQueueDataSchema = z.object({
  to: z.string(),
  message: z.string(),
  metadata: z
    .object({
      type: z.enum(["verification", "notification", "alert"]).optional(),
      referenceId: z.string().optional(),
    })
    .optional(),
});

export type SMSQueueData = z.infer<typeof smsQueueDataSchema>;

export interface SMSQueueMessage extends BaseQueueMessage {
  type: "sms";
  data: SMSQueueData;
}
