import { type RoutingRule, SMSProvider, type SMSProviderType } from "./types";

/**
 * Check if a string is a valid provider type
 */
function isValidProvider(provider: string): provider is SMSProviderType {
  return Object.values(SMSProvider).includes(provider as SMSProviderType);
}

/**
 * Parse routing rules from config string
 *
 * Format: "prefix:provider,prefix:provider,default:provider"
 * Example: "+233:pilo,+1:telnyx,default:telnyx"
 */
export function parseRoutingRules(routesConfig: string): RoutingRule[] {
  const rules: RoutingRule[] = [];

  for (const rule of routesConfig.split(",")) {
    const trimmed = rule.trim();
    if (!trimmed) continue;

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;

    const prefix = trimmed.slice(0, colonIndex);
    const provider = trimmed.slice(colonIndex + 1);

    if (!prefix || !provider) continue;

    if (!isValidProvider(provider)) {
      console.error("[SMSRouter] Invalid provider in routing rules", {
        provider,
        rule: trimmed,
      });
      continue;
    }

    rules.push({ prefix, provider });
  }

  return rules;
}

/**
 * Find matching provider for a phone number
 *
 * @returns The provider type to use, or null if no match found
 */
export function matchProvider(phone: string, rules: RoutingRule[]): SMSProviderType | null {
  // First, try to match specific prefixes (excluding "default")
  for (const rule of rules) {
    if (rule.prefix === "default") continue;
    if (phone.startsWith(rule.prefix)) {
      return rule.provider;
    }
  }

  // Fall back to default rule if present
  const defaultRule = rules.find((r) => r.prefix === "default");
  return defaultRule?.provider ?? null;
}
