import {
  anonymousClient,
  emailOTPClient,
  lastLoginMethodClient,
  organizationClient,
  phoneNumberClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { useEffect } from "react";

export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
    organizationClient(),
    phoneNumberClient(),
    anonymousClient(),
    lastLoginMethodClient(),
  ],
});

export const { signIn, signOut, useSession } = authClient;

/**
 * Hook to automatically create an anonymous session if user is not logged in.
 * Useful for tracking donations and other actions before user signs up.
 */
export function useAnonymousAuth() {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      signIn.anonymous();
    }
  }, [session, isPending]);

  return { session, isPending };
}
