import Prelude from "@prelude.so/sdk";
import {
  type PreludeConfig,
  SMSErrorCode,
  type SMSProviderConfigs,
  type SMSRequest,
  type SMSResult,
} from "../types";
import type { SMSProvider } from "./provider";

export class PreludeProvider implements SMSProvider {
  readonly type = "prelude" as const;
  private readonly client: Prelude;
  private readonly templateId?: string;

  constructor(config: PreludeConfig) {
    this.client = new Prelude({
      apiToken: config.apiToken,
      maxRetries: 0,
      timeout: 30 * 1000,
    });
    this.templateId = config.templateId;
  }

  async send(request: SMSRequest): Promise<SMSResult> {
    if (!this.templateId) {
      return this.sendViaVerification(request);
    }

    try {
      const response = await this.client.transactional.send({
        template_id: this.templateId,
        to: request.to,
        variables: { message: request.message },
      });

      return { success: true, id: response.id, provider: this.type };
    } catch (error: unknown) {
      return this.handleError(error, request.to);
    }
  }

  private async sendViaVerification(request: SMSRequest): Promise<SMSResult> {
    try {
      const response = await this.client.verification.create({
        target: { type: "phone_number", value: request.to },
      });

      return { success: true, id: response.id, provider: this.type };
    } catch (error: unknown) {
      return this.handleError(error, request.to);
    }
  }

  private handleError(error: unknown, to: string): SMSResult {
    if (error instanceof Prelude.APIError) {
      console.error("[Prelude] API error", {
        to,
        status: error.status,
        name: error.name,
        message: error.message,
      });

      const errorCode =
        error.status === 401 || error.status === 403
          ? SMSErrorCode.INVALID_API_KEY
          : error.status === 400
            ? SMSErrorCode.INVALID_PARAMS
            : error.status === 422
              ? SMSErrorCode.INVALID_RECIPIENT
              : error.status === 429 || error.status >= 500
                ? SMSErrorCode.NETWORK_ERROR
                : SMSErrorCode.UNKNOWN;

      return {
        success: false,
        code: errorCode,
        message: error.message,
        provider: this.type,
        retryable: error.status === 429 || error.status >= 500,
      };
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Prelude] Request failed", { to, error: message });

    return {
      success: false,
      code: SMSErrorCode.NETWORK_ERROR,
      message,
      provider: this.type,
      retryable: true,
    };
  }
}

export function createPreludeProvider(configs: SMSProviderConfigs): SMSProvider | null {
  if (!configs.prelude) return null;
  return new PreludeProvider(configs.prelude);
}
