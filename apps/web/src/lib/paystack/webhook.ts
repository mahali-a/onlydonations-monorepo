import { createHmac, timingSafeEqual } from "node:crypto";
import { logger } from "@/lib/logger";

export function verifySignature(payload: string, signature: string, env: Env): boolean {
  try {
    const expectedSignature = createHmac("sha512", env.PAYSTACK_SECRET_KEY)
      .update(payload)
      .digest("hex");

    return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"));
  } catch (error) {
    logger.error("webhook.verify_signature.error", error);
    return false;
  }
}
