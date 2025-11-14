import { getDb } from "@repo/core/database/setup";
import type { InsertDonation, SelectDonation } from "@repo/core/database/types";
import { donation } from "@repo/core/drizzle/schema";
import { and, desc, eq } from "drizzle-orm";

/**
 * Donation Model
 * Campaigns feature's database API for donations
 * Pure data access - no business logic
 * Note: This is different from payments feature's donation queries
 */
export const donationModel = {
  async findById(id: string): Promise<SelectDonation | null> {
    const db = getDb();
    const result = await db.select().from(donation).where(eq(donation.id, id));
    return result[0] ?? null;
  },

  async findByReference(reference: string): Promise<SelectDonation | null> {
    const db = getDb();
    const result = await db.select().from(donation).where(eq(donation.reference, reference));
    return result[0] ?? null;
  },

  async findByCampaignId(campaignId: string): Promise<SelectDonation[]> {
    const db = getDb();
    return await db
      .select()
      .from(donation)
      .where(eq(donation.campaignId, campaignId))
      .orderBy(desc(donation.createdAt));
  },

  async findByDonorId(donorId: string): Promise<SelectDonation[]> {
    const db = getDb();
    return await db
      .select()
      .from(donation)
      .where(eq(donation.donorId, donorId))
      .orderBy(desc(donation.createdAt));
  },

  async findSuccessfulByCampaignId(campaignId: string): Promise<SelectDonation[]> {
    const db = getDb();
    return await db
      .select()
      .from(donation)
      .where(and(eq(donation.campaignId, campaignId), eq(donation.status, "SUCCESS")))
      .orderBy(desc(donation.completedAt));
  },

  async create(data: InsertDonation): Promise<SelectDonation | null> {
    const db = getDb();
    const [result] = await db.insert(donation).values(data).returning();
    return result ?? null;
  },

  async update(id: string, data: Partial<InsertDonation>): Promise<SelectDonation | null> {
    const db = getDb();
    const [result] = await db.update(donation).set(data).where(eq(donation.id, id)).returning();
    return result ?? null;
  },
};
