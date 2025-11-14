import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/core/middleware/auth";
import { logger } from "@/lib/logger";
import { paystackService } from "@/lib/paystack";
import { withdrawalAccountModel } from "../models/withdrawal-account-model";

const withdrawalAccountsLogger = logger.child("withdrawal-accounts-loaders");

export const getWithdrawalAccountsData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ orgId: z.string() }))
  .handler(async ({ data }) => {
    const organizationId = data.orgId;
    withdrawalAccountsLogger.info("loader.start", { organizationId });

    try {
      const paystack = paystackService(env);
      const [withdrawalAccounts, mobileMoneyBanks, ghipssBanks] = await Promise.all([
        withdrawalAccountModel.findByOrganizationId(organizationId),
        paystack.listBanks({ currency: "GHS", type: "mobile_money" }),
        paystack.listBanks({ currency: "GHS", type: "ghipss" }),
      ]);
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
