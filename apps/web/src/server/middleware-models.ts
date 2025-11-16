import { getDb } from "@repo/core/database/setup";
import type { SelectMember, SelectOrganization } from "@repo/core/database/types";
import { member, organization } from "@repo/core/drizzle/auth-schema";
import { eq } from "@repo/core/drizzle";

export async function findOrganizationById(id: string): Promise<SelectOrganization | null> {
  const db = getDb();
  const result = await db.select().from(organization).where(eq(organization.id, id));
  return result[0] ?? null;
}

export async function findMembersByUserId(userId: string): Promise<SelectMember[]> {
  const db = getDb();
  return await db.select().from(member).where(eq(member.userId, userId));
}
