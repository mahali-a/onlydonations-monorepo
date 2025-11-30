import { SMSError } from "../errors";
import {
  SMSErrorCode,
  type SMSProviderConfigs,
  type SMSRequest,
  type SMSResult,
  type TelnyxConfig,
} from "../types";
import type { SMSProvider } from "./provider";

const TELNYX_API_BASE = "https://api.telnyx.com/v2";

function mapHttpStatusToErrorCode(status: number) {
  if (status === 401 || status === 403) return SMSErrorCode.INVALID_API_KEY;
  if (status === 400) return SMSErrorCode.INVALID_PARAMS;
  if (status === 422) return SMSErrorCode.INVALID_RECIPIENT;
  return SMSErrorCode.NETWORK_ERROR;
}

type TelnyxSendResponse = {
  data: {
    id: string;
    to: Array<{ phone_number: string; status: string }>;
    cost: { amount: string; currency: string };
  };
};

type TelnyxErrorResponse = {
  errors: Array<{ code: string; title: string; detail: string }>;
};

export class TelnyxProvider implements SMSProvider {
  readonly type = "telnyx" as const;

  constructor(private readonly config: TelnyxConfig) {}

  async send(request: SMSRequest): Promise<SMSResult> {
    try {
      const response = await fetch(`${TELNYX_API_BASE}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.config.fromNumber,
          to: request.to,
          text: request.message,
          type: "SMS",
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as TelnyxErrorResponse | null;
        const errorDetail = errorBody?.errors?.[0]?.detail ?? `HTTP ${response.status}`;

        console.error("[Telnyx] HTTP error", {
          status: response.status,
          to: request.to,
          detail: errorDetail,
        });

        return {
          success: false,
          code: mapHttpStatusToErrorCode(response.status),
          message: errorDetail,
          provider: this.type,
          retryable: response.status >= 500,
        };
      }

      const data = (await response.json()) as TelnyxSendResponse;

      return {
        success: true,
        id: data.data.id,
        provider: this.type,
        cost: Number.parseFloat(data.data.cost.amount),
      };
    } catch (error) {
      const smsError = SMSError.fromUnknown(error, this.type);
      console.error("[Telnyx] Request failed", { to: request.to, error: smsError.message });

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

export function createTelnyxProvider(configs: SMSProviderConfigs): SMSProvider | null {
  if (!configs.telnyx) return null;
  return new TelnyxProvider(configs.telnyx);
}
