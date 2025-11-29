import { PiloProvider } from "./providers/pilo";
import type { SMSProvider } from "./providers/provider";
import { TelnyxProvider } from "./providers/telnyx";
import { matchProvider, parseRoutingRules } from "./router";
import {
  type RoutingRule,
  type SMSConfig,
  SMSErrorCode,
  SMSProvider as SMSProviderConst,
  type SMSProviderType,
  type SMSRequest,
  type SMSResult,
} from "./types";

/**
 * SMS Client
 *
 * Main entry point for sending SMS messages. Handles:
 * - Provider routing based on phone number prefix
 * - Automatic fallback on failure
 * - Provider instance caching
 */
export class SMSClient {
  private readonly providers: Map<SMSProviderType, SMSProvider>;
  private readonly rules: RoutingRule[];
  private readonly fallbackProvider: SMSProviderType;

  constructor(config: SMSConfig) {
    this.rules = parseRoutingRules(config.routes);
    this.fallbackProvider = config.fallbackProvider;
    this.providers = this.initializeProviders(config);
  }

  /**
   * Initialize provider instances (cached for reuse)
   */
  private initializeProviders(config: SMSConfig): Map<SMSProviderType, SMSProvider> {
    const providers = new Map<SMSProviderType, SMSProvider>();

    if (config.pilo) {
      providers.set(SMSProviderConst.PILO, new PiloProvider(config.pilo));
    }

    if (config.telnyx) {
      providers.set(SMSProviderConst.TELNYX, new TelnyxProvider(config.telnyx));
    }

    return providers;
  }

  /**
   * Get provider instance by type
   */
  private getProvider(type: SMSProviderType): SMSProvider | undefined {
    return this.providers.get(type);
  }

  /**
   * Send an SMS message
   *
   * Routes to appropriate provider based on phone number prefix,
   * with automatic fallback on failure.
   */
  async send(request: SMSRequest): Promise<SMSResult> {
    // Determine primary provider
    const primaryType = matchProvider(request.to, this.rules) ?? this.fallbackProvider;
    const primary = this.getProvider(primaryType);

    if (!primary) {
      console.error("[SMSClient] Primary provider not configured", {
        provider: primaryType,
        to: request.to,
      });
      return {
        success: false,
        code: SMSErrorCode.PROVIDER_NOT_CONFIGURED,
        message: `Provider '${primaryType}' is not configured`,
        provider: primaryType,
        retryable: false,
      };
    }

    // Try primary provider
    const result = await primary.send(request);

    if (result.success) {
      return result;
    }

    // If primary failed and is retryable, try fallback
    if (result.retryable && this.fallbackProvider !== primaryType) {
      return this.tryFallback(request, primaryType);
    }

    return result;
  }

  /**
   * Try fallback provider after primary failure
   */
  private async tryFallback(
    request: SMSRequest,
    failedProvider: SMSProviderType,
  ): Promise<SMSResult> {
    const fallback = this.getProvider(this.fallbackProvider);

    if (!fallback) {
      console.error("[SMSClient] Fallback provider not configured", {
        fallback: this.fallbackProvider,
        to: request.to,
      });
      return {
        success: false,
        code: SMSErrorCode.PROVIDER_NOT_CONFIGURED,
        message: `Fallback provider '${this.fallbackProvider}' is not configured`,
        provider: this.fallbackProvider,
        retryable: false,
      };
    }

    const result = await fallback.send(request);

    if (!result.success) {
      console.error("[SMSClient] Fallback also failed", {
        primary: failedProvider,
        fallback: this.fallbackProvider,
        to: request.to,
        code: result.code,
      });
    }

    return result;
  }

  /**
   * Send a verification code SMS
   */
  async sendVerification(phone: string, code: string): Promise<SMSResult> {
    return this.send({
      to: phone,
      message: `Your verification code is: ${code}`,
    });
  }

  /**
   * Check balance for a specific provider
   */
  async checkBalance(providerType: SMSProviderType): Promise<{
    balance: number;
    units: number;
  } | null> {
    const provider = this.getProvider(providerType);

    if (!provider?.checkBalance) {
      return null;
    }

    return provider.checkBalance();
  }
}

/**
 * Create an SMS client instance
 */
export function createSMSClient(config: SMSConfig): SMSClient {
  return new SMSClient(config);
}
