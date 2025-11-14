CREATE TABLE "user_kyc_status" (
	"user_id" text PRIMARY KEY NOT NULL,
	"kyc_status" text DEFAULT 'PENDING' NOT NULL,
	"kyc_verified_at" timestamp,
	"smile_job_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_kyc_status" ADD CONSTRAINT "user_kyc_status_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;