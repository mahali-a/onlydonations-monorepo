import {
  anonymousClient,
  emailOTPClient,
  lastLoginMethodClient,
  organizationClient,
  phoneNumberClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

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
