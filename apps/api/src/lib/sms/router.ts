import type { SMSProviderType, SMSRoutingConfig } from "./types";

export function matchProviderChain(phone: string, config: SMSRoutingConfig): SMSProviderType[] {
  const prefixes = Object.keys(config.routes)
    .filter((p) => p !== "default")
    .sort((a, b) => b.length - a.length);

  for (const prefix of prefixes) {
    if (phone.startsWith(prefix)) {
      const route = config.routes[prefix];
      if (route) return route;
    }
  }

  const defaultRoute = config.routes.default;
  if (defaultRoute) {
    return defaultRoute;
  }

  return [config.fallback];
}
