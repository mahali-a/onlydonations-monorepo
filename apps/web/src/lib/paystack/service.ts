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
import { env } from "cloudflare:workers";

export class PaystackService {
  private readonly secretKey: string;
  private readonly baseUrl = "https://api.paystack.co";

  constructor() {
    this.secretKey = env.PAYSTACK_SECRET_KEY;
  }

  private async makeRequest<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<PaystackApiResponse<T>> {
    const startTime = Date.now();
    const method = options.method || "GET";

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
    const result = await this.makeRequest<InitializeTransactionData>(
      "/transaction/initialize",
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    );

    return result;
  }

  async verifyTransaction(reference: string) {
    const result = await this.makeRequest<PaystackChargeData>(
      `/transaction/verify/${reference}`,
    );

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
    return this.makeRequest<ListTransactionsData>(
      `/transaction${query ? `?${query}` : ""}`,
    );
  }

  async createRefund(params: {
    transaction: string;
    amount?: number;
    currency?: string;
    customer_note?: string;
    merchant_note?: string;
  }) {
    const result = await this.makeRequest<RefundResponseData>("/refund", {
      method: "POST",
      body: JSON.stringify(params),
    });

    return result;
  }

  async listBanks(params?: {
    currency?: "NGN" | "GHS" | "KES" | "ZAR";
    type?:
      | "nuban"
      | "mobile_money"
      | "ghipss"
      | "kepss"
      | "basa"
      | "mobile_money_business";
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
    const result = await this.makeRequest<PaystackBank[]>(
      `/bank${query ? `?${query}` : ""}`,
    );

    return result;
  }

  async resolveAccount(params: ResolveAccountParams) {
    const searchParams = new URLSearchParams(params);
    const result = await this.makeRequest<ResolvedAccountData>(
      `/bank/resolve?${searchParams.toString()}`,
    );

    return result;
  }

  async validateAccount(params: ValidateAccountParams) {
    const result = await this.makeRequest<ValidatedAccountData>(
      "/bank/validate",
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    );

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
    const result = await this.makeRequest<TransferRecipientData>(
      "/transferrecipient",
      {
        method: "POST",
        body: JSON.stringify(params),
      },
    );

    return result;
  }

  async initiateTransfer(params: InitiateTransferParams) {
    const result = await this.makeRequest<TransferData>("/transfer", {
      method: "POST",
      body: JSON.stringify(params),
    });

    return result;
  }

  async verifyTransfer(reference: string) {
    const result = await this.makeRequest<TransferData>(
      `/transfer/verify/${reference}`,
    );

    return result;
  }
}

export const paystackService = () => new PaystackService();
