import { OpenPanel } from "@openpanel/web";

let opInstance: OpenPanel | null = null;

export function getOpenPanel(clientId: string): OpenPanel {
  if (!opInstance) {
    opInstance = new OpenPanel({
      clientId,
      apiUrl: "https://openpanel-api.mahali.dev",
      trackScreenViews: true,
      trackOutgoingLinks: true,
      trackAttributes: true,
    });
  }
  return opInstance;
}

/**
 * Get the current OpenPanel instance.
 * Returns null if not initialized yet.
 */
export function getOp(): OpenPanel | null {
  return opInstance;
}

/**
 * Identify a user in OpenPanel.
 * Call this when a user logs in or their profile is updated.
 */
export function identifyUser(user: {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}) {
  if (!opInstance) return;

  const nameParts = user.name?.split(" ") ?? [];
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || undefined;

  opInstance.identify({
    profileId: user.id,
    email: user.email ?? undefined,
    firstName,
    lastName,
    avatar: user.image ?? undefined,
  });
}

/**
 * Clear the current user identity.
 * Call this when a user logs out.
 */
export function clearUserIdentity() {
  if (!opInstance) return;
  opInstance.clear();
}

/**
 * Track a custom event.
 */
export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (!opInstance) return;
  opInstance.track(name, properties);
}

/**
 * Get the device ID for revenue tracking.
 */
export async function fetchDeviceId(): Promise<string | null> {
  if (!opInstance) return null;
  return opInstance.fetchDeviceId();
}

export { opInstance as op };
