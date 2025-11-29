// @ts-nocheck
import "dotenv/config";

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { faker } from "@faker-js/faker";
import * as schema from "@repo/core/drizzle/schema";
import * as authSchema from "@repo/core/drizzle/schema/auth.schema";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { nanoid } from "nanoid";
import { logger } from "@/lib/logger";

const schemaExports = schema.default || schema;
const {
  campaign,
  campaignUpdate,
  category,
  contentModeration,
  countries,
  currencies,
  donation,
  paymentTransaction,
  refund,
  withdrawalAccount,
  webhookEvent,
  userKycStatus,
  verificationJob,
  smileWebhookEvent,
} = schemaExports;

const { auth_user: user, member, organization, invitation } = authSchema;

/**
 * Get local D1 database instance for seeding
 * Tries to match the database ID from wrangler.jsonc, falls back to largest file
 */
function getLocalDb() {
  const basePath = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";

  try {
    // Try to read database_id from wrangler.jsonc
    let expectedHash: string | null = null;
    try {
      const wranglerConfig = JSON.parse(
        readFileSync("wrangler.jsonc", "utf-8").replace(/\/\/.*$/gm, ""), // Remove comments
      );
      const dbId = wranglerConfig.d1_databases?.[0]?.database_id;
      if (dbId) {
        expectedHash = createHash("sha256").update(dbId).digest("hex");
        logger.info(`Looking for database matching ID: ${dbId.substring(0, 8)}...`);
      }
    } catch (_error) {
      // Ignore if wrangler.jsonc can't be read
    }

    const entries = readdirSync(basePath);
    const sqliteFiles = entries
      .filter((entry) => {
        const fullPath = join(basePath, entry);
        return statSync(fullPath).isFile() && entry.endsWith(".sqlite");
      })
      .map((entry) => ({
        name: entry,
        path: join(basePath, entry),
        mtime: statSync(join(basePath, entry)).mtime.getTime(),
        size: statSync(join(basePath, entry)).size,
      }));

    if (sqliteFiles.length === 0) {
      throw new Error("No SQLite files found");
    }

    // Try to find file matching the database ID hash
    let selectedFile = sqliteFiles[0];
    if (expectedHash) {
      const matchingFile = sqliteFiles.find((f) => f.name.startsWith(expectedHash));
      if (matchingFile) {
        selectedFile = matchingFile;
        logger.info(`Found database matching ID: ${selectedFile.name}`);
      } else {
        // Fall back to largest file
        selectedFile = sqliteFiles.sort((a: any, b: any) => b.size - a.size)[0];
      }
    } else {
      // No database ID, use largest file
      selectedFile = sqliteFiles.sort((a, b) => b.size - a.size)[0];
    }

    const dbPath = selectedFile?.path;
    logger.info(
      `Using database: ${selectedFile?.name} (${(selectedFile?.size ?? 0 / 1024).toFixed(2)} KB)`,
    );
    const sqlite = new Database(dbPath);
    // Enable foreign key support (required for SQLite foreign key constraints)
    sqlite.exec("PRAGMA foreign_keys = ON");
    return {
      db: drizzle(sqlite, {
        schema: {
          ...authSchema,
          campaign,
          campaignUpdate,
          category,
          contentModeration,
          countries,
          currencies,
          donation,
          paymentTransaction,
          refund,
          withdrawalAccount,
          webhookEvent,
          userKycStatus,
          verificationJob,
          smileWebhookEvent,
        },
      }),
      sqlite,
    };
  } catch (_error) {
    logger.error("Local D1 database not found", { error: _error });
    throw new Error(
      "Local D1 database not found. Please run 'pnpm dev:web' first to initialize the database.",
    );
  }
}

// Initialize database connection
const { db, sqlite } = getLocalDb();

// Helper functions
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickOne = <T>(array: readonly T[]): T => {
  const index = Math.floor(Math.random() * array.length);
  const item = array[index];
  if (item === undefined) {
    throw new Error("Array is empty");
  }
  return item;
};
const pickWeighted = <T>(items: T[], weights: number[]): T => {
  // Ensure weights are numbers and handle potential precision issues
  const validWeights = weights.map((w) => Math.max(0.1, Number(w) || 0.1));
  const total = validWeights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    const weight = validWeights[i];
    if (weight === undefined) continue;
    random -= weight;
    if (random <= 0) {
      const item = items[i];
      if (item === undefined) {
        return items[items.length - 1] as T;
      }
      return item;
    }
  }
  const lastItem = items[items.length - 1];
  if (lastItem === undefined) {
    throw new Error("Items array is empty");
  }
  return lastItem;
};

const currenciesData = [{ code: "GHS", name: "Ghana Cedi", symbol: "₵" }];

const countriesData = [{ code: "GH", name: "Ghana", currencyCode: "GHS" }];

async function _cleanDatabase() {
  // Disable foreign key checks temporarily for cleanup
  sqlite.exec("PRAGMA foreign_keys = OFF");

  try {
    // Delete all rows from tables using raw SQL (more reliable for cleanup)
    const tables = [
      "smile_webhook_event",
      "verification_job",
      "user_kyc_status",
      "webhook_event",
      "refund",
      "donation",
      "payment_transaction",
      "campaign_update",
      "content_moderation",
      "campaign",
      "withdrawal_account",
      "invitation",
      "member",
      "organization",
      "category",
      "auth_user",
      "countries",
      "currencies",
    ];

    for (const table of tables) {
      sqlite.exec(`DELETE FROM ${table}`);
    }
  } finally {
    // Re-enable foreign key checks
    sqlite.exec("PRAGMA foreign_keys = ON");
  }
}

async function _seedStaticData() {
  await db.insert(currencies).values(currenciesData);
  await db.insert(countries).values(countriesData);
}

async function _createTestUser() {
  const testEmail = "mahaliasmah@gmail.com";
  const seedUser = {
    id: nanoid(10),
    name: "Test User",
    email: testEmail,
    emailVerified: true,
    image: `https://avatar.vercel.sh/${encodeURIComponent(testEmail)}`,
    phoneNumber: "+1234567890",
    phoneNumberVerified: true,
    isAnonymous: false,
  };

  const [insertedUser] = await db.insert(user).values(seedUser).returning();
  if (!insertedUser) {
    throw new Error("Failed to create test user");
  }
  return insertedUser;
}

async function _createTestOrganizations(userId: string) {
  const organizations = [];

  // Primary organization (for login)
  const primaryOrgData = {
    id: nanoid(10),
    name: "Test Organization",
    slug: "test-org",
    logo: null,
    createdAt: new Date(),
    metadata: JSON.stringify({
      description: "Test organization for development",
    }),
  };

  const [primaryOrg] = await db.insert(organization).values(primaryOrgData).returning();
  if (!primaryOrg) {
    throw new Error("Failed to create test organization");
  }

  // Create membership for the user as owner
  await db.insert(member).values({
    id: nanoid(10),
    userId: userId,
    organizationId: primaryOrg.id,
    role: "owner",
    createdAt: new Date(),
  });

  organizations.push(primaryOrg);

  // Create 2-3 additional organizations with different member roles
  const additionalOrgs = [
    {
      name: "Community Foundation",
      slug: "community-foundation",
      role: "admin" as const,
    },
    {
      name: "Charity Partners",
      slug: "charity-partners",
      role: "member" as const,
    },
  ];

  for (const orgInfo of additionalOrgs) {
    const orgData = {
      id: nanoid(10),
      name: orgInfo.name,
      slug: orgInfo.slug,
      logo: null,
      createdAt: faker.date.past({ years: 1 }),
      metadata: JSON.stringify({
        description: faker.company.catchPhrase(),
      }),
    };

    const [insertedOrg] = await db.insert(organization).values(orgData).returning();
    if (!insertedOrg) continue;

    // Add user as member with different role
    await db.insert(member).values({
      id: nanoid(10),
      userId: userId,
      organizationId: insertedOrg.id,
      role: orgInfo.role,
      createdAt: orgData.createdAt,
    });

    organizations.push(insertedOrg);
  }

  return organizations;
}

async function _seedCategories() {
  const baseCategories = [
    "Medical",
    "Education",
    "Community",
    "Animals",
    "Environment",
    "Emergency",
    "Sports",
    "Arts & Culture",
    "Technology",
    "Food & Nutrition",
  ];

  const categories = baseCategories.map((name) => ({
    name,
    enabled: true,
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: new Date(),
  }));

  return await db.insert(category).values(categories).returning();
}

type CampaignStatus = "DRAFT" | "UNDER_REVIEW" | "ACTIVE" | "COMPLETED" | "REJECTED" | "CANCELLED";

type StatusConfig = {
  weight: number;
  minAge: number; // in days
  maxAge: number;
  donationRange: [number, number];
};

const statusConfigs: Record<CampaignStatus, StatusConfig> = {
  DRAFT: { weight: 0.1, minAge: 0, maxAge: 7, donationRange: [0, 0] },
  UNDER_REVIEW: { weight: 0.05, minAge: 1, maxAge: 5, donationRange: [0, 0] },
  ACTIVE: { weight: 0.5, minAge: 7, maxAge: 180, donationRange: [5, 50] },
  COMPLETED: { weight: 0.2, minAge: 30, maxAge: 365, donationRange: [50, 150] },
  REJECTED: { weight: 0.05, minAge: 1, maxAge: 10, donationRange: [0, 0] },
  CANCELLED: { weight: 0.1, minAge: 7, maxAge: 90, donationRange: [0, 5] },
};

async function _seedCampaigns(
  userId: string,
  organizations: Array<{ id: string }>,
  categories: Array<{
    id: string;
    name: string;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>,
) {
  const campaignCount = randomInt(80, 120);
  const insertedCampaigns = [];
  const now = new Date();

  for (let i = 0; i < campaignCount; i++) {
    const selectedCategory = pickOne(categories);
    const selectedOrg = pickOne(organizations);
    const status = pickWeighted<CampaignStatus>(
      Object.keys(statusConfigs) as CampaignStatus[],
      Object.values(statusConfigs).map((c) => c.weight),
    );

    const config = statusConfigs[status];
    const campaignAge = randomInt(config.minAge, config.maxAge);
    const createdAt = new Date(now.getTime() - campaignAge * 24 * 60 * 60 * 1000);

    const title = `${faker.company.buzzVerb()} ${faker.helpers.arrayElement([
      "Help",
      "Support",
      "Fund",
      "Save",
      "Build",
      "Provide",
      "Empower",
      "Transform",
      "Restore",
    ])} ${faker.helpers.arrayElement([
      "Children",
      "Families",
      "Community",
      "Students",
      "Patients",
      "Elders",
      "Veterans",
      "Youth",
    ])} - ${selectedCategory.name}`;

    const slug = `${faker.helpers.slugify(title).toLowerCase()}-${randomInt(1000, 9999)}`;

    // Realistic goal amounts based on category (in minor units - pesewas/cents)
    const goalAmount = pickWeighted(
      [500000, 1000000, 2500000, 5000000, 10000000, 25000000],
      [30, 30, 20, 10, 7, 3],
    );

    // Only published campaigns have publishedAt
    let publishedAt: Date | null = null;
    if (["ACTIVE", "COMPLETED", "CANCELLED"].includes(status)) {
      publishedAt = new Date(createdAt.getTime() + randomInt(1, 3) * 24 * 60 * 60 * 1000);
    }

    // End date logic
    let endDate: Date | null = null;
    if (status === "COMPLETED") {
      endDate = new Date(createdAt.getTime() + randomInt(30, campaignAge) * 24 * 60 * 60 * 1000);
    } else if (["ACTIVE", "CANCELLED"].includes(status) && faker.datatype.boolean(0.3)) {
      endDate = faker.date.future({ refDate: now });
    }

    // Use only Ghana Cedis and Ghana
    const selectedCurrency = "GHS";
    const selectedCountry = "GH";

    const campaignData = {
      slug,
      status,
      amount: goalAmount,
      currency: selectedCurrency,
      coverImage: `campaigns/${slug}.jpg`,
      title,
      beneficiaryName: faker.person.fullName(),
      country: selectedCountry,
      description: faker.lorem.paragraphs(randomInt(3, 6)),
      categoryId: selectedCategory.id,
      organizationId: selectedOrg.id,
      createdBy: userId,
      isUnlisted: faker.datatype.boolean(0.05),
      feeHandling: pickWeighted(
        ["DONOR_ASK_COVER", "DONOR_REQUIRE_COVER", "CAMPAIGN_ABSORB"] as const,
        [60, 20, 20],
      ),
      thankYouMessage: faker.lorem.sentences(randomInt(1, 3)),
      seoTitle: `${title} - Support this cause`,
      seoDescription: faker.lorem.sentence(),
      donateButtonText: pickOne(["Donate Now", "Support This Cause", "Give Today", null]),
      publishedAt,
      endDate,
      createdAt,
      updatedAt: new Date(createdAt.getTime() + randomInt(0, campaignAge) * 24 * 60 * 60 * 1000),
    };

    const [insertedCampaign] = await db.insert(campaign).values(campaignData).returning();

    if (insertedCampaign) {
      insertedCampaigns.push({
        ...insertedCampaign,
        expectedDonationRange: config.donationRange,
      });
    }
  }

  return insertedCampaigns;
}

// Helper function to generate donor information
function generateDonorInfo(userId: string) {
  const isAnonymous = faker.datatype.boolean(0.15);
  const isFromRegisteredUser = !isAnonymous && faker.datatype.boolean(0.25);

  return {
    isAnonymous,
    donorId: isFromRegisteredUser ? userId : null,
    donorName: isFromRegisteredUser ? "Test User" : isAnonymous ? null : faker.person.fullName(),
    donorEmail: isFromRegisteredUser
      ? "mahaliasmah@gmail.com"
      : isAnonymous
        ? null
        : faker.internet.email().toLowerCase(),
  };
}

async function _seedDonationsAndTransactions(
  campaigns: Array<{
    id: string;
    status: string;
    currency: string;
    createdAt: Date;
    publishedAt: Date | null;
    expectedDonationRange: [number, number];
  }>,
  userId: string,
): Promise<
  Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    paymentTransactionId: string;
    createdAt: Date;
  }>
> {
  const now = new Date();
  const allDonations = [];

  for (const campaignItem of campaigns) {
    const [minDonations, maxDonations] = campaignItem.expectedDonationRange;

    if (minDonations === 0 && maxDonations === 0) continue;

    const donationCount = randomInt(minDonations, maxDonations);
    const startDate = campaignItem.publishedAt || campaignItem.createdAt;

    for (let i = 0; i < donationCount; i++) {
      // Generate donation date with realistic distribution over time
      // More donations happen closer to campaign creation (early momentum)
      const campaignLifespan = now.getTime() - startDate.getTime();
      const timeMultiplier = Math.random() ** 2; // Bias towards earlier dates
      const donationDate = new Date(startDate.getTime() + campaignLifespan * timeMultiplier);

      // Realistic donation amounts with weighted distribution (all in minor units - pesewas/cents)
      const amount = pickWeighted(
        [10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2500000],
        [25, 30, 20, 12, 7, 4, 1.5, 0.5],
      );

      const donorInfo = generateDonorInfo(userId);

      // Most donations are successful, few pending/failed
      const donationStatus = pickWeighted(["SUCCESS", "PENDING", "FAILED"] as const, [90, 5, 5]);

      const reference = `DON_${faker.string.alphanumeric({ length: 12, casing: "upper" })}`;

      // Create payment transaction first
      const paymentMethod = pickWeighted(["mobile_money", "card", "bank_transfer"], [60, 30, 10]);

      // Use integer arithmetic to avoid floating point precision issues
      // Fee percentages: mobile_money = 1.5%, card/bank = 2.8%
      const feePercentage = paymentMethod === "mobile_money" ? 150 : 280; // Multiply by 100 to avoid decimals
      const fees = Math.floor((amount * feePercentage) / 10000); // Divide by 10000 to get correct fee

      const transactionData = {
        processor: pickWeighted(["paystack", "stripe"], [90, 10]),
        processorRef: `ref_${faker.string.alphanumeric({ length: 16 })}`,
        processorTransactionId: donationStatus === "SUCCESS" ? faker.string.numeric(10) : null,
        amount,
        fees,
        currency: campaignItem.currency,
        paymentMethod,
        status: donationStatus,
        statusMessage:
          donationStatus === "FAILED"
            ? pickOne([
                "Payment declined by provider",
                "Insufficient funds",
                "Card expired",
                "Transaction timeout",
              ])
            : null,
        metadata: JSON.stringify({
          campaign_id: campaignItem.id,
          donor_email: donorInfo.donorEmail,
          ip_address: faker.internet.ip(),
        }),
        createdAt: donationDate,
        updatedAt: donationDate,
        completedAt: donationStatus === "SUCCESS" ? donationDate : null,
      };

      const [insertedTransaction] = await db
        .insert(paymentTransaction)
        .values(transactionData)
        .returning();

      if (!insertedTransaction) {
        throw new Error("Failed to create payment transaction");
      }

      // Create donation record
      const donationData = {
        campaignId: campaignItem.id,
        amount,
        currency: campaignItem.currency,
        reference,
        paymentTransactionId: insertedTransaction.id,
        ...donorInfo,
        donorMessage: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
        showMessage: faker.datatype.boolean(0.85),
        status: donationStatus,
        createdAt: donationDate,
        updatedAt: donationDate,
        completedAt: donationStatus === "SUCCESS" ? donationDate : null,
      };

      const [insertedDonation] = await db.insert(donation).values(donationData).returning();
      if (insertedDonation?.paymentTransactionId) {
        allDonations.push({
          id: insertedDonation.id,
          amount: insertedDonation.amount,
          currency: insertedDonation.currency,
          status: insertedDonation.status,
          paymentTransactionId: insertedDonation.paymentTransactionId,
          createdAt: insertedDonation.createdAt,
        });
      }
    }
  }

  return allDonations;
}

async function _seedCampaignUpdates(
  campaigns: Array<{
    id: string;
    status: string;
    createdAt: Date;
    publishedAt: Date | null;
  }>,
  userId: string,
) {
  const now = new Date();

  for (const campaignItem of campaigns) {
    // Only active and completed campaigns get updates
    if (!["ACTIVE", "COMPLETED"].includes(campaignItem.status)) continue;
    if (!campaignItem.publishedAt) continue;

    const shouldHaveUpdates = faker.datatype.boolean(0.4);
    if (!shouldHaveUpdates) continue;

    const updateCount = randomInt(1, 5);
    const campaignLifespan = now.getTime() - campaignItem.publishedAt.getTime();

    for (let i = 0; i < updateCount; i++) {
      const updateDate = new Date(
        campaignItem.publishedAt.getTime() + Math.random() * campaignLifespan,
      );

      const updateTitles = [
        "Thank you for your amazing support!",
        "Milestone reached! Here's what's next",
        "Update on our progress",
        "Halfway to our goal!",
        "Important update from our team",
        "Photos from the field",
        "Your impact in action",
      ];

      const updateData = {
        title: pickOne(updateTitles),
        content: faker.lorem.paragraphs(randomInt(2, 4)),
        campaignId: campaignItem.id,
        authorId: userId,
        isPinned: faker.datatype.boolean(0.1),
        isHidden: false,
        createdAt: updateDate,
        updatedAt: updateDate,
      };

      await db.insert(campaignUpdate).values(updateData);
    }
  }
}

async function _seedContentModeration(
  campaigns: Array<{
    id: string;
    status: string;
    createdAt: Date;
  }>,
  userId: string,
) {
  for (const campaignItem of campaigns) {
    // Only campaigns that went through review have moderation records
    if (!["UNDER_REVIEW", "ACTIVE", "COMPLETED", "REJECTED"].includes(campaignItem.status)) {
      continue;
    }

    const moderatedAt = new Date(
      campaignItem.createdAt.getTime() + randomInt(2, 48) * 60 * 60 * 1000,
    );

    const flagged = faker.datatype.boolean(0.05);
    const requiresManualReview = flagged || faker.datatype.boolean(0.1);

    let moderationStatus: "PENDING" | "APPROVED" | "REJECTED" | "REQUIRES_REVIEW";
    let reviewDecision: "APPROVE" | "REJECT" | "ESCALATE" | null = null;

    if (campaignItem.status === "REJECTED") {
      moderationStatus = "REJECTED";
      reviewDecision = "REJECT";
    } else if (requiresManualReview) {
      moderationStatus = "REQUIRES_REVIEW";
      reviewDecision = "APPROVE";
    } else {
      moderationStatus = "APPROVED";
    }

    const moderationData = {
      contentType: "campaign" as const,
      contentId: campaignItem.id,
      status: moderationStatus,
      flagged,
      flaggedCategories: flagged ? JSON.stringify(["potentially-sensitive"]) : null,
      categoryScores: JSON.stringify({
        harassment: Math.random() * 0.1,
        hate: Math.random() * 0.1,
        selfHarm: Math.random() * 0.05,
        sexual: Math.random() * 0.1,
        violence: Math.random() * 0.1,
      }),
      recommendation: flagged ? "Review required" : "Approve",
      moderationProvider: "openai",
      openaiModerationId: `modr_${faker.string.alphanumeric(24)}`,
      moderatedAt,
      requiresManualReview,
      reviewedBy: requiresManualReview ? userId : null,
      reviewedAt: requiresManualReview
        ? new Date(moderatedAt.getTime() + randomInt(1, 24) * 60 * 60 * 1000)
        : null,
      reviewDecision,
      reviewNotes: requiresManualReview ? faker.lorem.sentence() : null,
      previousModerationId: null,
      retryCount: 0,
      errorMessage: null,
      createdAt: moderatedAt,
      updatedAt: moderatedAt,
    };

    await db.insert(contentModeration).values(moderationData);
  }
}

async function _seedRefunds(
  donations: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    paymentTransactionId: string;
    createdAt: Date;
  }>,
  userId: string,
) {
  // Only refund successful donations, and only a small percentage
  const successfulDonations = donations.filter((d) => d.status === "SUCCESS");
  const refundCount = Math.floor(successfulDonations.length * 0.05); // 5% refund rate

  for (let i = 0; i < refundCount; i++) {
    const donationToRefund = pickOne(successfulDonations);
    const refundDate = new Date(
      donationToRefund.createdAt.getTime() + randomInt(1, 30) * 24 * 60 * 60 * 1000,
    );

    const refundStatus = pickWeighted(["PENDING", "COMPLETED", "FAILED"] as const, [20, 70, 10]);

    const refundData = {
      donationId: donationToRefund.id,
      transactionId: donationToRefund.paymentTransactionId,
      amount: donationToRefund.amount,
      reason: pickOne([
        "Donor requested refund",
        "Duplicate payment",
        "Campaign cancelled",
        "Payment error",
      ]),
      processor: "paystack",
      processorRefundId:
        refundStatus === "COMPLETED" ? `refund_${faker.string.alphanumeric(16)}` : null,
      status: refundStatus,
      initiatedBy: userId,
      processedAt: refundStatus === "COMPLETED" ? refundDate : null,
      createdAt: refundDate,
      updatedAt: refundDate,
    };

    await db.insert(refund).values(refundData);
  }
}

async function _seedWithdrawalAccounts(organizations: Array<{ id: string }>) {
  for (const org of organizations) {
    // Each organization gets 1-3 withdrawal accounts
    const accountCount = randomInt(1, 3);

    for (let i = 0; i < accountCount; i++) {
      const accountType = pickWeighted(["bank", "mobile_money"] as const, [60, 40]);

      let accountData: {
        accountType: string;
        bankCode: string | null;
        accountNumber: string;
        accountName: string;
        name: string;
        mobileMoneyProvider: string | null;
        recipientCode: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
      };
      if (accountType === "bank") {
        accountData = {
          accountType: "bank",
          bankCode: faker.string.numeric(3),
          accountNumber: faker.string.numeric(10),
          accountName: faker.person.fullName(),
          name: `${faker.company.name()} Bank Account`,
          mobileMoneyProvider: null,
          recipientCode: `RCP_${faker.string.alphanumeric(16)}`,
          organizationId: org.id,
          createdAt: faker.date.past({ years: 1 }),
          updatedAt: new Date(),
          deletedAt: faker.datatype.boolean(0.1) ? faker.date.recent() : null,
        };
      } else {
        accountData = {
          accountType: "mobile_money",
          bankCode: null,
          accountNumber: faker.string.numeric(10),
          accountName: faker.person.fullName(),
          name: `${pickOne(["MTN", "Vodafone", "AirtelTigo"])} Mobile Money`,
          mobileMoneyProvider: pickOne(["MTN", "Vodafone", "AirtelTigo"]),
          recipientCode: `RCP_${faker.string.alphanumeric(16)}`,
          organizationId: org.id,
          createdAt: faker.date.past({ years: 1 }),
          updatedAt: new Date(),
          deletedAt: null,
        };
      }

      await db.insert(withdrawalAccount).values(accountData);
    }
  }
}

async function _seedWebhookEvents(
  transactions: Array<{
    id: string;
    processor: string;
    status: string;
    createdAt: Date;
  }>,
) {
  const eventTypes = [
    "payment.success",
    "payment.failed",
    "payment.pending",
    "charge.success",
    "charge.failed",
    "transfer.success",
    "transfer.failed",
  ];

  // Create webhook events for some transactions
  const eventCount = Math.floor(transactions.length * 0.3); // 30% have webhook events

  for (let i = 0; i < eventCount; i++) {
    const transaction = pickOne(transactions);
    const eventType = pickOne(eventTypes);
    const receivedAt = new Date(transaction.createdAt.getTime() + randomInt(0, 5) * 60 * 1000);

    const webhookStatus = pickWeighted(["PENDING", "PROCESSED", "FAILED"] as const, [10, 85, 5]);

    const webhookData = {
      processor: transaction.processor,
      processorEventId: `evt_${faker.string.alphanumeric(24)}`,
      eventType,
      signature: faker.string.alphanumeric(64),
      rawPayload: JSON.stringify({
        event: eventType,
        data: {
          id: transaction.id,
          status: transaction.status,
        },
      }),
      status: webhookStatus,
      processedAt: webhookStatus === "PROCESSED" ? receivedAt : null,
      errorMessage: webhookStatus === "FAILED" ? "Processing error" : null,
      receivedAt,
      createdAt: receivedAt,
      updatedAt: receivedAt,
    };

    await db.insert(webhookEvent).values(webhookData);
  }
}

async function _seedKycStatus(userId: string) {
  const kycStatus = pickWeighted(["PENDING", "VERIFIED", "REJECTED"] as const, [30, 60, 10]);

  const kycData = {
    userId,
    kycStatus,
    kycVerifiedAt: kycStatus === "VERIFIED" ? faker.date.past({ years: 1 }) : null,
    smileJobId: kycStatus !== "PENDING" ? `job_${faker.string.alphanumeric(16)}` : null,
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: new Date(),
  };

  await db.insert(userKycStatus).values(kycData);

  // Create verification job if KYC was processed
  if (kycStatus !== "PENDING") {
    const jobStatus = kycStatus === "VERIFIED" ? "completed" : "failed";
    const smileJobId = kycData.smileJobId || "";
    const jobData = {
      userId,
      smileJobId,
      product: pickOne(["basic_kyc", "biometric_kyc", "enhanced_kyc"]),
      status: jobStatus,
      resultCode: jobStatus === "completed" ? "1000" : "2001",
      resultText: jobStatus === "completed" ? "Verification successful" : "Verification failed",
      rawResult: JSON.stringify({
        status: jobStatus,
        verification: {
          verified: jobStatus === "completed",
        },
      }),
      createdAt: kycData.createdAt,
      updatedAt: kycData.updatedAt,
    };

    const [insertedJob] = await db.insert(verificationJob).values(jobData).returning();

    // Create smile webhook event for completed jobs
    if (insertedJob && jobStatus === "completed") {
      const webhookData = {
        jobId: insertedJob.smileJobId,
        eventType: "verification_complete",
        signature: faker.string.alphanumeric(64),
        rawPayload: JSON.stringify({
          job_id: insertedJob.smileJobId,
          status: "completed",
        }),
        status: "processed",
        processedAt: insertedJob.updatedAt,
        errorMessage: null,
        createdAt: insertedJob.updatedAt,
        updatedAt: insertedJob.updatedAt,
      };

      await db.insert(smileWebhookEvent).values(webhookData);
    }
  }
}

async function _seedInvitations(
  organizations: Array<{ id: string; createdAt: Date }>,
  userId: string,
) {
  for (const org of organizations) {
    // Create 2-5 invitations per organization
    const invitationCount = randomInt(2, 5);

    for (let i = 0; i < invitationCount; i++) {
      const invitationStatus = pickWeighted(
        ["pending", "accepted", "expired"] as const,
        [40, 40, 20],
      );

      const createdAt = faker.date.past({ years: 1 });
      const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);

      const invitationData = {
        id: nanoid(10),
        organizationId: org.id,
        email: faker.internet.email().toLowerCase(),
        role: pickOne(["member", "admin", null]),
        status: invitationStatus,
        expiresAt,
        inviterId: userId,
      };

      await db.insert(invitation).values(invitationData);
    }
  }
}

async function seedAllDatabases() {
  const basePath = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
  const entries = readdirSync(basePath);
  const sqliteFiles = entries
    .filter((entry) => {
      const fullPath = join(basePath, entry);
      return statSync(fullPath).isFile() && entry.endsWith(".sqlite");
    })
    .map((entry) => join(basePath, entry));

  if (sqliteFiles.length === 0) {
    throw new Error("No SQLite files found");
  }

  logger.info(`Found ${sqliteFiles.length} database file(s), seeding all...`);

  const results = [];
  for (const dbPath of sqliteFiles) {
    logger.info(`\n📦 Seeding: ${dbPath.split("/").pop()}`);
    const sqlite = new Database(dbPath);
    sqlite.exec("PRAGMA foreign_keys = ON");
    const db = drizzle(sqlite, {
      schema: {
        ...authSchema,
        campaign,
        campaignUpdate,
        category,
        contentModeration,
        countries,
        currencies,
        donation,
        paymentTransaction,
        refund,
        withdrawalAccount,
        webhookEvent,
        userKycStatus,
        verificationJob,
        smileWebhookEvent,
      },
    });

    try {
      // Clean and seed this database
      await cleanDatabaseForDb(db, sqlite);
      const result = await seedDatabase(db);
      results.push(result);
      logger.info(`✅ Completed seeding: ${dbPath.split("/").pop()}`);
    } catch (error) {
      logger.error(`Failed to seed ${dbPath.split("/").pop()}:`, { error });
      if (error instanceof Error) {
        logger.error(`Error message: ${error.message}`);
        if (error.stack) {
          logger.error(`Stack trace: ${error.stack}`);
        }
      }
      // Don't add to results if it failed
    } finally {
      sqlite.close();
    }
  }

  return results;
}

async function cleanDatabaseForDb(_db: ReturnType<typeof drizzle>, sqlite: any) {
  logger.info("  → Cleaning database...");
  sqlite.exec("PRAGMA foreign_keys = OFF");
  try {
    const tables = [
      "smile_webhook_event",
      "verification_job",
      "user_kyc_status",
      "webhook_event",
      "refund",
      "donation",
      "payment_transaction",
      "campaign_update",
      "content_moderation",
      "campaign",
      "withdrawal_account",
      "invitation",
      "member",
      "organization",
      "category",
      "auth_user",
      "countries",
      "currencies",
    ];
    for (const table of tables) {
      try {
        sqlite.exec(`DELETE FROM ${table}`);
      } catch (_error) {
        // Table might not exist, ignore
        logger.info(`    Table ${table} doesn't exist or couldn't be cleaned, skipping`);
      }
    }
  } finally {
    sqlite.exec("PRAGMA foreign_keys = ON");
  }
  logger.info("  → Database cleaned");
}

async function seedDatabase(db: ReturnType<typeof drizzle>) {
  try {
    logger.info("  → Seeding static data (currencies, countries)...");
    await seedStaticDataForDb(db);
    logger.info("  → Creating test user...");
    const testUser = await createTestUserForDb(db);
    logger.info("  → Creating organizations...");
    const organizations = await createTestOrganizationsForDb(db, testUser.id);
    logger.info("  → Seeding categories...");
    const categories = await seedCategoriesForDb(db);
    logger.info("  → Seeding campaigns...");
    const campaigns = await seedCampaignsForDb(db, testUser.id, organizations, categories);
    logger.info("  → Seeding donations and transactions...");
    const donations = await seedDonationsAndTransactionsForDb(db, campaigns, testUser.id);
    logger.info("  → Fetching transactions...");
    const transactions = await db.select().from(paymentTransaction);
    logger.info("  → Seeding refunds...");
    await seedRefundsForDb(db, donations, testUser.id);
    logger.info("  → Seeding withdrawal accounts...");
    await seedWithdrawalAccountsForDb(db, organizations);
    logger.info("  → Seeding campaign updates...");
    await seedCampaignUpdatesForDb(db, campaigns, testUser.id);
    logger.info("  → Seeding content moderation...");
    await seedContentModerationForDb(db, campaigns, testUser.id);
    logger.info("  → Seeding webhook events...");
    await seedWebhookEventsForDb(db, transactions);
    logger.info("  → Seeding KYC status...");
    await seedKycStatusForDb(db, testUser.id);
    logger.info("  → Seeding invitations...");
    await seedInvitationsForDb(db, organizations, testUser.id);
    return { organizations, campaigns, donations, transactions };
  } catch (error) {
    logger.error("Error during seeding step:", { error });
    throw error;
  }
}

async function seedStaticDataForDb(db: ReturnType<typeof drizzle>) {
  await db.insert(currencies).values(currenciesData);
  await db.insert(countries).values(countriesData);
}

async function createTestUserForDb(db: ReturnType<typeof drizzle>) {
  const testEmail = "mahaliasmah@gmail.com";
  const seedUser = {
    id: nanoid(10),
    name: "Test User",
    email: testEmail,
    emailVerified: true,
    image: `https://avatar.vercel.sh/${encodeURIComponent(testEmail)}`,
    phoneNumber: "+1234567890",
    phoneNumberVerified: true,
    isAnonymous: false,
  };
  const [insertedUser] = await db.insert(user).values(seedUser).returning();
  if (!insertedUser) {
    throw new Error("Failed to create test user");
  }
  return insertedUser;
}

async function createTestOrganizationsForDb(db: ReturnType<typeof drizzle>, userId: string) {
  const organizations = [];
  const primaryOrgData = {
    id: nanoid(10),
    name: "Test Organization",
    slug: "test-org",
    logo: null,
    createdAt: new Date(),
    metadata: JSON.stringify({
      description: "Test organization for development",
    }),
  };
  const [primaryOrg] = await db.insert(organization).values(primaryOrgData).returning();
  if (!primaryOrg) {
    throw new Error("Failed to create test organization");
  }
  await db.insert(member).values({
    id: nanoid(10),
    userId: userId,
    organizationId: primaryOrg.id,
    role: "owner",
    createdAt: new Date(),
  });
  organizations.push(primaryOrg);
  const additionalOrgs = [
    {
      name: "Community Foundation",
      slug: "community-foundation",
      role: "admin" as const,
    },
    {
      name: "Charity Partners",
      slug: "charity-partners",
      role: "member" as const,
    },
  ];
  for (const orgInfo of additionalOrgs) {
    const orgData = {
      id: nanoid(10),
      name: orgInfo.name,
      slug: orgInfo.slug,
      logo: null,
      createdAt: faker.date.past({ years: 1 }),
      metadata: JSON.stringify({
        description: faker.company.catchPhrase(),
      }),
    };
    const [insertedOrg] = await db.insert(organization).values(orgData).returning();
    if (!insertedOrg) continue;
    await db.insert(member).values({
      id: nanoid(10),
      userId: userId,
      organizationId: insertedOrg.id,
      role: orgInfo.role,
      createdAt: orgData.createdAt,
    });
    organizations.push(insertedOrg);
  }
  return organizations;
}

async function seedCategoriesForDb(db: ReturnType<typeof drizzle>) {
  const baseCategories = [
    "Medical",
    "Education",
    "Community",
    "Animals",
    "Environment",
    "Emergency",
    "Sports",
    "Arts & Culture",
    "Technology",
    "Food & Nutrition",
  ];
  const categories = baseCategories.map((name) => ({
    name,
    enabled: true,
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: new Date(),
  }));
  return await db.insert(category).values(categories).returning();
}

async function seedCampaignsForDb(
  db: ReturnType<typeof drizzle>,
  userId: string,
  organizations: Array<{ id: string }>,
  categories: Array<{
    id: string;
    name: string;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>,
) {
  const campaignCount = randomInt(80, 120);
  const insertedCampaigns = [];
  const now = new Date();
  for (let i = 0; i < campaignCount; i++) {
    const selectedCategory = pickOne(categories);
    const selectedOrg = pickOne(organizations);
    const status = pickWeighted<CampaignStatus>(
      Object.keys(statusConfigs) as CampaignStatus[],
      Object.values(statusConfigs).map((c) => c.weight),
    );
    const config = statusConfigs[status];
    const campaignAge = randomInt(config.minAge, config.maxAge);
    const createdAt = new Date(now.getTime() - campaignAge * 24 * 60 * 60 * 1000);
    const title = `${faker.company.buzzVerb()} ${faker.helpers.arrayElement([
      "Help",
      "Support",
      "Fund",
      "Save",
      "Build",
      "Provide",
      "Empower",
      "Transform",
      "Restore",
    ])} ${faker.helpers.arrayElement([
      "Children",
      "Families",
      "Community",
      "Students",
      "Patients",
      "Elders",
      "Veterans",
      "Youth",
    ])} - ${selectedCategory.name}`;
    const slug = `${faker.helpers.slugify(title).toLowerCase()}-${randomInt(1000, 9999)}`;
    const goalAmount = pickWeighted(
      [500000, 1000000, 2500000, 5000000, 10000000, 25000000],
      [30, 30, 20, 10, 7, 3],
    );
    let publishedAt: Date | null = null;
    if (["ACTIVE", "COMPLETED", "CANCELLED"].includes(status)) {
      publishedAt = new Date(createdAt.getTime() + randomInt(1, 3) * 24 * 60 * 60 * 1000);
    }
    let endDate: Date | null = null;
    if (status === "COMPLETED") {
      endDate = new Date(createdAt.getTime() + randomInt(30, campaignAge) * 24 * 60 * 60 * 1000);
    } else if (["ACTIVE", "CANCELLED"].includes(status) && faker.datatype.boolean(0.3)) {
      endDate = faker.date.future({ refDate: now });
    }
    // Use only Ghana Cedis and Ghana (matching seeded static data)
    const selectedCurrency = "GHS";
    const selectedCountry = "GH";
    const campaignData = {
      slug,
      status,
      amount: goalAmount,
      currency: selectedCurrency,
      coverImage: `campaigns/${slug}.jpg`,
      title,
      beneficiaryName: faker.person.fullName(),
      country: selectedCountry,
      description: faker.lorem.paragraphs(randomInt(3, 6)),
      categoryId: selectedCategory.id,
      organizationId: selectedOrg.id,
      createdBy: userId,
      isUnlisted: faker.datatype.boolean(0.05),
      feeHandling: pickWeighted(
        ["DONOR_ASK_COVER", "DONOR_REQUIRE_COVER", "CAMPAIGN_ABSORB"] as const,
        [60, 20, 20],
      ),
      thankYouMessage: faker.lorem.sentences(randomInt(1, 3)),
      seoTitle: `${title} - Support this cause`,
      seoDescription: faker.lorem.sentence(),
      donateButtonText: pickOne(["Donate Now", "Support This Cause", "Give Today", null]),
      publishedAt,
      endDate,
      createdAt,
      updatedAt: new Date(createdAt.getTime() + randomInt(0, campaignAge) * 24 * 60 * 60 * 1000),
    };
    const [insertedCampaign] = await db.insert(campaign).values(campaignData).returning();
    if (insertedCampaign) {
      insertedCampaigns.push({
        ...insertedCampaign,
        expectedDonationRange: config.donationRange,
      });
    }
  }
  return insertedCampaigns;
}

async function seedDonationsAndTransactionsForDb(
  db: ReturnType<typeof drizzle>,
  campaigns: Array<{
    id: string;
    status: string;
    currency: string;
    createdAt: Date;
    publishedAt: Date | null;
    expectedDonationRange: [number, number];
  }>,
  userId: string,
): Promise<
  Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    paymentTransactionId: string;
    createdAt: Date;
  }>
> {
  const now = new Date();
  const allDonations = [];
  for (const campaignItem of campaigns) {
    const [minDonations, maxDonations] = campaignItem.expectedDonationRange;
    if (minDonations === 0 && maxDonations === 0) continue;
    const donationCount = randomInt(minDonations, maxDonations);
    const startDate = campaignItem.publishedAt || campaignItem.createdAt;
    for (let i = 0; i < donationCount; i++) {
      const campaignLifespan = now.getTime() - startDate.getTime();
      const timeMultiplier = Math.random() ** 2;
      const donationDate = new Date(startDate.getTime() + campaignLifespan * timeMultiplier);
      const amount = pickWeighted(
        [10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2500000],
        [25, 30, 20, 12, 7, 4, 1.5, 0.5],
      );
      const donorInfo = generateDonorInfo(userId);
      const donationStatus = pickWeighted(["SUCCESS", "PENDING", "FAILED"] as const, [90, 5, 5]);
      const reference = `DON_${faker.string.alphanumeric({ length: 12, casing: "upper" })}`;
      const paymentMethod = pickWeighted(["mobile_money", "card", "bank_transfer"], [60, 30, 10]);
      const feePercentage = paymentMethod === "mobile_money" ? 150 : 280;
      const fees = Math.floor((amount * feePercentage) / 10000);
      const transactionData = {
        processor: pickWeighted(["paystack", "stripe"], [90, 10]),
        processorRef: `ref_${faker.string.alphanumeric({ length: 16 })}`,
        processorTransactionId: donationStatus === "SUCCESS" ? faker.string.numeric(10) : null,
        amount,
        fees,
        currency: campaignItem.currency,
        paymentMethod,
        status: donationStatus,
        statusMessage:
          donationStatus === "FAILED"
            ? pickOne([
                "Payment declined by provider",
                "Insufficient funds",
                "Card expired",
                "Transaction timeout",
              ])
            : null,
        metadata: JSON.stringify({
          campaign_id: campaignItem.id,
          donor_email: donorInfo.donorEmail,
          ip_address: faker.internet.ip(),
        }),
        createdAt: donationDate,
        updatedAt: donationDate,
        completedAt: donationStatus === "SUCCESS" ? donationDate : null,
      };
      const [insertedTransaction] = await db
        .insert(paymentTransaction)
        .values(transactionData)
        .returning();
      if (!insertedTransaction) {
        throw new Error("Failed to create payment transaction");
      }
      const donationData = {
        campaignId: campaignItem.id,
        amount,
        currency: campaignItem.currency,
        reference,
        paymentTransactionId: insertedTransaction.id,
        ...donorInfo,
        donorMessage: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
        showMessage: faker.datatype.boolean(0.85),
        status: donationStatus,
        createdAt: donationDate,
        updatedAt: donationDate,
        completedAt: donationStatus === "SUCCESS" ? donationDate : null,
      };
      const [insertedDonation] = await db.insert(donation).values(donationData).returning();
      if (insertedDonation?.paymentTransactionId) {
        allDonations.push({
          id: insertedDonation.id,
          amount: insertedDonation.amount,
          currency: insertedDonation.currency,
          status: insertedDonation.status,
          paymentTransactionId: insertedDonation.paymentTransactionId,
          createdAt: insertedDonation.createdAt,
        });
      }
    }
  }
  return allDonations;
}

async function seedRefundsForDb(
  db: ReturnType<typeof drizzle>,
  donations: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    paymentTransactionId: string;
    createdAt: Date;
  }>,
  userId: string,
) {
  const successfulDonations = donations.filter((d) => d.status === "SUCCESS");
  const refundCount = Math.floor(successfulDonations.length * 0.05);
  for (let i = 0; i < refundCount; i++) {
    const donationToRefund = pickOne(successfulDonations);
    const refundDate = new Date(
      donationToRefund.createdAt.getTime() + randomInt(1, 30) * 24 * 60 * 60 * 1000,
    );
    const refundStatus = pickWeighted(["PENDING", "COMPLETED", "FAILED"] as const, [20, 70, 10]);
    const refundData = {
      donationId: donationToRefund.id,
      transactionId: donationToRefund.paymentTransactionId,
      amount: donationToRefund.amount,
      reason: pickOne([
        "Donor requested refund",
        "Duplicate payment",
        "Campaign cancelled",
        "Payment error",
      ]),
      processor: "paystack",
      processorRefundId:
        refundStatus === "COMPLETED" ? `refund_${faker.string.alphanumeric(16)}` : null,
      status: refundStatus,
      initiatedBy: userId,
      processedAt: refundStatus === "COMPLETED" ? refundDate : null,
      createdAt: refundDate,
      updatedAt: refundDate,
    };
    await db.insert(refund).values(refundData);
  }
}

async function seedWithdrawalAccountsForDb(
  db: ReturnType<typeof drizzle>,
  organizations: Array<{ id: string }>,
) {
  for (const org of organizations) {
    const accountCount = randomInt(1, 3);
    for (let i = 0; i < accountCount; i++) {
      const accountType = pickWeighted(["bank", "mobile_money"] as const, [60, 40]);
      let accountData: {
        accountType: string;
        bankCode: string | null;
        accountNumber: string;
        accountName: string;
        name: string;
        mobileMoneyProvider: string | null;
        recipientCode: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
      };
      if (accountType === "bank") {
        accountData = {
          accountType: "bank",
          bankCode: faker.string.numeric(3),
          accountNumber: faker.string.numeric(10),
          accountName: faker.person.fullName(),
          name: `${faker.company.name()} Bank Account`,
          mobileMoneyProvider: null,
          recipientCode: `RCP_${faker.string.alphanumeric(16)}`,
          organizationId: org.id,
          createdAt: faker.date.past({ years: 1 }),
          updatedAt: new Date(),
          deletedAt: faker.datatype.boolean(0.1) ? faker.date.recent() : null,
        };
      } else {
        accountData = {
          accountType: "mobile_money",
          bankCode: null,
          accountNumber: faker.string.numeric(10),
          accountName: faker.person.fullName(),
          name: `${pickOne(["MTN", "Vodafone", "AirtelTigo"])} Mobile Money`,
          mobileMoneyProvider: pickOne(["MTN", "Vodafone", "AirtelTigo"]),
          recipientCode: `RCP_${faker.string.alphanumeric(16)}`,
          organizationId: org.id,
          createdAt: faker.date.past({ years: 1 }),
          updatedAt: new Date(),
          deletedAt: null,
        };
      }
      await db.insert(withdrawalAccount).values(accountData);
    }
  }
}

async function seedCampaignUpdatesForDb(
  db: ReturnType<typeof drizzle>,
  campaigns: Array<{
    id: string;
    status: string;
    createdAt: Date;
    publishedAt: Date | null;
  }>,
  userId: string,
) {
  const now = new Date();
  for (const campaignItem of campaigns) {
    if (!["ACTIVE", "COMPLETED"].includes(campaignItem.status)) continue;
    if (!campaignItem.publishedAt) continue;
    const shouldHaveUpdates = faker.datatype.boolean(0.4);
    if (!shouldHaveUpdates) continue;
    const updateCount = randomInt(1, 5);
    const campaignLifespan = now.getTime() - campaignItem.publishedAt.getTime();
    for (let i = 0; i < updateCount; i++) {
      const updateDate = new Date(
        campaignItem.publishedAt.getTime() + Math.random() * campaignLifespan,
      );
      const updateTitles = [
        "Thank you for your amazing support!",
        "Milestone reached! Here's what's next",
        "Update on our progress",
        "Halfway to our goal!",
        "Important update from our team",
        "Photos from the field",
        "Your impact in action",
      ];
      const updateData = {
        title: pickOne(updateTitles),
        content: faker.lorem.paragraphs(randomInt(2, 4)),
        campaignId: campaignItem.id,
        authorId: userId,
        isPinned: faker.datatype.boolean(0.1),
        isHidden: false,
        createdAt: updateDate,
        updatedAt: updateDate,
      };
      await db.insert(campaignUpdate).values(updateData);
    }
  }
}

async function seedContentModerationForDb(
  db: ReturnType<typeof drizzle>,
  campaigns: Array<{
    id: string;
    status: string;
    createdAt: Date;
  }>,
  userId: string,
) {
  for (const campaignItem of campaigns) {
    if (!["UNDER_REVIEW", "ACTIVE", "COMPLETED", "REJECTED"].includes(campaignItem.status)) {
      continue;
    }
    const moderatedAt = new Date(
      campaignItem.createdAt.getTime() + randomInt(2, 48) * 60 * 60 * 1000,
    );
    const flagged = faker.datatype.boolean(0.05);
    const requiresManualReview = flagged || faker.datatype.boolean(0.1);
    let moderationStatus: "PENDING" | "APPROVED" | "REJECTED" | "REQUIRES_REVIEW";
    let reviewDecision: "APPROVE" | "REJECT" | "ESCALATE" | null = null;
    if (campaignItem.status === "REJECTED") {
      moderationStatus = "REJECTED";
      reviewDecision = "REJECT";
    } else if (requiresManualReview) {
      moderationStatus = "REQUIRES_REVIEW";
      reviewDecision = "APPROVE";
    } else {
      moderationStatus = "APPROVED";
    }
    const moderationData = {
      contentType: "campaign" as const,
      contentId: campaignItem.id,
      status: moderationStatus,
      flagged,
      flaggedCategories: flagged ? JSON.stringify(["potentially-sensitive"]) : null,
      categoryScores: JSON.stringify({
        harassment: Math.random() * 0.1,
        hate: Math.random() * 0.1,
        selfHarm: Math.random() * 0.05,
        sexual: Math.random() * 0.1,
        violence: Math.random() * 0.1,
      }),
      recommendation: flagged ? "Review required" : "Approve",
      moderationProvider: "openai",
      openaiModerationId: `modr_${faker.string.alphanumeric(24)}`,
      moderatedAt,
      requiresManualReview,
      reviewedBy: requiresManualReview ? userId : null,
      reviewedAt: requiresManualReview
        ? new Date(moderatedAt.getTime() + randomInt(1, 24) * 60 * 60 * 1000)
        : null,
      reviewDecision,
      reviewNotes: requiresManualReview ? faker.lorem.sentence() : null,
      previousModerationId: null,
      retryCount: 0,
      errorMessage: null,
      createdAt: moderatedAt,
      updatedAt: moderatedAt,
    };
    await db.insert(contentModeration).values(moderationData);
  }
}

async function seedWebhookEventsForDb(
  db: ReturnType<typeof drizzle>,
  transactions: Array<{
    id: string;
    processor: string;
    status: string;
    createdAt: Date;
  }>,
) {
  const eventTypes = [
    "payment.success",
    "payment.failed",
    "payment.pending",
    "charge.success",
    "charge.failed",
    "transfer.success",
    "transfer.failed",
  ];
  const eventCount = Math.floor(transactions.length * 0.3);
  for (let i = 0; i < eventCount; i++) {
    const transaction = pickOne(transactions);
    const eventType = pickOne(eventTypes);
    const receivedAt = new Date(transaction.createdAt.getTime() + randomInt(0, 5) * 60 * 1000);
    const webhookStatus = pickWeighted(["PENDING", "PROCESSED", "FAILED"] as const, [10, 85, 5]);
    const webhookData = {
      processor: transaction.processor,
      processorEventId: `evt_${faker.string.alphanumeric(24)}`,
      eventType,
      signature: faker.string.alphanumeric(64),
      rawPayload: JSON.stringify({
        event: eventType,
        data: {
          id: transaction.id,
          status: transaction.status,
        },
      }),
      status: webhookStatus,
      processedAt: webhookStatus === "PROCESSED" ? receivedAt : null,
      errorMessage: webhookStatus === "FAILED" ? "Processing error" : null,
      receivedAt,
      createdAt: receivedAt,
      updatedAt: receivedAt,
    };
    await db.insert(webhookEvent).values(webhookData);
  }
}

async function seedKycStatusForDb(db: ReturnType<typeof drizzle>, userId: string) {
  const kycStatus = pickWeighted(["PENDING", "VERIFIED", "REJECTED"] as const, [30, 60, 10]);
  const kycData = {
    userId,
    kycStatus,
    kycVerifiedAt: kycStatus === "VERIFIED" ? faker.date.past({ years: 1 }) : null,
    smileJobId: kycStatus !== "PENDING" ? `job_${faker.string.alphanumeric(16)}` : null,
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: new Date(),
  };
  await db.insert(userKycStatus).values(kycData);
  if (kycStatus !== "PENDING") {
    const jobStatus = kycStatus === "VERIFIED" ? "completed" : "failed";
    const smileJobId = kycData.smileJobId || "";
    const jobData = {
      userId,
      smileJobId,
      product: pickOne(["basic_kyc", "biometric_kyc", "enhanced_kyc"]),
      status: jobStatus,
      resultCode: jobStatus === "completed" ? "1000" : "2001",
      resultText: jobStatus === "completed" ? "Verification successful" : "Verification failed",
      rawResult: JSON.stringify({
        status: jobStatus,
        verification: {
          verified: jobStatus === "completed",
        },
      }),
      createdAt: kycData.createdAt,
      updatedAt: kycData.updatedAt,
    };
    const [insertedJob] = await db.insert(verificationJob).values(jobData).returning();
    if (insertedJob && jobStatus === "completed") {
      const webhookData = {
        jobId: insertedJob.smileJobId,
        eventType: "verification_complete",
        signature: faker.string.alphanumeric(64),
        rawPayload: JSON.stringify({
          job_id: insertedJob.smileJobId,
          status: "completed",
        }),
        status: "processed",
        processedAt: insertedJob.updatedAt,
        errorMessage: null,
        createdAt: insertedJob.updatedAt,
        updatedAt: insertedJob.updatedAt,
      };
      await db.insert(smileWebhookEvent).values(webhookData);
    }
  }
}

async function seedInvitationsForDb(
  db: ReturnType<typeof drizzle>,
  organizations: Array<{ id: string; createdAt: Date }>,
  userId: string,
) {
  for (const org of organizations) {
    const invitationCount = randomInt(2, 5);
    for (let i = 0; i < invitationCount; i++) {
      const invitationStatus = pickWeighted(
        ["pending", "accepted", "expired"] as const,
        [40, 40, 20],
      );
      const createdAt = faker.date.past({ years: 1 });
      const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
      const invitationData = {
        id: nanoid(10),
        organizationId: org.id,
        email: faker.internet.email().toLowerCase(),
        role: pickOne(["member", "admin", null]),
        status: invitationStatus,
        expiresAt,
        inviterId: userId,
      };
      await db.insert(invitation).values(invitationData);
    }
  }
}

async function main() {
  try {
    // Seed all SQLite files to ensure we cover the one the dev server uses
    const results = await seedAllDatabases();

    logger.info("\n✅ Seeding completed successfully for all databases!");
    for (const result of results) {
      logger.info(`   - ${result.organizations.length} organizations`);
      logger.info(`   - ${result.campaigns.length} campaigns`);
      logger.info(`   - ${result.donations.length} donations`);
      logger.info(`   - ${result.transactions.length} transactions`);
    }
  } catch (error) {
    logger.error("Seeding failed", { error });
    if (error instanceof Error) {
      logger.error(`Error message: ${error.message}`);
      if (error.stack) {
        logger.error(`Stack trace: ${error.stack}`);
      }
    }
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
