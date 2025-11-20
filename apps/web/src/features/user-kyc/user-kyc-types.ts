export type KycProduct = "biometric_kyc" | "doc_verification" | "authentication";

export type KycStatus = "PENDING" | "VERIFIED" | "REJECTED" | "REQUIRES_INPUT";

export type SmileIdentityConfig = {
  token: string;
  product: string;
  callback_url: string;
  environment: string;
  partner_details: {
    partner_id: string;
    name: string;
    logo_url?: string;
    policy_url?: string;
    theme_color?: string;
  };
  partner_params: {
    job_id: string;
    user_id: string;
    internal_reference: string;
  };
  document_capture_modes: string[];
  allow_agent_mode: boolean;
  onSuccess: (data: Record<string, unknown>) => void;
  onError: (error: Error | Record<string, unknown> | string) => void;
  onClose: () => void;
};

declare global {
  interface Window {
    SmileIdentity: (config: SmileIdentityConfig) => void;
  }
}

export type SmileTokenRequest = {
  user_id: string;
  job_id: string;
  product: KycProduct;
  callback_url: string;
};

export type SmileTokenResponse = {
  token: string;
  jobId: string;
  userId: string;
};

export type SmileWebhookPayload = {
  job_id: string;
  user_id: string;
  job_type: number;
  result: {
    ResultCode: string;
    ResultText: string;
    Actions: {
      Verify_ID_Number: string;
      Return_Personal_Info: string;
    };
  };
  signature: string;
  timestamp: string;
};
