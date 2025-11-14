-- Step 1: Add organization_id column
ALTER TABLE "payment_transaction" ADD COLUMN "organization_id" text;--> statement-breakpoint

-- Step 2: Backfill from metadata for withdrawal transactions
UPDATE "payment_transaction"
SET "organization_id" = (
  CASE 
    WHEN "metadata" IS NOT NULL AND "metadata" != '' 
    THEN ("metadata"::json->>'organizationId')::text
    ELSE NULL
  END
)
WHERE "processor" = 'paystack_transfer';--> statement-breakpoint

-- Step 3: Backfill from donations for donation transactions
UPDATE "payment_transaction" pt
SET "organization_id" = c."organization_id"
FROM "donation" d
JOIN "campaign" c ON d."campaign_id" = c."id"
WHERE pt."id" = d."payment_transaction_id"
  AND pt."organization_id" IS NULL;--> statement-breakpoint

-- Step 4: Add foreign key constraint
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Step 5: Add index for performance
CREATE INDEX IF NOT EXISTS "idx_payment_transaction_org_processor_status" 
ON "payment_transaction"("organization_id", "processor", "status");