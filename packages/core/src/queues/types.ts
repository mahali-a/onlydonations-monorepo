import type { z } from "zod";

/**
 * Base message structure for all queues
 * Provides consistent metadata and tracing
 */
export interface BaseQueueMessage {
  messageId: string;
  timestamp: number;
  metadata?: {
    userId?: string;
    orgId?: string;
    requestId?: string;
    source?: string; // 'web' | 'api' | 'cron'
  };
}

/**
 * Queue message with type discrimination
 */
export interface QueueMessage<T extends string = string, D = unknown> extends BaseQueueMessage {
  type: T;
  data: D;
}

/**
 * Consumer result for observability
 */
export type ConsumerResult =
  | { status: "success"; duration: number }
  | { status: "retry"; reason: string; delaySeconds: number }
  | { status: "failed"; reason: string; fatal: boolean };

/**
 * Generic consumer handler
 */
export type QueueConsumer<T = unknown> = (
  message: Message<T>,
  env: Record<string, unknown>,
  ctx: ExecutionContext,
) => Promise<ConsumerResult>;

/**
 * Consumer registry entry
 */
export interface ConsumerRegistryEntry<T = unknown> {
  name: string;
  schema: z.ZodType<T>;
  handler: QueueConsumer<T>;
  options?: {
    maxRetries?: number;
    retryBackoff?: (attempt: number) => number;
  };
}
