import { getAuth } from "@repo/core/auth/server";
import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { Honeypot, SpamError } from "@/lib/honeypot";
import { logger } from "@/lib/logger";

export const generateLoginHoneypotFromServer = createServerFn({ method: "GET" }).handler(
  async () => {
    const honeypot = new Honeypot({
      randomizeNameFieldName: true,
      encryptionSeed: env.HONEYPOT_SECRET,
    });

    return await honeypot.getInputProps();
  },
);

type SendLoginOtpOnServerInput = {
  email: string;
  honeypotData: Record<string, string>;
};

export const sendLoginOtpOnServer = createServerFn({ method: "POST" })
  .inputValidator((data: SendLoginOtpOnServerInput) => data)
  .handler(async ({ data }) => {
    const honeypot = new Honeypot({
      randomizeNameFieldName: true,
      encryptionSeed: env.HONEYPOT_SECRET,
    });

    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(data.honeypotData)) {
        formData.append(key, value);
      }

      await honeypot.check(formData);

      const auth = getAuth();
      // @ts-expect-error - Better Auth type inference limitation
      const result = await auth.api.sendVerificationOTP({
        body: {
          email: data.email,
          type: "sign-in",
        },
      });

      return result;
    } catch (error) {
      if (error instanceof SpamError) {
        logger.error("Honeypot spam detected on login", { error: error.message });
        return { data: null, error: null };
      }
      throw error;
    }
  });
