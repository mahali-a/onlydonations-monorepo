import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import { env } from "cloudflare:workers";
import { Honeypot, SpamError } from "@/lib/honeypot";
import { logger } from "@/lib/logger";
import { calculateFees } from "@/lib/fees/calculator";
import { PaystackService } from "@/lib/paystack";
import { donateSchema, type DonateFormData } from "./donate-schemas";
import {
  retrieveCampaignFromDatabaseBySlug,
  saveDonationToDatabase,
  updateDonationPaymentTransactionInDatabaseById,
} from "./donate-models";
import {
  DONATION_REFERENCE_PREFIX,
  MINOR_UNITS_MULTIPLIER,
  AMOUNT_VERIFICATION_TOLERANCE,
} from "./donate-constants";
import { savePaymentTransactionToDatabase } from "@/features/payments/server";

const donationsLogger = logger.createChildLogger("donations-actions");
const honeypot = new Honeypot();

function isValidationError(data: unknown): data is { error: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  );
}

function isValidatedDonationData(data: unknown): data is ValidatedDonationData {
  return (
    typeof data === "object" &&
    data !== null &&
    "campaignSlug" in data &&
    "amount" in data &&
    "currency" in data &&
    !("error" in data)
  );
}

function getFormDataString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function validateCampaign(campaignSlug: string) {
  const campaignData = await retrieveCampaignFromDatabaseBySlug(campaignSlug);

  if (!campaignData) {
    donationsLogger.error("process_donation.campaign_not_found", { campaignSlug });
    return {
      success: false as const,
      error: "Campaign not found",
    };
  }

  if (campaignData.status !== "ACTIVE") {
    donationsLogger.warn("process_donation.campaign_not_active", {
      campaignSlug,
      status: campaignData.status,
    });
    return {
      success: false as const,
      error: "Campaign is not accepting donations",
    };
  }

  if (campaignData.endDate && new Date(campaignData.endDate) < new Date()) {
    donationsLogger.warn("process_donation.campaign_ended", { campaignSlug });
    return {
      success: false as const,
      error: "Campaign has ended",
    };
  }

  return {
    success: true as const,
    data: campaignData,
  };
}

function calculateAndVerifyFees(
  amount: number,
  feeHandling: "DONOR_ASK_COVER" | "DONOR_REQUIRE_COVER" | "CAMPAIGN_ABSORB",
  coverFees: boolean,
  campaignSlug: string,
) {
  const feeCalculation = calculateFees(amount, feeHandling, coverFees);

  donationsLogger.info("process_donation.fees_calculated", {
    donationAmount: amount,
    feeHandling,
    coverFees,
    donorPays: feeCalculation.donorPays,
  });

  const serverSideVerification = calculateFees(amount, feeHandling, coverFees);

  if (
    Math.abs(serverSideVerification.donorPays - feeCalculation.donorPays) >
    AMOUNT_VERIFICATION_TOLERANCE
  ) {
    donationsLogger.error("process_donation.amount_mismatch", {
      expected: serverSideVerification.donorPays,
      received: feeCalculation.donorPays,
      campaignSlug,
    });
    return {
      success: false as const,
      error: "Payment amount verification failed. Please try again.",
    };
  }

  return {
    success: true as const,
    data: feeCalculation,
  };
}

type ValidatedDonationData = {
  campaignSlug: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorMessage?: string;
  isAnonymous: boolean;
  coverFees: boolean;
  currency: "GHS";
};

type InitializePaymentParams = DonateFormData & {
  campaignId: string;
  organizationId: string;
  amountToCharge: number;
};

type PaymentInitializationResult =
  | { success: true; authorizationUrl: string; reference: string; donationId: string }
  | { success: false; error: string };

async function initializePayment(
  params: InitializePaymentParams,
): Promise<PaymentInitializationResult> {
  const {
    campaignId,
    organizationId,
    amount,
    currency,
    donorName,
    donorEmail,
    donorMessage,
    isAnonymous,
    coverFees,
    amountToCharge,
  } = params;

  const reference = `${DONATION_REFERENCE_PREFIX}${nanoid()}`;
  const donationId = nanoid();
  const paymentTransactionId = nanoid();
  const amountInMinorUnits = Math.round(amountToCharge * MINOR_UNITS_MULTIPLIER);

  donationsLogger.info("initialize_payment.start", {
    donationId,
    reference,
    campaignId,
    amount,
    amountToCharge,
    currency,
  });

  try {
    await saveDonationToDatabase({
      id: donationId,
      campaignId,
      amount: amountInMinorUnits,
      currency,
      reference,
      donorId: null,
      donorName: isAnonymous ? null : donorName,
      donorEmail,
      donorMessage: donorMessage || null,
      isAnonymous,
      coverFees,
    });

    donationsLogger.info("initialize_payment.donation_created", {
      donationId,
      reference,
    });

    // Create payment transaction record for audit trail
    await savePaymentTransactionToDatabase({
      id: paymentTransactionId,
      organizationId,
      processor: "paystack",
      processorRef: reference,
      amount: amountInMinorUnits,
      fees: 0,
      currency,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Link donation to payment transaction
    await updateDonationPaymentTransactionInDatabaseById(donationId, paymentTransactionId);

    donationsLogger.info("initialize_payment.payment_transaction_created", {
      donationId,
      paymentTransactionId,
      reference,
    });

    const paystack = new PaystackService();
    const paystackResponse = await paystack.initializePayment({
      email: donorEmail,
      amount: amountInMinorUnits,
      reference,
      currency,
      callback_url: `${env.R2_PUBLIC_URL}/d/${donationId}/donation-status`,
      metadata: {
        campaignId,
        donationId,
        donorName: isAnonymous ? "Anonymous" : donorName,
        custom_fields: [
          {
            display_name: "Donation ID",
            variable_name: "donation_id",
            value: donationId,
          },
          {
            display_name: "Campaign ID",
            variable_name: "campaign_id",
            value: campaignId,
          },
        ],
      },
    });

    if (!paystackResponse.status || !paystackResponse.data?.authorization_url) {
      donationsLogger.error("initialize_payment.paystack_failed", {
        reference,
        donationId,
        paystackResponse,
      });
      return {
        success: false,
        error: "Unable to initialize payment. Please try again.",
      };
    }

    donationsLogger.info("initialize_payment.success", {
      reference,
      donationId,
      authorizationUrl: paystackResponse.data.authorization_url,
    });

    return {
      success: true,
      authorizationUrl: paystackResponse.data.authorization_url,
      reference,
      donationId,
    };
  } catch (error) {
    donationsLogger.error("initialize_payment.error", {
      reference,
      campaignId,
      donationId,
      error: (error as Error).message,
    });
    return {
      success: false,
      error: "Unable to process your donation. Please try again.",
    };
  }
}

export const processDonationOnServer = createServerFn({ method: "POST" })
  .inputValidator(async (data: unknown): Promise<{ error: string } | ValidatedDonationData> => {
    if (!(data instanceof FormData)) {
      return { error: "Invalid form data" };
    }

    try {
      await honeypot.check(data);
    } catch (error) {
      if (error instanceof SpamError) {
        donationsLogger.warn("process_donation.spam_detected", {
          error: error.message,
        });
        return { error: "Spam detected" };
      }
      return { error: "Validation failed" };
    }

    const campaignSlug = getFormDataString(data, "campaignSlug");
    const amount = Number(getFormDataString(data, "amount"));
    const donorName = getFormDataString(data, "donorName");
    const donorEmail = getFormDataString(data, "donorEmail");
    const donorPhone = getFormDataString(data, "donorPhone") || undefined;
    const donorMessage = getFormDataString(data, "donorMessage") || undefined;
    const isAnonymous = getFormDataString(data, "isAnonymous") === "true";
    const coverFees = getFormDataString(data, "coverFees") === "true";
    const currency = getFormDataString(data, "currency") || "GHS";

    try {
      const validated = donateSchema.parse({
        amount,
        donorName,
        donorEmail,
        donorPhone,
        donorMessage,
        isAnonymous,
        coverFees,
        currency,
      });

      return { ...validated, campaignSlug };
    } catch (_error) {
      return { error: "Invalid donation data" };
    }
  })
  .handler(
    async ({
      data,
    }): Promise<
      { success: false; error: string } | { success: true; redirectUrl: string; donationId: string }
    > => {
      if (isValidationError(data)) {
        return {
          success: false,
          error: data.error,
        };
      }

      if (!isValidatedDonationData(data)) {
        return {
          success: false,
          error: "Invalid donation data structure",
        };
      }

      const { campaignSlug, ...donationData } = data;

      donationsLogger.info("process_donation.start", {
        campaignSlug,
        amount: donationData.amount,
        currency: donationData.currency,
      });

      try {
        const campaignValidation = await validateCampaign(campaignSlug);
        if (!campaignValidation.success) {
          return campaignValidation;
        }

        const { data: campaignData } = campaignValidation;

        const feeVerification = calculateAndVerifyFees(
          donationData.amount,
          campaignData.feeHandling as "DONOR_ASK_COVER" | "DONOR_REQUIRE_COVER" | "CAMPAIGN_ABSORB",
          donationData.coverFees,
          campaignSlug,
        );

        if (!feeVerification.success) {
          return feeVerification;
        }

        const paymentResult = await initializePayment({
          ...donationData,
          campaignId: campaignData.id,
          organizationId: campaignData.organizationId,
          amountToCharge: feeVerification.data.donorPays,
        });

        if (!paymentResult.success) {
          return {
            success: false,
            error: paymentResult.error,
          };
        }

        donationsLogger.info("process_donation.success", {
          donationId: paymentResult.donationId,
          reference: paymentResult.reference,
        });

        return {
          success: true,
          redirectUrl: paymentResult.authorizationUrl,
          donationId: paymentResult.donationId,
        };
      } catch (error) {
        donationsLogger.error("process_donation.error", {
          campaignSlug,
          error: (error as Error).message,
        });

        return {
          success: false,
          error: "We couldn't process your donation. Please try again or contact support.",
        };
      }
    },
  );
