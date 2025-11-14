import { getDb } from "@repo/core/database/setup";
import type { InsertCampaign, SelectCampaign } from "@repo/core/database/types";
import { campaign } from "@repo/core/drizzle/schema";
import { and, eq, isNull, sql } from "drizzle-orm";

/**
 * Campaign Model
 * Campaigns feature's database API for campaigns
 * Pure data access - no business logic
 */
export const campaignModel = {
  async findById(id: string): Promise<SelectCampaign | null> {
    const db = getDb();
    const result = await db.select().from(campaign).where(eq(campaign.id, id));
    return result[0] ?? null;
  },

  async findBySlug(slug: string): Promise<SelectCampaign | null> {
    const db = getDb();
    const result = await db.select().from(campaign).where(eq(campaign.slug, slug));
    return result[0] ?? null;
  },

  async findByOrganization(organizationId: string): Promise<SelectCampaign[]> {
    const db = getDb();
    return await db.select().from(campaign).where(eq(campaign.organizationId, organizationId));
  },

  async create(data: InsertCampaign): Promise<SelectCampaign | null> {
    const db = getDb();
    const [result] = await db.insert(campaign).values(data).returning();
    return result ?? null;
  },

  async update(id: string, data: Partial<InsertCampaign>): Promise<SelectCampaign | null> {
    const db = getDb();
    const [result] = await db.update(campaign).set(data).where(eq(campaign.id, id)).returning();
    return result ?? null;
  },

  /**
   * Get total count of campaigns for an organization
   * Pure data access - returns raw count
   */
  async getCount(organizationId: string): Promise<number> {
    const db = getDb();
    const result = await db
      .select({
        count: sql<number>`CAST(COUNT(${campaign.id}) AS INTEGER)`,
      })
      .from(campaign)
      .where(and(eq(campaign.organizationId, organizationId), isNull(campaign.deletedAt)));

    return Number(result[0]?.count ?? 0);
  },
};
