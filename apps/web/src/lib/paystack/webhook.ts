import { createHmac, timingSafeEqual } from "node:crypto";
// import {
//   retrieveDonationFromDatabaseByReference,
//   updateDonationStatusInDatabaseById,
// } from "~/features/donations/donations-models.server";
// import { updateRefundStatus } from "~/features/finance/payment-models.server";
// import { updatePaymentTransaction } from "~/features/finance/payment-service.server";
// import {
//   getWebhookEventByProcessorEventId,
//   storeWebhookEvent,
//   updateWebhookEventStatusByProcessorEventId,
// } from "~/features/webhook/webhook-models.server";
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

// export async function processWebhook(payload: any, signature: string): Promise<void> {
//   const eventId =
//     typeof payload.data.id === "string" ? payload.data.id : payload.data.id.toString();
//
//   const existingEvent = await getWebhookEventByProcessorEventId(eventId);
//   if (existingEvent) {
//     logger.info("webhook.duplicate", { eventId, eventType: payload.event });
//     return;
//   }
//
//   await storeWebhookEvent(payload, signature);
//
//   switch (payload.event) {
//     case "charge.success":
//       await handleChargeSuccess(payload.data);
//       break;
//     case "charge.failed":
//       await handleChargeFailed(payload.data);
//       break;
//     case "charge.dispute.create":
//       await handleDispute(payload.data, "DISPUTED");
//       break;
//     case "charge.dispute.resolve":
//       await handleDispute(payload.data, "SUCCESS");
//       break;
//     case "refund.processed":
//       await handleRefund(payload.data);
//       break;
//     default:
//       logger.warn("webhook.unhandled_event", { eventType: payload.event, eventId });
//   }
//
//   await updateWebhookEventStatusByProcessorEventId(eventId);
// }
//
// async function handleChargeSuccess(data: any): Promise<void> {
//   const donation = await retrieveDonationFromDatabaseByReference(data.reference);
//   if (!donation) {
//     logger.error("webhook.charge_success.donation_not_found", { reference: data.reference });
//     throw new Error(`Donation not found: ${data.reference}`);
//   }
//
//   if (data.amount && donation.amount !== data.amount) {
//     logger.error("webhook.charge_success.amount_mismatch", {
//       reference: data.reference,
//       expected: donation.amount,
//       received: data.amount,
//     });
//     throw new Error(`Amount mismatch for ${data.reference}`);
//   }
//
//   if (donation.status === "SUCCESS") {
//     logger.info("webhook.charge_success.already_processed", { reference: data.reference });
//     return;
//   }
//
//   if (donation.paymentTransactionId) {
//     await updatePaymentTransaction(donation.paymentTransactionId, {
//       status: "SUCCESS",
//       processorTransactionId: data.id?.toString(),
//       paymentMethod: data.channel,
//       statusMessage: data.gateway_response,
//       metadata: JSON.stringify(data),
//       fees: data.fees || 0,
//       completedAt: data.paid_at ? new Date(data.paid_at) : new Date(),
//     });
//   }
//
//   await updateDonationStatusInDatabaseById(
//     donation.id,
//     "SUCCESS",
//     data.paid_at ? new Date(data.paid_at) : new Date(),
//   );
//
//   logger.info("webhook.charge_success.completed", {
//     reference: data.reference,
//     donationId: donation.id,
//     amount: data.amount,
//   });
// }
//
// async function handleChargeFailed(data: any): Promise<void> {
//   const donation = await retrieveDonationFromDatabaseByReference(data.reference);
//   if (!donation) {
//     logger.error("webhook.charge_failed.donation_not_found", { reference: data.reference });
//     throw new Error(`Donation not found: ${data.reference}`);
//   }
//
//   if (donation.paymentTransactionId) {
//     await updatePaymentTransaction(donation.paymentTransactionId, {
//       status: "FAILED",
//       statusMessage: data.gateway_response || "Payment failed",
//       metadata: JSON.stringify(data),
//     });
//   }
//
//   await updateDonationStatusInDatabaseById(donation.id, "FAILED");
//
//   logger.info("webhook.charge_failed.completed", {
//     reference: data.reference,
//     reason: data.gateway_response,
//   });
// }
//
// async function handleDispute(data: any, newStatus: "DISPUTED" | "SUCCESS"): Promise<void> {
//   const donation = await retrieveDonationFromDatabaseByReference(data.reference);
//   if (!donation) {
//     logger.error("webhook.dispute.donation_not_found", { reference: data.reference });
//     throw new Error(`Donation not found: ${data.reference}`);
//   }
//
//   if (donation.paymentTransactionId) {
//     await updatePaymentTransaction(donation.paymentTransactionId, {
//       status: newStatus,
//       statusMessage: data.gateway_response || `Dispute ${newStatus.toLowerCase()}`,
//       metadata: JSON.stringify(data),
//     });
//   }
//
//   const donationStatus = newStatus === "DISPUTED" ? "FAILED" : "SUCCESS";
//   await updateDonationStatusInDatabaseById(
//     donation.id,
//     donationStatus,
//     newStatus === "SUCCESS" ? new Date() : undefined,
//   );
//
//   logger.info("webhook.dispute.completed", {
//     reference: data.reference,
//     disputeStatus: newStatus,
//   });
// }
//
// async function handleRefund(data: any): Promise<void> {
//   const donation = await retrieveDonationFromDatabaseByReference(data.reference);
//   if (!donation) {
//     logger.error("webhook.refund.donation_not_found", { reference: data.reference });
//     throw new Error(`Donation not found: ${data.reference}`);
//   }
//
//   if (donation.paymentTransactionId) {
//     await updatePaymentTransaction(donation.paymentTransactionId, {
//       status: "REFUNDED",
//       statusMessage: "Refund processed successfully",
//       metadata: JSON.stringify(data),
//     });
//
//     await updateRefundStatus(donation.paymentTransactionId, data.id?.toString() || "", "SUCCESS");
//   }
//
//   await updateDonationStatusInDatabaseById(donation.id, "FAILED");
//
//   logger.info("webhook.refund.completed", {
//     reference: data.reference,
//     refundAmount: data.refund?.amount,
//   });
// }
