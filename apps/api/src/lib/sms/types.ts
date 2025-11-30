import { z } from "zod";

export const SMS_PROVIDERS = ["pilo", "zend", "telnyx", "prelude"] as const;
export type SMSProviderType = (typeof SMS_PROVIDERS)[number];

export const SMSErrorCode = {
  INVALID_CONFIG: "INVALID_CONFIG",
  PROVIDER_NOT_CONFIGURED: "PROVIDER_NOT_CONFIGURED",
  INVALID_PARAMS: "INVALID_PARAMS",
  INVALID_RECIPIENT: "INVALID_RECIPIENT",
  INVALID_SENDER: "INVALID_SENDER",
  INVALID_API_KEY: "INVALID_API_KEY",
  API_KEY_INACTIVE: "API_KEY_INACTIVE",
  SENDER_NOT_APPROVED: "SENDER_NOT_APPROVED",
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  UNKNOWN: "UNKNOWN",
} as const;

export type SMSErrorCodeType = (typeof SMSErrorCode)[keyof typeof SMSErrorCode];

export const PiloResponseCode = {
  SUCCESS: 1001,
  MISSING_PARAMS: 1002,
  INVALID_API_KEY: 1003,
  API_KEY_INACTIVE: 1004,
  INSUFFICIENT_BALANCE: 1005,
  INVALID_NUMBERS: 1006,
  SENDER_NOT_APPROVED: 1007,
} as const;

export type SMSRequest = {
  to: string;
  message: string;
};

export type SMSResult =
  | {
      success: true;
      id: string;
      provider: SMSProviderType;
      cost?: number;
    }
  | {
      success: false;
      code: SMSErrorCodeType;
      message: string;
      provider?: SMSProviderType;
      retryable: boolean;
    };

export type PiloConfig = {
  apiKey: string;
  senderId: string;
};

export type ZendConfig = {
  apiKey: string;
};

export type TelnyxConfig = {
  apiKey: string;
  fromNumber: string;
};

export type PreludeConfig = {
  apiToken: string;
  templateId?: string;
};

export type SMSProviderConfigs = {
  pilo?: PiloConfig;
  zend?: ZendConfig;
  telnyx?: TelnyxConfig;
  prelude?: PreludeConfig;
};

export const smsRoutingConfigSchema = z.object({
  routes: z.record(z.string(), z.array(z.enum(SMS_PROVIDERS))),
  fallback: z.enum(SMS_PROVIDERS),
});

export type SMSRoutingConfig = z.infer<typeof smsRoutingConfigSchema>;

export type SMSClientConfig = {
  routing: SMSRoutingConfig;
  providers: SMSProviderConfigs;
};
