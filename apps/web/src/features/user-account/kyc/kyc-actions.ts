import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import { logger } from "@/lib/logger";
import { retry } from "@/lib/retry";
import { authMiddleware } from "@/server/middleware/auth";
import type { KycProduct } from "./kyc-models";
import { saveVerificationJobToDatabase } from "./kyc-models";

const kycLogger = logger.createChildLogger("kyc-actions");

async function generateSmileSignature(
  partnerId: string,
  apiKey: string,
  timestamp: string,
): Promise<string> {
  const message = `${timestamp}${partnerId}sid_request`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiKey);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);

  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureBase64 = btoa(String.fromCharCode(...signatureArray));

  return signatureBase64;
}

export const generateKycVerificationTokenOnServer = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected FormData");
    }

    return {
      product: (data.get("product")?.toString() || "biometric_kyc") as KycProduct,
    };
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const user = context.user;

    const validProducts: KycProduct[] = ["biometric_kyc", "doc_verification", "authentication"];

    if (!validProducts.includes(data.product)) {
      return {
        success: false,
        error: "Invalid product type",
      };
    }

    if (!(env.SMILE_PARTNER_ID && env.SMILE_API_KEY && env.SMILE_CALLBACK_URL)) {
      kycLogger.error("Smile Identity configuration missing");
      return {
        success: false,
        error: "Smile Identity configuration missing",
      };
    }

    try {
      const jobId = `job-${nanoid()}`;
      const timestamp = new Date().toISOString();

      const signature = await generateSmileSignature(
        env.SMILE_PARTNER_ID,
        env.SMILE_API_KEY,
        timestamp,
      );

      const baseUrl =
        env.SMILE_ENVIRONMENT === "production"
          ? "https://api.smileidentity.com/v1"
          : "https://testapi.smileidentity.com/v1";

      const result = await retry(
        async () => {
          const response = await fetch(`${baseUrl}/token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              partner_id: env.SMILE_PARTNER_ID,
              timestamp,
              signature,
              user_id: user.id,
              job_id: jobId,
              product: data.product,
              callback_url: env.SMILE_CALLBACK_URL,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Smile Identity API error: ${errorText}`);
          }

          const result = (await response.json()) as { token: string };

          if (!result.token) {
            throw new Error("No token returned from Smile Identity");
          }

          return result;
        },
        {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 10000,
          onRetry: (error, attempt) => {
            kycLogger.warn("Retrying token generation", {
              userId: user.id,
              jobId,
              attempt,
              error: error.message,
            });
          },
        },
      );

      await saveVerificationJobToDatabase({
        userId: user.id,
        smileJobId: jobId,
        product: data.product,
      });

      kycLogger.info("KYC verification token generated", {
        userId: user.id,
        jobId: jobId,
        product: data.product,
      });

      return {
        success: true,
        token: result.token,
        jobId: jobId,
        userId: user.id,
      };
    } catch (error) {
      kycLogger.error("Failed to generate verification token", error, {
        userId: user.id,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate verification token",
      };
    }
  });
