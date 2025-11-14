import { getDb } from "@repo/core/database/setup";
import type { InsertUser, SelectUser } from "@repo/core/database/types";
import { auth_user } from "@repo/core/drizzle/auth-schema";
import { eq } from "drizzle-orm";

/**
 * User Model
 * Onboarding feature's database API for user creation
 * Pure data access - no business logic
 */
export const userModel = {
  async create(data: InsertUser): Promise<SelectUser | null> {
    const db = getDb();
    const [result] = await db.insert(auth_user).values(data).returning();
    return result ?? null;
  },

  async findByPhone(phoneNumber: string): Promise<SelectUser | null> {
    const db = getDb();
    const result = await db.select().from(auth_user).where(eq(auth_user.phoneNumber, phoneNumber));
    return result[0] ?? null;
  },
};
