import { getDb } from "@repo/core/database/setup";
import type { InsertOrganization, SelectOrganization } from "@repo/core/database/types";
import { organization } from "@repo/core/drizzle/auth-schema";
import { eq } from "drizzle-orm";

/**
 * Organization Model
 * Onboarding feature's database API for organization creation
 * Pure data access - no business logic
 */
export const organizationModel = {
  async findBySlug(slug: string): Promise<SelectOrganization | null> {
    const db = getDb();
    const result = await db.select().from(organization).where(eq(organization.slug, slug));
    return result[0] ?? null;
  },

  async create(data: InsertOrganization): Promise<SelectOrganization | null> {
    const db = getDb();
    const [result] = await db.insert(organization).values(data).returning();
    return result ?? null;
  },
};
