/**
 * Logger utility for Cloudflare Workers edge runtime
 *
 * Provides structured logging with consistent formatting and optional metadata.
 * Uses console methods under the hood, which work well in Cloudflare Workers
 * and integrate with Cloudflare's logging infrastructure.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMetadata {
  [key: string]: unknown;
}

class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  /**
   * Create a child logger with additional context
   */
  child(context: string): Logger {
    const childContext = this.context ? `${this.context}:${context}` : context;
    return new Logger(childContext);
  }

  private formatMessage(level: LogLevel, message: string, metadata?: LogMetadata): string {
    const timestamp = new Date().toISOString();
    const ctx = this.context ? `[${this.context}]` : "";
    const lvl = level.toUpperCase().padEnd(5);

    let formattedMsg = `${timestamp} ${lvl} ${ctx} ${message}`;

    if (metadata && Object.keys(metadata).length > 0) {
      formattedMsg += ` ${JSON.stringify(metadata)}`;
    }

    return formattedMsg;
  }

  /**
   * Log debug messages (development/troubleshooting)
   */
  debug(message: string, metadata?: LogMetadata): void {
    console.log(this.formatMessage("debug", message, metadata));
  }

  /**
   * Log informational messages
   */
  info(message: string, metadata?: LogMetadata): void {
    console.log(this.formatMessage("info", message, metadata));
  }

  /**
   * Log warning messages
   */
  warn(message: string, metadata?: LogMetadata): void {
    console.warn(this.formatMessage("warn", message, metadata));
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error | unknown, metadata?: LogMetadata): void {
    const errorMetadata: LogMetadata = { ...metadata };

    if (error instanceof Error) {
      errorMetadata.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      errorMetadata.error = error;
    }

    console.error(this.formatMessage("error", message, errorMetadata));
  }

  /**
   * Log with custom level (rarely needed)
   */
  log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    const formatted = this.formatMessage(level, message, metadata);

    switch (level) {
      case "debug":
      case "info":
        console.log(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "error":
        console.error(formatted);
        break;
    }
  }
}

export const logger = new Logger();

export { Logger };
