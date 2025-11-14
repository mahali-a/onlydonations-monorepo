import { getDb } from "@repo/core/database/setup";
import type { SelectOrganization } from "@repo/core/database/types";
import { organization } from "@repo/core/drizzle/auth-schema";
import { eq } from "drizzle-orm";

/**
 * Organization Model
 * Core shared model for organization operations (used by middleware)
 * Pure data access - no business logic
 */
export const organizationModel = {
  async findById(id: string): Promise<SelectOrganization | null> {
    const db = getDb();
    const result = await db.select().from(organization).where(eq(organization.id, id));
    return result[0] ?? null;
  },

  async findBySlug(slug: string): Promise<SelectOrganization | null> {
    const db = getDb();
    const result = await db.select().from(organization).where(eq(organization.slug, slug));
    return result[0] ?? null;
  },
};
