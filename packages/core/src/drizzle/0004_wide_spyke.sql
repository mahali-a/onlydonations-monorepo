ALTER TABLE "organization" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_user" ADD COLUMN "last_login_method" text;--> statement-breakpoint
ALTER TABLE "auth_user" DROP COLUMN "subscribed_at";