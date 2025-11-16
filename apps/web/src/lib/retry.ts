type RetryOptions = {
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

export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 30000, jitter = true, onRetry } = options;

  const startTime = Date.now();
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        throw new RetryError(
          `Failed after ${attempt + 1} attempts: ${lastError.message}`,
          lastError,
          attempt + 1,
          Date.now() - startTime,
        );
      }

      const delay = calculateDelay(attempt, baseDelay, maxDelay, jitter);

      if (onRetry) {
        onRetry(lastError, attempt + 1);
      }

      await wait(delay);
    }
  }

  throw new RetryError(
    "Unexpected retry error",
    lastError || new Error("Unknown error"),
    maxRetries + 1,
    Date.now() - startTime,
  );
}

function calculateDelay(
  retryCount: number,
  baseDelay: number,
  maxDelay: number,
  jitter: boolean,
): number {
  let delay = Math.min(maxDelay, 2 ** retryCount * baseDelay);

  if (jitter) {
    delay = delay * (0.5 + Math.random());
  }

  return delay;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

export async function retryIfRetryable<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  return retry(async () => {
    try {
      return await fn();
    } catch (error) {
      if (!isRetryableError(error)) {
        throw error;
      }
      throw error;
    }
  }, options);
}
