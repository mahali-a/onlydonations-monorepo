import type { SMSErrorCodeType, SMSProviderType } from "./types";

const NON_RETRYABLE_CODES: SMSErrorCodeType[] = [
  "INVALID_CONFIG",
  "PROVIDER_NOT_CONFIGURED",
  "INVALID_PARAMS",
  "INVALID_RECIPIENT",
  "INVALID_SENDER",
  "INVALID_API_KEY",
  "API_KEY_INACTIVE",
  "SENDER_NOT_APPROVED",
  "INSUFFICIENT_BALANCE",
];

export class SMSError extends Error {
  readonly code: SMSErrorCodeType;
  readonly provider?: SMSProviderType;
  readonly retryable: boolean;

  constructor(code: SMSErrorCodeType, message: string, provider?: SMSProviderType) {
    super(message);
    this.name = "SMSError";
    this.code = code;
    this.provider = provider;
    this.retryable = !NON_RETRYABLE_CODES.includes(code);
  }

  static fromUnknown(error: unknown, provider?: SMSProviderType): SMSError {
    if (error instanceof SMSError) {
      return error;
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return new SMSError("UNKNOWN", message, provider);
  }
}
