CREATE TABLE "campaign" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"goal_amount" integer NOT NULL,
	"currency" text DEFAULT 'GHS' NOT NULL,
	"cover_image_file_key" text NOT NULL,
	"title" text NOT NULL,
	"beneficiary_name" text NOT NULL,
	"country" text DEFAULT 'GH' NOT NULL,
	"description" text NOT NULL,
	"category_id" text NOT NULL,
	"created_by" text,
	"organization_id" text NOT NULL,
	"is_unlisted" boolean,
	"end_date" timestamp,
	"donate_button_text" text,
	"thank_you_message" text,
	"fee_handling" text DEFAULT 'DONOR_ASK_COVER' NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"seo_image_file_key" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "campaign_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "campaign_update" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"campaign_id" text NOT NULL,
	"author_id" text NOT NULL,
	"is_pinned" boolean,
	"is_hidden" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "content_moderation" (
	"id" text PRIMARY KEY NOT NULL,
	"content_type" text NOT NULL,
	"content_id" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"flagged" boolean DEFAULT false NOT NULL,
	"flagged_categories" text,
	"category_scores" text,
	"recommendation" text,
	"moderation_provider" text DEFAULT 'openai' NOT NULL,
	"openai_moderation_id" text,
	"moderated_at" timestamp DEFAULT now() NOT NULL,
	"requires_manual_review" boolean DEFAULT false NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"review_decision" text,
	"review_notes" text,
	"previous_moderation_id" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"currency_code" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donation" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'GHS' NOT NULL,
	"reference" text,
	"payment_transaction_id" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"donor_id" text,
	"donor_name" text,
	"donor_email" text,
	"donor_message" text,
	"show_message" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "donation_reference_unique" UNIQUE("reference"),
	CONSTRAINT "amount_check" CHECK ("donation"."amount" > 0 AND "donation"."amount" <= 100000000)
);
--> statement-breakpoint
CREATE TABLE "smile_webhook_event" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"event_type" text DEFAULT 'verification_complete' NOT NULL,
	"signature" text NOT NULL,
	"raw_payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"processed_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_kyc_status" (
	"user_id" text PRIMARY KEY NOT NULL,
	"kyc_status" text DEFAULT 'PENDING' NOT NULL,
	"kyc_verified_at" timestamp,
	"smile_job_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_job" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"smile_job_id" text NOT NULL,
	"product" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"result_code" text,
	"result_text" text,
	"raw_result" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "verification_job_smile_job_id_unique" UNIQUE("smile_job_id")
);
--> statement-breakpoint
CREATE TABLE "payment_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"processor" text NOT NULL,
	"processor_ref" text NOT NULL,
	"processor_transaction_id" text,
	"amount" integer NOT NULL,
	"fees" integer DEFAULT 0 NOT NULL,
	"currency" text NOT NULL,
	"payment_method" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"status_message" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "payment_transaction_processor_ref_unique" UNIQUE("processor_ref"),
	CONSTRAINT "payment_amount_check" CHECK ("payment_transaction"."amount" > 0 AND "payment_transaction"."amount" <= 500000000)
);
--> statement-breakpoint
CREATE TABLE "refund" (
	"id" text PRIMARY KEY NOT NULL,
	"donation_id" text NOT NULL,
	"transaction_id" text NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"processor" text NOT NULL,
	"processor_refund_id" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"initiated_by" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "refund_amount_check" CHECK ("refund"."amount" > 0 AND "refund"."amount" <= 500000000)
);
--> statement-breakpoint
CREATE TABLE "webhook_event" (
	"id" text PRIMARY KEY NOT NULL,
	"processor" text DEFAULT 'paystack' NOT NULL,
	"processor_event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"signature" text NOT NULL,
	"raw_payload" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"processed_at" timestamp,
	"error_message" text,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "webhook_event_processor_event_id_unique" UNIQUE("processor_event_id")
);
--> statement-breakpoint
CREATE TABLE "withdrawal_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_type" text NOT NULL,
	"bank_code" text,
	"account_number" text NOT NULL,
	"account_name" text,
	"name" text,
	"mobile_money_provider" text,
	"recipient_code" text NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_currency_currencies_code_fk" FOREIGN KEY ("currency") REFERENCES "public"."currencies"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_country_countries_code_fk" FOREIGN KEY ("country") REFERENCES "public"."countries"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_created_by_auth_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_update" ADD CONSTRAINT "campaign_update_campaign_id_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_update" ADD CONSTRAINT "campaign_update_author_id_auth_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_moderation" ADD CONSTRAINT "content_moderation_reviewed_by_auth_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "countries" ADD CONSTRAINT "countries_currency_code_currencies_code_fk" FOREIGN KEY ("currency_code") REFERENCES "public"."currencies"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_campaign_id_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_currency_currencies_code_fk" FOREIGN KEY ("currency") REFERENCES "public"."currencies"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_payment_transaction_id_payment_transaction_id_fk" FOREIGN KEY ("payment_transaction_id") REFERENCES "public"."payment_transaction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_donor_id_auth_user_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."auth_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smile_webhook_event" ADD CONSTRAINT "smile_webhook_event_job_id_verification_job_smile_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."verification_job"("smile_job_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_kyc_status" ADD CONSTRAINT "user_kyc_status_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_job" ADD CONSTRAINT "verification_job_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_currency_currencies_code_fk" FOREIGN KEY ("currency") REFERENCES "public"."currencies"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refund" ADD CONSTRAINT "refund_transaction_id_payment_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."payment_transaction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_account" ADD CONSTRAINT "withdrawal_account_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "donation_campaign_id_idx" ON "donation" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "donation_donor_id_idx" ON "donation" USING btree ("donor_id");--> statement-breakpoint
CREATE INDEX "donation_donor_email_idx" ON "donation" USING btree ("donor_email");--> statement-breakpoint
CREATE INDEX "donation_status_idx" ON "donation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "donation_completed_at_idx" ON "donation" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "donation_reference_idx" ON "donation" USING btree ("reference");