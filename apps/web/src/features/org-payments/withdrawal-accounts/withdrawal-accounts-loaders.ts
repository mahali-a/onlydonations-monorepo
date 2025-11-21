import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { paystackService } from "@/lib/paystack";
import { requireOrganizationAccess } from "@/server/middleware/access-control";
import { authMiddleware } from "@/server/middleware/auth";
import { promiseHash } from "@/utils/promise-hash";
import { retrieveWithdrawalAccountsFromDatabaseByOrganization } from "../org-payments-models";

const withdrawalAccountsLogger = logger.createChildLogger("withdrawal-accounts-loaders");

export const retrieveWithdrawalAccountsFromServer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ orgId: z.string() }))
  .handler(async ({ data, context }) => {
    const organizationId = data.orgId;

    await requireOrganizationAccess(organizationId, context.user.id);

    withdrawalAccountsLogger.info("loader.start", { organizationId });

    try {
      const paystack = paystackService();
      const { withdrawalAccounts, mobileMoneyBanks, ghipssBanks } = await promiseHash({
        withdrawalAccounts: retrieveWithdrawalAccountsFromDatabaseByOrganization(organizationId),
        mobileMoneyBanks: paystack.listBanks({ currency: "GHS", type: "mobile_money" }),
        ghipssBanks: paystack.listBanks({ currency: "GHS", type: "ghipss" }),
      });
      withdrawalAccountsLogger.info("loader.success", {
        organizationId,
        withdrawalAccountsCount: withdrawalAccounts.length,
        mobileMoneyBanksCount: mobileMoneyBanks.data?.length || 0,
        ghipssBanksCount: ghipssBanks.data?.length || 0,
      });
      return {
        withdrawalAccounts,
        mobileMoneyBanks,
        ghipssBanks,
      };
    } catch (error) {
      withdrawalAccountsLogger.error("loader.error", {
        organizationId,
        error,
      });

      throw error;
    }
  });
