import { getDb } from "@repo/core/database/setup";
import type { InsertMember, SelectMember } from "@repo/core/database/types";
import { member } from "@repo/core/drizzle/auth-schema";
import { eq } from "drizzle-orm";

/**
 * Member Model
 * Core shared model for member operations (used by middleware)
 * Pure data access - no business logic
 */
export const memberModel = {
  async findById(id: string): Promise<SelectMember | null> {
    const db = getDb();
    const result = await db.select().from(member).where(eq(member.id, id));
    return result[0] ?? null;
  },

  async findByOrganizationId(organizationId: string): Promise<SelectMember[]> {
    const db = getDb();
    return await db.select().from(member).where(eq(member.organizationId, organizationId));
  },

  async findByUserId(userId: string): Promise<SelectMember[]> {
    const db = getDb();
    return await db.select().from(member).where(eq(member.userId, userId));
  },

  async create(data: InsertMember): Promise<SelectMember | null> {
    const db = getDb();
    const [result] = await db.insert(member).values(data).returning();
    return result ?? null;
  },

  async updateRole(id: string, role: string): Promise<SelectMember | null> {
    const db = getDb();
    const [result] = await db.update(member).set({ role }).where(eq(member.id, id)).returning();
    return result ?? null;
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.delete(member).where(eq(member.id, id));
  },
};
