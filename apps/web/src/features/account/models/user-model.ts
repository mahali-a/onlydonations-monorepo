import { getDb } from "@repo/core/database/setup";
import type { InsertUser, SelectUser } from "@repo/core/database/types";
import { auth_user } from "@repo/core/drizzle/auth-schema";
import { eq } from "drizzle-orm";

/**
 * User Model
 * Account feature's database API for user operations
 * Pure data access - no business logic
 */
export const userModel = {
  async findById(id: string): Promise<SelectUser | null> {
    const db = getDb();
    const result = await db.select().from(auth_user).where(eq(auth_user.id, id));
    return result[0] ?? null;
  },

  async findByEmail(email: string): Promise<SelectUser | null> {
    const db = getDb();
    const result = await db.select().from(auth_user).where(eq(auth_user.email, email));
    return result[0] ?? null;
  },

  async update(id: string, data: Partial<InsertUser>): Promise<SelectUser | null> {
    const db = getDb();
    const [result] = await db.update(auth_user).set(data).where(eq(auth_user.id, id)).returning();
    return result ?? null;
  },
};
