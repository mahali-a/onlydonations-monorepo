import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/server/middleware/auth";
import { requireOrganizationAccess } from "@/server/middleware/access-control";
import { logger } from "@/lib/logger";
import {
  retrieveTotalRaisedFromDatabaseByOrganization,
  retrieveWithdrawalAggregateFromDatabaseByOrganizationAndStatus,
  retrieveWithdrawalAccountsFromDatabaseByOrganization,
} from "../payments-models";
import { promiseHash } from "@/utils/promise-hash";

const makeWithdrawalLogger = logger.createChildLogger("make-withdrawal-loaders");

export const retrieveMakeWithdrawalDataFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ orgId: z.string() }))
  .handler(async ({ data, context }) => {
    const { orgId } = data;

    await requireOrganizationAccess(orgId, context.user.id);

    const organizationId = orgId;

    makeWithdrawalLogger.error("loader.start", { organizationId });

    try {
      const { withdrawalAccounts, donations, completedWithdrawals, pendingWithdrawals } =
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
        });

      const availableBalance = Math.max(
        0,
        donations.totalRaised - completedWithdrawals - pendingWithdrawals,
      );

      return {
        withdrawalAccounts,
        availableBalance,
        currency: donations.currency || "GHS",
      };
    } catch (error) {
      makeWithdrawalLogger.error("loader.error", {
        organizationId,
        error,
      });
      throw error;
    }
  });
