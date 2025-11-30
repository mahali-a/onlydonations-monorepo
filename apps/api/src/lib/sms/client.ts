import type { SMSProvider } from "./providers/provider";
import { createProvider } from "./registry";
import { matchProviderChain } from "./router";
import {
  type SMSClientConfig,
  SMSErrorCode,
  type SMSProviderType,
  type SMSRequest,
  type SMSResult,
} from "./types";

export class SMSClient {
  private readonly providers = new Map<SMSProviderType, SMSProvider>();
  private readonly config: SMSClientConfig;

  constructor(config: SMSClientConfig) {
    this.config = config;
  }

  private async getProvider(type: SMSProviderType): Promise<SMSProvider | null> {
    if (this.providers.has(type)) {
      return this.providers.get(type) ?? null;
    }

    const provider = await createProvider(type, this.config.providers);
    if (provider) {
      this.providers.set(type, provider);
    }

    return provider;
  }

  async send(request: SMSRequest): Promise<SMSResult> {
    const chain = matchProviderChain(request.to, this.config.routing);
    let lastResult: SMSResult | null = null;

    for (const providerType of chain) {
      const provider = await this.getProvider(providerType);

      if (!provider) {
        console.error(`[SMSClient] Provider '${providerType}' not configured, skipping`);
        continue;
      }

      const result = await provider.send(request);

      if (result.success) {
        return result;
      }

      lastResult = result;

      if (!result.retryable) {
        return result;
      }

      console.error(`[SMSClient] Provider '${providerType}' failed, trying next in chain`, {
        to: request.to,
        code: result.code,
        message: result.message,
      });
    }

    const fallbackType = this.config.routing.fallback;
    if (!chain.includes(fallbackType)) {
      const fallback = await this.getProvider(fallbackType);

      if (fallback) {
        console.error(`[SMSClient] Chain exhausted, trying global fallback '${fallbackType}'`);
        return fallback.send(request);
      }
    }

    return (
      lastResult ?? {
        success: false,
        code: SMSErrorCode.PROVIDER_NOT_CONFIGURED,
        message: "No providers available for this destination",
        retryable: false,
      }
    );
  }
}

export function createSMSClient(config: SMSClientConfig): SMSClient {
  return new SMSClient(config);
}
