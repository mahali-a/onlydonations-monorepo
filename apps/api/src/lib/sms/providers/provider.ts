import type { BalanceInfo, SMSProviderType, SMSRequest, SMSResult } from "../types";

/**
 * SMS Provider interface
 */
export interface SMSProvider {
  /**
   * Provider type identifier
   */
  readonly type: SMSProviderType;

  /**
   * Send an SMS message
   */
  send(request: SMSRequest): Promise<SMSResult>;

  /**
   * Check account balance (optional - not all providers support this)
   */
  checkBalance?(): Promise<BalanceInfo>;
}
