import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { retrieveUserKycStatusFromDatabaseByUser } from "@/features/user-account/kyc/kyc-models";
import { logger } from "@/lib/logger";
import { promiseHash } from "@/lib/promise-hash";
import { requireOrganizationAccess } from "@/server/middleware/access-control";
import { authMiddleware } from "@/server/middleware/auth";
import {
  retrieveTotalRaisedFromDatabaseByOrganization,
  retrieveWithdrawalAccountsFromDatabaseByOrganization,
  retrieveWithdrawalAggregateFromDatabaseByOrganizationAndStatus,
} from "../org-payments-models";

const makeWithdrawalLogger = logger.createChildLogger("make-withdrawal-loaders");

export type KycStatus = "PENDING" | "VERIFIED" | "REJECTED" | "REQUIRES_INPUT";

export type WithdrawalVerificationStatus = {
  phone: {
    hasPhone: boolean;
    isVerified: boolean;
    phoneNumber: string | null;
  };
  kyc: {
    status: KycStatus;
    isVerified: boolean;
  };
  payoutAccount: {
    hasAccount: boolean;
  };
  allVerified: boolean;
};

export const retrieveMakeWithdrawalDataFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ orgId: z.string() }))
  .handler(async ({ data, context }) => {
    const { orgId } = data;
    const user = context.user;

    await requireOrganizationAccess(orgId, user.id);

    const organizationId = orgId;

    makeWithdrawalLogger.info("loader.start", { organizationId });

    try {
      const { withdrawalAccounts, donations, completedWithdrawals, pendingWithdrawals, kycStatus } =
        await promiseHash({
          withdrawalAccounts: retrieveWithdrawalAccountsFromDatabaseByOrganization(organizationId),
          donations: retrieveTotalRaisedFromDatabaseByOrganization(organizationId),
          completedWithdrawals: retrieveWithdrawalAggregateFromDatabaseByOrganizationAndStatus(
            organizationId,
            "SUCCESS",
          ),
          pendingWithdrawals: retrieveWithdrawalAggregateFromDatabaseByOrganizationAndStatus(
            organizationId,
            "PENDING",
          ),
          kycStatus: retrieveUserKycStatusFromDatabaseByUser(user.id),
        });

      const availableBalance = Math.max(
        0,
        donations.totalRaised - completedWithdrawals - pendingWithdrawals,
      );

      // Build verification status
      const phoneVerified = Boolean(user.phoneNumber && user.phoneNumberVerified);
      const kycVerified = kycStatus?.kycStatus === "VERIFIED";
      const hasPayoutAccount = withdrawalAccounts.length > 0;

      const verificationStatus: WithdrawalVerificationStatus = {
        phone: {
          hasPhone: Boolean(user.phoneNumber),
          isVerified: phoneVerified,
          phoneNumber: user.phoneNumber || null,
        },
        kyc: {
          status: (kycStatus?.kycStatus as KycStatus) || "PENDING",
          isVerified: kycVerified,
        },
        payoutAccount: {
          hasAccount: hasPayoutAccount,
        },
        allVerified: phoneVerified && kycVerified && hasPayoutAccount,
      };

      return {
        withdrawalAccounts,
        availableBalance,
        currency: donations.currency || "GHS",
        verificationStatus,
      };
    } catch (error) {
      makeWithdrawalLogger.error("loader.error", {
        organizationId,
        error,
      });
      throw error;
    }
  });
