import { getDb } from "@repo/core/database/setup";
import type { InsertUser, SelectUser } from "@repo/core/database/types";
import { eq } from "@repo/core/drizzle";
import { auth_user } from "@repo/core/drizzle/auth-schema";

export async function retrieveUserFromDatabaseById(id: string): Promise<SelectUser | null> {
  const db = getDb();
  const result = await db.select().from(auth_user).where(eq(auth_user.id, id));
  return result[0] ?? null;
}

export async function retrieveUserFromDatabaseByEmail(email: string): Promise<SelectUser | null> {
  const db = getDb();
  const result = await db.select().from(auth_user).where(eq(auth_user.email, email));
  return result[0] ?? null;
}

export async function updateUserInDatabase(
  id: string,
  data: Partial<InsertUser>,
): Promise<SelectUser | null> {
  const db = getDb();
  const [result] = await db.update(auth_user).set(data).where(eq(auth_user.id, id)).returning();
  return result ?? null;
}
