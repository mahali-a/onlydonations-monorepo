-- Add created_at column to invitation table with a constant default (will be overwritten by app code)
-- SQLite doesn't allow non-constant defaults for ALTER TABLE ADD COLUMN
ALTER TABLE `invitation` ADD `created_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint

-- Create indexes for better query performance
CREATE INDEX `invitation_organizationId_idx` ON `invitation` (`organization_id`);--> statement-breakpoint
CREATE INDEX `invitation_email_idx` ON `invitation` (`email`);--> statement-breakpoint
CREATE INDEX `auth_account_userId_idx` ON `auth_account` (`user_id`);--> statement-breakpoint
CREATE INDEX `auth_session_userId_idx` ON `auth_session` (`user_id`);--> statement-breakpoint
CREATE INDEX `auth_verification_identifier_idx` ON `auth_verification` (`identifier`);--> statement-breakpoint
CREATE INDEX `member_organizationId_idx` ON `member` (`organization_id`);--> statement-breakpoint
CREATE INDEX `member_userId_idx` ON `member` (`user_id`);
