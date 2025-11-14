/**
 * Retry utility with exponential backoff
 * Implements resilient retry logic for handling transient failures
 */

export type RetryOptions = {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  jitter?: boolean;
  onRetry?: (error: Error, attempt: number) => void;
};

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly originalError: Error,
    public readonly attempts: number,
    public readonly duration: number,
  ) {
    super(message);
    this.name = "RetryError";
  }
}

/**
 * Execute a function with exponential backoff retry logic
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns The result of the function execution
 * @throws RetryError if all retries are exhausted
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 30000, jitter = true, onRetry } = options;

  const startTime = Date.now();
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If we've exhausted all retries, throw
      if (attempt === maxRetries) {
        throw new RetryError(
          `Failed after ${attempt + 1} attempts: ${lastError.message}`,
          lastError,
          attempt + 1,
          Date.now() - startTime,
        );
      }

      // Calculate exponential backoff delay
      const delay = calculateDelay(attempt, baseDelay, maxDelay, jitter);

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(lastError, attempt + 1);
      }

      // Wait before retrying
      await wait(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new RetryError(
    "Unexpected retry error",
    lastError || new Error("Unknown error"),
    maxRetries + 1,
    Date.now() - startTime,
  );
}

/**
 * Calculate exponential backoff delay with optional jitter
 */
function calculateDelay(
  retryCount: number,
  baseDelay: number,
  maxDelay: number,
  jitter: boolean,
): number {
  // Calculate exponential delay: 2^retryCount * baseDelay
  let delay = Math.min(maxDelay, 2 ** retryCount * baseDelay);

  // Add jitter to prevent thundering herd problem
  // Random factor between 0.5 and 1.5
  if (jitter) {
    delay = delay * (0.5 + Math.random());
  }

  return delay;
}

/**
 * Wait for a specified number of milliseconds
 */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable (network/timeout errors)
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const retryablePatterns = [
    /network/i,
    /timeout/i,
    /ECONNREFUSED/i,
    /ETIMEDOUT/i,
    /ENOTFOUND/i,
    /fetch failed/i,
  ];

  return retryablePatterns.some((pattern) => pattern.test(error.message));
}

/**
 * Retry only if the error is retryable
 */
export async function retryIfRetryable<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  return retry(async () => {
    try {
      return await fn();
    } catch (error) {
      // Only retry if it's a retryable error
      if (!isRetryableError(error)) {
        throw error;
      }
      throw error;
    }
  }, options);
}
