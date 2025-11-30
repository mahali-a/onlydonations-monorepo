import { SMSError } from "../errors";
import {
  type PiloConfig,
  PiloResponseCode,
  SMSErrorCode,
  type SMSErrorCodeType,
  type SMSProviderConfigs,
  type SMSRequest,
  type SMSResult,
} from "../types";
import type { SMSProvider } from "./provider";

const PILO_API_BASE = "https://api.pilosms.com/v1";

type PiloSendResponse = {
  status: number;
  detail: string;
  total_cost: number;
  errors: { count: number; list: unknown[] };
  duplicates: { count: number; list: unknown[] };
};

function mapPiloErrorCode(code: number): SMSErrorCodeType {
  switch (code) {
    case PiloResponseCode.MISSING_PARAMS:
      return SMSErrorCode.INVALID_PARAMS;
    case PiloResponseCode.INVALID_API_KEY:
      return SMSErrorCode.INVALID_API_KEY;
    case PiloResponseCode.API_KEY_INACTIVE:
      return SMSErrorCode.API_KEY_INACTIVE;
    case PiloResponseCode.INSUFFICIENT_BALANCE:
      return SMSErrorCode.INSUFFICIENT_BALANCE;
    case PiloResponseCode.INVALID_NUMBERS:
      return SMSErrorCode.INVALID_RECIPIENT;
    case PiloResponseCode.SENDER_NOT_APPROVED:
      return SMSErrorCode.SENDER_NOT_APPROVED;
    default:
      return SMSErrorCode.UNKNOWN;
  }
}

export class PiloProvider implements SMSProvider {
  readonly type = "pilo" as const;

  constructor(private readonly config: PiloConfig) {}

  async send(request: SMSRequest): Promise<SMSResult> {
    try {
      const formData = new FormData();
      formData.append("sender", this.config.senderId);
      formData.append("message", request.message);
      formData.append("receipients", request.to);

      const response = await fetch(`${PILO_API_BASE}/send-message?apikey=${this.config.apiKey}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("[PiloSMS] HTTP error", { status: response.status, to: request.to });
        return {
          success: false,
          code: SMSErrorCode.NETWORK_ERROR,
          message: `HTTP ${response.status}`,
          provider: this.type,
          retryable: response.status >= 500,
        };
      }

      const data = (await response.json()) as PiloSendResponse;

      if (data.status === PiloResponseCode.SUCCESS) {
        return {
          success: true,
          id: `pilo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          provider: this.type,
          cost: data.total_cost,
        };
      }

      const errorCode = mapPiloErrorCode(data.status);
      console.error("[PiloSMS] API error", {
        to: request.to,
        status: data.status,
        detail: data.detail,
        errorCode,
      });

      return {
        success: false,
        code: errorCode,
        message: data.detail,
        provider: this.type,
        retryable: false,
      };
    } catch (error) {
      const smsError = SMSError.fromUnknown(error, this.type);
      console.error("[PiloSMS] Request failed", { to: request.to, error: smsError.message });

      return {
        success: false,
        code: smsError.code,
        message: smsError.message,
        provider: this.type,
        retryable: smsError.retryable,
      };
    }
  }
}

export function createPiloProvider(configs: SMSProviderConfigs): SMSProvider | null {
  if (!configs.pilo) return null;
  return new PiloProvider(configs.pilo);
}
