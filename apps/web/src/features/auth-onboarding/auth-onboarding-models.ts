import { getDb } from "@repo/core/database/setup";
import type {
  InsertOrganization,
  InsertUser,
  SelectOrganization,
  SelectUser,
} from "@repo/core/database/types";
import { eq } from "@repo/core/drizzle";
import { auth_user, organization } from "@repo/core/drizzle/schema";

export async function retrieveOrganizationFromDatabaseBySlug(
  slug: string,
): Promise<SelectOrganization | null> {
  const db = getDb();
  const result = await db.select().from(organization).where(eq(organization.slug, slug));
  return result[0] ?? null;
}

export async function saveOrganizationToDatabase(
  data: InsertOrganization,
): Promise<SelectOrganization | null> {
  const db = getDb();
  const [result] = await db.insert(organization).values(data).returning();
  return result ?? null;
}

export async function saveUserToDatabase(data: InsertUser): Promise<SelectUser | null> {
  const db = getDb();
  const [result] = await db.insert(auth_user).values(data).returning();
  return result ?? null;
}

export async function updateOnboardingUserInDatabase(
  userId: string,
  data: Partial<InsertUser>,
): Promise<SelectUser | null> {
  const db = getDb();
  const [result] = await db.update(auth_user).set(data).where(eq(auth_user.id, userId)).returning();
  return result ?? null;
}

export async function retrieveUserFromDatabaseByPhoneNumber(
  phoneNumber: string,
): Promise<SelectUser | null> {
  const db = getDb();
  const result = await db.select().from(auth_user).where(eq(auth_user.phoneNumber, phoneNumber));
  return result[0] ?? null;
}
