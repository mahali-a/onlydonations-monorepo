import type { ModerationQueueMessage, ModerationQueueData } from "./moderation-schema";
import { nanoid } from "nanoid";

export class ModerationQueueProducer {
  constructor(private queue: Queue<ModerationQueueMessage>) {}

  async moderateContent(
    data: ModerationQueueData,
    options?: {
      userId?: string;
      orgId?: string;
      requestId?: string;
    },
  ): Promise<{ messageId: string }> {
    const messageId = nanoid();

    const message: ModerationQueueMessage = {
      type: "moderation",
      messageId,
      timestamp: Date.now(),
      metadata: {
        userId: options?.userId,
        orgId: options?.orgId,
        requestId: options?.requestId,
      },
      data,
    };

    await this.queue.send(message, { contentType: "json" });
    return { messageId };
  }
}

export function createModerationQueue(
  queue: Queue<ModerationQueueMessage>,
): ModerationQueueProducer {
  return new ModerationQueueProducer(queue);
}
