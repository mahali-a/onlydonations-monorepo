import { nanoid } from "nanoid";
import type { SmileTokenRequest, SmileTokenResponse } from "./kyc-types";
import { logger } from "@/lib/logger";

export async function generateSmileToken(
  request: SmileTokenRequest,
  config: {
    partnerId: string;
    apiKey: string;
    environment: "sandbox" | "production";
  },
): Promise<SmileTokenResponse> {
  const timestamp = new Date().toISOString();
  const signature = await generateSignature({
    partnerId: config.partnerId,
    timestamp,
    apiKey: config.apiKey,
  });

  const baseUrl =
    config.environment === "production"
      ? "https://api.smileidentity.com/v1"
      : "https://testapi.smileidentity.com/v1";

  const response = await fetch(`${baseUrl}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      partner_id: config.partnerId,
      timestamp,
      signature,
      user_id: request.user_id,
      job_id: request.job_id,
      product: request.product,
      callback_url: request.callback_url,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Smile Identity API error: ${error}`);
  }

  const data = (await response.json()) as { token: string };

  return {
    token: data.token,
    jobId: request.job_id,
    userId: request.user_id,
  };
}

async function generateSignature(params: {
  partnerId: string;
  timestamp: string;
  apiKey: string;
}): Promise<string> {
  const message = `${params.timestamp}${params.partnerId}sid_request`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(params.apiKey);
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

export function generateJobId(): string {
  return `job-${nanoid()}`;
}

export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  apiKey: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiKey);
  const messageData = encoder.encode(payload);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const expectedSignature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);

  // Convert both to Buffers for timing-safe comparison
  // We need to handle the case where signature is not a valid hex string or wrong length
  try {
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    const { timingSafeEqual } = await import("node:crypto");
    return timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    logger.error("verifyWebhookSignature.error", error);
    return false;
  }
}
