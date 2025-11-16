import type { EmailTemplateData } from "@repo/email/email/types";
import type { EmailQueueProducer } from "@repo/email/email/queue";

export function createAuthEmailHandler(queue: EmailQueueProducer) {
  return async (type: "otp" | "change-email", data: Record<string, unknown>) => {
    if (type === "otp") {
      await queue.send("email-otp", data as EmailTemplateData<"email-otp">, {
        priority: "high",
      });
    } else {
      await queue.send("change-email", data as EmailTemplateData<"change-email">, {
        priority: "normal",
      });
    }
  };
}
