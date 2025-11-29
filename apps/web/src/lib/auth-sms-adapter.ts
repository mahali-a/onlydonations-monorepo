import type { SMSQueueProducer } from "@repo/core/queues/sms-queue";

export function createAuthSMSHandler(queue: SMSQueueProducer) {
  return async (phoneNumber: string, code: string) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[SMS OTP] Phone: ${phoneNumber}, Code: ${code}`);
    }

    await queue.send({
      to: phoneNumber,
      message: `Your verification code is: ${code}. It expires in 15 minutes.`,
      metadata: {
        type: "verification",
      },
    });
  };
}
