/**
 * SMS Provider Types
 */
export const SMSProvider = {
  PILO: "pilo",
  TELNYX: "telnyx",
} as const;

export type SMSProviderType = (typeof SMSProvider)[keyof typeof SMSProvider];

/**
 * SMS Error Codes
 */
export const SMSErrorCode = {
  // Config errors
  INVALID_CONFIG: "INVALID_CONFIG",
  PROVIDER_NOT_CONFIGURED: "PROVIDER_NOT_CONFIGURED",

  // Request errors
  INVALID_PARAMS: "INVALID_PARAMS",
  INVALID_RECIPIENT: "INVALID_RECIPIENT",
  INVALID_SENDER: "INVALID_SENDER",

  // Auth errors
  INVALID_API_KEY: "INVALID_API_KEY",
  API_KEY_INACTIVE: "API_KEY_INACTIVE",
  SENDER_NOT_APPROVED: "SENDER_NOT_APPROVED",

  // Balance errors
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",

  // Network errors
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",

  // Unknown
  UNKNOWN: "UNKNOWN",
} as const;

export type SMSErrorCodeType = (typeof SMSErrorCode)[keyof typeof SMSErrorCode];

/**
 * Pilo-specific response codes mapped to our error codes
 */
export const PiloResponseCode = {
  SUCCESS: 1001,
  MISSING_PARAMS: 1002,
  INVALID_API_KEY: 1003,
  API_KEY_INACTIVE: 1004,
  INSUFFICIENT_BALANCE: 1005,
  INVALID_NUMBERS: 1006,
  SENDER_NOT_APPROVED: 1007,
} as const;

/**
 * SMS Request
 */
export type SMSRequest = {
  to: string;
  message: string;
};

/**
 * SMS Result - discriminated union for success/failure
 */
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

/**
 * Balance Info
 */
export type BalanceInfo = {
  balance: number;
  units: number;
  lastTopup?: {
    date: string;
    amount: string;
    status: string;
  };
};

/**
 * Routing Rule
 */
export type RoutingRule = {
  prefix: string;
  provider: SMSProviderType;
};

/**
 * Provider-specific configs
 */
export type PiloConfig = {
  apiKey: string;
  senderId: string;
};

export type TelnyxConfig = {
  apiKey: string;
  fromNumber: string;
};

/**
 * SMS Client Config
 */
export type SMSConfig = {
  routes: string; // e.g., "+233:pilo,default:telnyx"
  fallbackProvider: SMSProviderType;
  pilo?: PiloConfig;
  telnyx?: TelnyxConfig;
};
