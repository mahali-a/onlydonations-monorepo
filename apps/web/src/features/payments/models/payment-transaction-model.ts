import { getDb } from "@repo/core/database/setup";
import type { InsertPaymentTransaction, SelectPaymentTransaction } from "@repo/core/database/types";
import { paymentTransaction } from "@repo/core/drizzle/schema";
import { and, desc, eq, sum } from "drizzle-orm";

/**
 * Payment Transaction Model
 * Payments feature's database API for payment transactions
 * Pure data access - no business logic
 */
export const paymentTransactionModel = {
  async findById(id: string): Promise<SelectPaymentTransaction | null> {
    const db = getDb();
    const result = await db.select().from(paymentTransaction).where(eq(paymentTransaction.id, id));
    return result[0] ?? null;
  },

  async findByProcessorRef(processorRef: string): Promise<SelectPaymentTransaction | null> {
    const db = getDb();
    const result = await db
      .select()
      .from(paymentTransaction)
      .where(eq(paymentTransaction.processorRef, processorRef));
    return result[0] ?? null;
  },

  async create(data: InsertPaymentTransaction): Promise<SelectPaymentTransaction | null> {
    const db = getDb();
    const [result] = await db.insert(paymentTransaction).values(data).returning();
    return result ?? null;
  },

  async update(
    id: string,
    data: Partial<InsertPaymentTransaction>,
  ): Promise<SelectPaymentTransaction | null> {
    const db = getDb();
    const [result] = await db
      .update(paymentTransaction)
      .set(data)
      .where(eq(paymentTransaction.id, id))
      .returning();
    return result ?? null;
  },

  async findWithdrawalsByOrganization(organizationId: string): Promise<SelectPaymentTransaction[]> {
    const db = getDb();
    const result = await db
      .select()
      .from(paymentTransaction)
      .where(
        and(
          eq(paymentTransaction.organizationId, organizationId),
          eq(paymentTransaction.processor, "paystack_transfer"),
        ),
      )
      .orderBy(desc(paymentTransaction.createdAt));
    return result;
  },

  /**
   * Get total withdrawal amount by status for an organization
   * Pure data access - returns raw number
   */
  async getTotalWithdrawalsByStatus(
    organizationId: string,
    status: "SUCCESS" | "PENDING",
  ): Promise<number> {
    const db = getDb();
    const result = await db
      .select({
        total: sum(paymentTransaction.amount),
      })
      .from(paymentTransaction)
      .where(
        and(
          eq(paymentTransaction.organizationId, organizationId),
          eq(paymentTransaction.processor, "paystack_transfer"),
          eq(paymentTransaction.status, status),
        ),
      );

    return Number(result[0]?.total) || 0;
  },
};
