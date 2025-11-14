import { logger } from "@/lib/logger";
import type {
  InitializeTransactionData,
  InitiateTransferParams,
  ListTransactionsData,
  PaystackApiResponse,
  PaystackBank,
  PaystackChargeData,
  RefundResponseData,
  ResolveAccountParams,
  ResolvedAccountData,
  TransferData,
  TransferRecipientData,
  ValidateAccountParams,
  ValidatedAccountData,
} from "./types";

export class PaystackService {
  private readonly secretKey: string;
  private readonly baseUrl = "https://api.paystack.co";

  constructor(env: Env) {
    this.secretKey = env.PAYSTACK_SECRET_KEY;
  }

  private async makeRequest<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<PaystackApiResponse<T>> {
    const startTime = Date.now();
    const method = options.method || "GET";

    logger.info("paystack.api.request", {
      endpoint,
      method,
      hasBody: !!options.body,
    });

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const duration = Date.now() - startTime;
      const data = (await response.json()) as PaystackApiResponse<T>;

      if (!response.ok) {
        logger.error("paystack.api.error", {
          endpoint,
          method,
          status: response.status,
          statusText: response.statusText,
          duration,
          paystackMessage: data.message,
          paystackData: data.data,
        });
        throw new Error(
          `Paystack API error: ${response.status} - ${data.message || response.statusText}`,
        );
      }

      logger.info("paystack.api.success", {
        endpoint,
        method,
        status: response.status,
        duration,
        success: data.status,
      });

      return data;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("paystack.api.exception", {
        endpoint,
        method,
        duration,
        error,
      });

      throw error;
    }
  }

  async initializePayment(params: {
    email: string;
    amount: number;
    reference: string;
    currency?: string;
    callback_url?: string;
    metadata?: Record<string, any>;
  }) {
    logger.info("paystack.initialize_payment.start", {
      reference: params.reference,
      amount: params.amount,
      currency: params.currency,
      email: params.email,
    });

    const result = await this.makeRequest<InitializeTransactionData>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify(params),
    });

    logger.info("paystack.initialize_payment.result", {
      reference: params.reference,
      success: result.status,
      authorizationUrl: result.data.authorization_url,
      accessCode: result.data.access_code,
    });

    return result;
  }

  async verifyTransaction(reference: string) {
    logger.info("paystack.verify_transaction.start", { reference });

    const result = await this.makeRequest<PaystackChargeData>(`/transaction/verify/${reference}`);

    logger.info("paystack.verify_transaction.result", {
      reference,
      success: result.status,
      transactionStatus: result.data.status,
      amount: result.data.amount,
      currency: result.data.currency,
      paidAt: result.data.paid_at,
    });

    return result;
  }

  async listTransactions(params?: {
    perPage?: number;
    page?: number;
    status?: string;
    from?: string;
    to?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.makeRequest<ListTransactionsData>(`/transaction${query ? `?${query}` : ""}`);
  }

  async createRefund(params: {
    transaction: string;
    amount?: number;
    currency?: string;
    customer_note?: string;
    merchant_note?: string;
  }) {
    logger.info("paystack.create_refund.start", {
      transaction: params.transaction,
      amount: params.amount,
      currency: params.currency,
      reason: params.customer_note,
    });

    const result = await this.makeRequest<RefundResponseData>("/refund", {
      method: "POST",
      body: JSON.stringify(params),
    });

    logger.info("paystack.create_refund.result", {
      transaction: params.transaction,
      success: result.status,
      refundId: result.data.id,
      refundStatus: result.data.status,
    });

    return result;
  }

  async listBanks(params?: {
    currency?: "NGN" | "GHS" | "KES" | "ZAR";
    type?: "nuban" | "mobile_money" | "ghipss" | "kepss" | "basa" | "mobile_money_business";
    enabled_for_verification?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    logger.info("paystack.list_banks.start", {
      currency: params?.currency,
      type: params?.type,
      enabled_for_verification: params?.enabled_for_verification,
    });

    const result = await this.makeRequest<PaystackBank[]>(`/bank${query ? `?${query}` : ""}`);

    logger.info("paystack.list_banks.result", {
      currency: params?.currency,
      type: params?.type,
      enabled_for_verification: params?.enabled_for_verification,
      count: result.data.length,
      success: result.status,
    });

    return result;
  }

  async resolveAccount(params: ResolveAccountParams) {
    logger.info("paystack.resolve_account.start", {
      account_number: params.account_number,
      bank_code: params.bank_code,
    });

    const searchParams = new URLSearchParams(params);
    const result = await this.makeRequest<ResolvedAccountData>(
      `/bank/resolve?${searchParams.toString()}`,
    );

    logger.info("paystack.resolve_account.result", {
      account_number: params.account_number,
      bank_code: params.bank_code,
      success: result.status,
      account_name: result.data.account_name,
    });

    return result;
  }

  async validateAccount(params: ValidateAccountParams) {
    logger.info("paystack.validate_account.start", {
      bank_code: params.bank_code,
      country_code: params.country_code,
      account_number: params.account_number,
      account_type: params.account_type,
      document_type: params.document_type,
    });

    const result = await this.makeRequest<ValidatedAccountData>("/bank/validate", {
      method: "POST",
      body: JSON.stringify(params),
    });

    logger.info("paystack.validate_account.result", {
      bank_code: params.bank_code,
      country_code: params.country_code,
      account_number: params.account_number,
      success: result.status,
      accountAcceptsCredits: result.data.accountAcceptsCredits,
      accountAcceptsDebits: result.data.accountAcceptsDebits,
      accountHolderMatch: result.data.accountHolderMatch,
      accountOpen: result.data.accountOpen,
    });

    return result;
  }

  async createTransferRecipient(params: {
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
    currency?: string;
    email?: string;
    authorization_code?: string;
    metadata?: Record<string, any>;
  }) {
    logger.info("paystack.create_recipient.start", {
      name: params.name,
      type: params.type,
      currency: params.currency,
      accountNumber: params.account_number,
      bankCode: params.bank_code,
    });

    const result = await this.makeRequest<TransferRecipientData>("/transferrecipient", {
      method: "POST",
      body: JSON.stringify(params),
    });

    logger.info("paystack.create_recipient.result", {
      recipientCode: result.data.recipient_code,
      success: result.status,
    });

    return result;
  }

  async initiateTransfer(params: InitiateTransferParams) {
    logger.info("paystack.initiate_transfer.start", {
      reference: params.reference,
      amount: params.amount,
      currency: params.currency,
      recipient: params.recipient,
    });

    const result = await this.makeRequest<TransferData>("/transfer", {
      method: "POST",
      body: JSON.stringify(params),
    });

    logger.info("paystack.initiate_transfer.result", {
      reference: params.reference,
      success: result.status,
      transferCode: result.data.transfer_code,
      transferStatus: result.data.status,
    });

    return result;
  }

  async verifyTransfer(reference: string) {
    logger.info("paystack.verify_transfer.start", { reference });

    const result = await this.makeRequest<TransferData>(`/transfer/verify/${reference}`);

    logger.info("paystack.verify_transfer.result", {
      reference,
      success: result.status,
      transferStatus: result.data.status,
      amount: result.data.amount,
    });

    return result;
  }
}

export function createPaystackService(env: Env): PaystackService {
  return new PaystackService(env);
}

export const paystackService = (env: Env) => createPaystackService(env);
