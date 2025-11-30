import { SMSError } from "../errors";
import {
  SMSErrorCode,
  type SMSProviderConfigs,
  type SMSRequest,
  type SMSResult,
  type ZendConfig,
} from "../types";
import type { SMSProvider } from "./provider";

const ZEND_API_BASE = "https://api.tryzend.com";

type ZendSendResponse = {
  id: string;
  status: string;
  estimated_cost: number;
  message: string;
};

type ZendErrorResponse = {
  error?: string;
  message?: string;
};

export class ZendProvider implements SMSProvider {
  readonly type = "zend" as const;

  constructor(private readonly config: ZendConfig) {}

  async send(request: SMSRequest): Promise<SMSResult> {
    try {
      const response = await fetch(`${ZEND_API_BASE}/messages`, {
        method: "POST",
        headers: {
          "x-api-key": this.config.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: request.to,
          body: request.message,
          preferred_channels: ["sms"],
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as ZendErrorResponse | null;
        const errorDetail = errorBody?.error ?? errorBody?.message ?? `HTTP ${response.status}`;

        console.error("[Zend] HTTP error", {
          status: response.status,
          to: request.to,
          detail: errorDetail,
        });

        const errorCode =
          response.status === 401 || response.status === 403
            ? SMSErrorCode.INVALID_API_KEY
            : response.status === 400
              ? SMSErrorCode.INVALID_PARAMS
              : response.status === 422
                ? SMSErrorCode.INVALID_RECIPIENT
                : SMSErrorCode.NETWORK_ERROR;

        return {
          success: false,
          code: errorCode,
          message: errorDetail,
          provider: this.type,
          retryable: response.status >= 500,
        };
      }

      const data = (await response.json()) as ZendSendResponse;

      return {
        success: true,
        id: data.id,
        provider: this.type,
        cost: data.estimated_cost,
      };
    } catch (error) {
      const smsError = SMSError.fromUnknown(error, this.type);
      console.error("[Zend] Request failed", { to: request.to, error: smsError.message });

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

export function createZendProvider(configs: SMSProviderConfigs): SMSProvider | null {
  if (!configs.zend) return null;
  return new ZendProvider(configs.zend);
}
