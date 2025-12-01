import { OpenPanel } from "@openpanel/web";

let opInstance: OpenPanel | null = null;

export function getOpenPanel(clientId: string): OpenPanel {
  if (!opInstance) {
    opInstance = new OpenPanel({
      clientId,
      apiUrl: "https://openpanel-api.mahali.dev",
      trackScreenViews: false,
      trackOutgoingLinks: true,
      trackAttributes: true,
    });
  }
  return opInstance;
}

export function getOp(): OpenPanel | null {
  return opInstance;
}

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

export function clearUserIdentity() {
  if (!opInstance) return;
  opInstance.clear();
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (!opInstance) return;
  opInstance.track(name, properties);
}

export async function fetchDeviceId(): Promise<string | null> {
  if (!opInstance) return null;
  return opInstance.fetchDeviceId();
}

export { opInstance as op };
