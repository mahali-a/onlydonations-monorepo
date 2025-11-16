export type PaystackChargeData = {
  id: number | string;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  gateway_response?: string;
  paid_at?: string;
  created_at: string;
  channel?: string;
  authorization?: {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    channel: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
  };
  customer?: {
    id: number;
    email: string;
  };
  metadata?: Record<string, any>;
};

type PaystackDisputeData = PaystackChargeData & {
  dispute?: {
    id: number;
    amount: number;
    currency: string;
    status: string;
    reason: string;
    resolution?: string;
  };
};

type PaystackRefundData = PaystackChargeData & {
  refund?: {
    id: number;
    amount: number;
    currency: string;
    status: string;
  };
};

export type PaystackWebhookPayload = {
  event: string;
  data: PaystackChargeData | PaystackDisputeData | PaystackRefundData;
};

export type PaystackWebhookEvent =
  | "charge.success"
  | "charge.failed"
  | "charge.dispute.create"
  | "charge.dispute.resolve"
  | "refund.processed"
  | "refund.failed";

export type PaystackBank = {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  supports_transfer: boolean;
  available_for_direct_debit: boolean;
  active: boolean;
  country: string;
  currency: "NGN" | "GHS" | "KES" | "ZAR";
  type: "nuban" | "mobile_money" | "ghipss" | "kepss" | "basa" | "mobile_money_business";
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTransferRecipientParams = {
  type:
    | "nuban"
    | "mobile_money"
    | "authorization"
    | "ghipss"
    | "kepss"
    | "basa"
    | "mobile_money_business";
  name: string;
  description?: string;
  account_number: string;
  bank_code?: string;
  currency?: "NGN" | "GHS" | "KES" | "ZAR";
  email?: string;
  authorization_code?: string;
  metadata?: Record<string, any>;
};

export type TransferRecipientData = {
  id: number;
  recipient_code: string;
  name: string;
  description?: string;
  type: string;
  currency: string;
  account_number: string;
  bank_code?: string;
  bank_name?: string;
  email?: string;
  active: boolean;
  domain: string;
  integration: number;
  is_deleted: boolean;
  details: {
    authorization_code?: string;
    account_number?: string;
    account_name?: string;
    bank_code?: string;
    bank_name?: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type ResolveAccountParams = {
  account_number: string;
  bank_code: string;
};

export type ResolvedAccountData = {
  account_number: string;
  account_name: string;
  bank_id: number;
};

export type ValidateAccountParams = {
  bank_code: string;
  country_code: string;
  account_number: string;
  account_name: string;
  account_type: "personal" | "business";
  document_type: "identityNumber" | "passportNumber" | "businessRegistrationNumber";
  document_number: string;
};

export type ValidatedAccountData = {
  accountAcceptsDebits: boolean;
  accountAcceptsCredits: boolean;
  accountOpenForMoreThanThreeMonths: boolean;
  accountHolderMatch: boolean;
  accountOpen: boolean;
  account_type?: string;
  bank_code?: string;
  account_number?: string;
  account_name?: string;
  country_code?: string;
  reference?: string;
  status?: string;
  message?: string;
};

export type BankWithVerification = PaystackBank & {
  supported_types?: ("personal" | "business")[];
};

export type PaystackApiResponse<T = unknown> = {
  status: boolean;
  message: string;
  data: T;
};

export type InitializeTransactionData = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type RefundResponseData = {
  id: number;
  integration: number;
  domain: string;
  transaction: number;
  dispute: number;
  amount: number;
  currency: string;
  status: string;
  refunded_by?: string;
  refunded_at?: string;
  expected_at?: string;
  settlement?: number | null;
  deducted_amount?: number;
  customer_note?: string;
  merchant_note?: string;
  created_at: string;
  updated_at: string;
};

export type ListTransactionsData = PaystackChargeData[];

export type InitiateTransferParams = {
  source: "balance";
  amount: number;
  recipient: string;
  reference: string;
  reason?: string;
  currency?: "NGN" | "GHS" | "KES" | "ZAR";
};

export type TransferData = {
  id: number;
  transfer_code: string;
  reference: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed" | "otp";
  reason: string | null;
  recipient: number;
  domain: string;
  integration: number;
  createdAt: string;
  updatedAt: string;
  transferred_at: string | null;
  fee_charged?: number;
  fees_breakdown?: Record<string, unknown>;
};
