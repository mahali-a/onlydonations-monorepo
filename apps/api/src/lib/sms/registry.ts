import type { SMSProvider } from "./providers/provider";
import type { SMSProviderConfigs, SMSProviderType } from "./types";

type ProviderFactory = (configs: SMSProviderConfigs) => SMSProvider | null;
type LazyProviderLoader = () => Promise<ProviderFactory>;

const providerLoaders: Record<SMSProviderType, LazyProviderLoader> = {
  pilo: async () => {
    const { createPiloProvider } = await import("./providers/pilo");
    return createPiloProvider;
  },
  zend: async () => {
    const { createZendProvider } = await import("./providers/zend");
    return createZendProvider;
  },
  telnyx: async () => {
    const { createTelnyxProvider } = await import("./providers/telnyx");
    return createTelnyxProvider;
  },
  prelude: async () => {
    const { createPreludeProvider } = await import("./providers/prelude");
    return createPreludeProvider;
  },
};

const factoryCache = new Map<SMSProviderType, ProviderFactory>();

export function getRegisteredProviders(): SMSProviderType[] {
  return Object.keys(providerLoaders) as SMSProviderType[];
}

export function isProviderRegistered(type: SMSProviderType): boolean {
  return type in providerLoaders;
}

export async function createProvider(
  type: SMSProviderType,
  configs: SMSProviderConfigs,
): Promise<SMSProvider | null> {
  let factory = factoryCache.get(type);

  if (!factory) {
    const loader = providerLoaders[type];
    if (!loader) {
      console.error(`[SMSRegistry] Provider '${type}' is not registered`);
      return null;
    }

    factory = await loader();
    factoryCache.set(type, factory);
  }

  return factory(configs);
}
