import { getDb } from "@repo/core/database/setup";
import type { InsertWithdrawalAccount, SelectWithdrawalAccount } from "@repo/core/database/types";
import { withdrawalAccount } from "@repo/core/drizzle/schema";
import { and, eq, isNull } from "drizzle-orm";

/**
 * Withdrawal Account Model
 * Payments feature's database API for withdrawal accounts
 * Pure data access - no business logic
 */
export const withdrawalAccountModel = {
  async findById(id: string, organizationId: string): Promise<SelectWithdrawalAccount | null> {
    const db = getDb();
    const result = await db
      .select()
      .from(withdrawalAccount)
      .where(
        and(
          eq(withdrawalAccount.id, id),
          eq(withdrawalAccount.organizationId, organizationId),
          isNull(withdrawalAccount.deletedAt),
        ),
      );
    return result[0] ?? null;
  },

  async findByOrganizationId(organizationId: string): Promise<SelectWithdrawalAccount[]> {
    const db = getDb();
    return await db
      .select()
      .from(withdrawalAccount)
      .where(
        and(
          eq(withdrawalAccount.organizationId, organizationId),
          isNull(withdrawalAccount.deletedAt),
        ),
      );
  },

  async create(data: InsertWithdrawalAccount): Promise<SelectWithdrawalAccount | null> {
    const db = getDb();
    const [result] = await db.insert(withdrawalAccount).values(data).returning();
    return result ?? null;
  },

  async softDelete(id: string, organizationId: string): Promise<boolean> {
    const db = getDb();
    const [result] = await db
      .update(withdrawalAccount)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(withdrawalAccount.id, id),
          eq(withdrawalAccount.organizationId, organizationId),
          isNull(withdrawalAccount.deletedAt),
        ),
      )
      .returning({ id: withdrawalAccount.id });
    return !!result;
  },
};
