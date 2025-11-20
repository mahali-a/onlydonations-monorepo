import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/server/middleware/auth";
import { requireOrganizationAccess } from "@/server/middleware/access-control";
import { logger } from "@/lib/logger";
import { retrievePaymentTransactionWithdrawalsFromDatabaseByOrganization } from "../org-payments-models";

const withdrawalHistoryLogger = logger.createChildLogger("withdrawal-history-loaders");

export const retrieveWithdrawalHistoryFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ orgId: z.string() }))
  .handler(async ({ data, context }) => {
    const { orgId } = data;

    await requireOrganizationAccess(orgId, context.user.id);

    const organizationId = orgId;

    withdrawalHistoryLogger.error("get_withdrawal_history.start", { organizationId });

    try {
      const withdrawals =
        await retrievePaymentTransactionWithdrawalsFromDatabaseByOrganization(organizationId);

      return {
        withdrawals,
      };
    } catch (error) {
      withdrawalHistoryLogger.error("get_withdrawal_history.error", error, { organizationId });
      throw error;
    }
  });
