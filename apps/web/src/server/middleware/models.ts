import { getDb } from "@repo/core/database/setup";
import type { SelectMember, SelectOrganization } from "@repo/core/database/types";
import { eq } from "@repo/core/drizzle";
import { member, organization } from "@repo/core/drizzle/schema";

export async function retrieveOrganizationFromDatabaseById(
  id: string,
): Promise<SelectOrganization | null> {
  const db = getDb();
  const result = await db.select().from(organization).where(eq(organization.id, id));
  return result[0] ?? null;
}

export async function retrieveMembersFromDatabaseByUserId(userId: string): Promise<SelectMember[]> {
  const db = getDb();
  return await db.select().from(member).where(eq(member.userId, userId));
}
