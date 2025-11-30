import type { SMSProviderType, SMSRequest, SMSResult } from "../types";

export interface SMSProvider {
  readonly type: SMSProviderType;
  send(request: SMSRequest): Promise<SMSResult>;
}
