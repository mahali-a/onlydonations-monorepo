import type { SMSRoutingConfig } from "./types";

export const smsRoutingConfig: SMSRoutingConfig = {
  routes: {
    "+233": ["zend", "pilo"],
    "+1": ["telnyx"],
    default: ["prelude"],
  },
  fallback: "telnyx",
};

export function getSmsRoutingConfig(): SMSRoutingConfig {
  return smsRoutingConfig;
}
