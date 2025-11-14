export type PaymentTransactionStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "DISPUTED"
  | "REFUNDED"
  | "REFUND_PENDING";

type StateTransitionResult = {
  allowed: boolean;
  reason?: string;
};

const PAYMENT_TRANSACTION_TRANSITIONS: Record<
  PaymentTransactionStatus,
  PaymentTransactionStatus[]
> = {
  PENDING: ["SUCCESS", "FAILED"],
  SUCCESS: ["DISPUTED", "REFUNDED", "REFUND_PENDING"],
  FAILED: ["PENDING"],
  DISPUTED: ["SUCCESS", "REFUNDED"],
  REFUNDED: [],
  REFUND_PENDING: ["REFUNDED", "SUCCESS"],
};

const TERMINAL_PAYMENT_STATES: PaymentTransactionStatus[] = ["REFUNDED"];

export function validatePaymentTransactionStatusTransition(
  currentStatus: PaymentTransactionStatus,
  newStatus: PaymentTransactionStatus,
): StateTransitionResult {
  if (currentStatus === newStatus) {
    return { allowed: true };
  }

  if (TERMINAL_PAYMENT_STATES.includes(currentStatus)) {
    return {
      allowed: false,
      reason: `Cannot change status from terminal state: ${currentStatus}`,
    };
  }

  const allowedTransitions = PAYMENT_TRANSACTION_TRANSITIONS[currentStatus];
  if (!allowedTransitions.includes(newStatus)) {
    return {
      allowed: false,
      reason: `Invalid transition from ${currentStatus} to ${newStatus}. Allowed: ${allowedTransitions.join(", ")}`,
    };
  }

  return { allowed: true };
}
