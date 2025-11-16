import type { EmailTemplateData } from "@repo/email/email/types";
import type { EmailQueueProducer } from "@repo/email/email/queue";

export function createAuthEmailHandler(queue: EmailQueueProducer) {
  return async (
    type: "otp" | "change-email",
    data: Record<string, unknown>,
  ) => {
    if (process.env.NODE_ENV === "development") {
      console.log(JSON.stringify({ type, data }));
    }

    if (type === "otp") {
      await queue.send("email-otp", data as EmailTemplateData<"email-otp">, {
        priority: "high",
      });
    } else {
      await queue.send(
        "change-email",
        data as EmailTemplateData<"change-email">,
        {
          priority: "normal",
        },
      );
    }
  };
}
