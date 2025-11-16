CREATE TABLE `auth_account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `auth_session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`active_organization_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_session_token_unique` ON `auth_session` (`token`);--> statement-breakpoint
CREATE TABLE `auth_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`phone_number` text,
	`phone_number_verified` integer,
	`is_anonymous` integer,
	`last_login_method` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_user_email_unique` ON `auth_user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `auth_user_phone_number_unique` ON `auth_user` (`phone_number`);--> statement-breakpoint
CREATE TABLE `auth_verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invitation` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer NOT NULL,
	`inviter_id` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inviter_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `member` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `organization` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`logo` text,
	`created_at` integer NOT NULL,
	`metadata` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_slug_unique` ON `organization` (`slug`);--> statement-breakpoint
CREATE TABLE `campaign` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`goal_amount` integer NOT NULL,
	`currency` text DEFAULT 'GHS' NOT NULL,
	`cover_image_file_key` text NOT NULL,
	`title` text NOT NULL,
	`beneficiary_name` text NOT NULL,
	`country` text DEFAULT 'GH' NOT NULL,
	`description` text NOT NULL,
	`category_id` text NOT NULL,
	`created_by` text,
	`organization_id` text NOT NULL,
	`is_unlisted` integer,
	`end_date` integer,
	`donate_button_text` text,
	`thank_you_message` text,
	`fee_handling` text DEFAULT 'DONOR_ASK_COVER' NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`seo_image_file_key` text,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`currency`) REFERENCES `currencies`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`country`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `campaign_slug_unique` ON `campaign` (`slug`);--> statement-breakpoint
CREATE TABLE `campaign_update` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`campaign_id` text NOT NULL,
	`author_id` text NOT NULL,
	`is_pinned` integer,
	`is_hidden` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `category_name_unique` ON `category` (`name`);--> statement-breakpoint
CREATE TABLE `content_moderation` (
	`id` text PRIMARY KEY NOT NULL,
	`content_type` text NOT NULL,
	`content_id` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`flagged` integer DEFAULT false NOT NULL,
	`flagged_categories` text,
	`category_scores` text,
	`recommendation` text,
	`moderation_provider` text DEFAULT 'openai' NOT NULL,
	`openai_moderation_id` text,
	`moderated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`requires_manual_review` integer DEFAULT false NOT NULL,
	`reviewed_by` text,
	`reviewed_at` integer,
	`review_decision` text,
	`review_notes` text,
	`previous_moderation_id` text,
	`retry_count` integer DEFAULT 0 NOT NULL,
	`error_message` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`reviewed_by`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`currency_code` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`currency_code`) REFERENCES `currencies`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `currencies` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`symbol` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `donation` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'GHS' NOT NULL,
	`reference` text,
	`payment_transaction_id` text,
	`is_anonymous` integer DEFAULT false NOT NULL,
	`donor_id` text,
	`donor_name` text,
	`donor_email` text,
	`donor_message` text,
	`show_message` integer DEFAULT true NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`currency`) REFERENCES `currencies`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payment_transaction_id`) REFERENCES `payment_transaction`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`donor_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `donation_reference_unique` ON `donation` (`reference`);--> statement-breakpoint
CREATE INDEX `donation_campaign_id_idx` ON `donation` (`campaign_id`);--> statement-breakpoint
CREATE INDEX `donation_donor_id_idx` ON `donation` (`donor_id`);--> statement-breakpoint
CREATE INDEX `donation_donor_email_idx` ON `donation` (`donor_email`);--> statement-breakpoint
CREATE INDEX `donation_status_idx` ON `donation` (`status`);--> statement-breakpoint
CREATE INDEX `donation_completed_at_idx` ON `donation` (`completed_at`);--> statement-breakpoint
CREATE INDEX `donation_reference_idx` ON `donation` (`reference`);--> statement-breakpoint
CREATE TABLE `smile_webhook_event` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`event_type` text DEFAULT 'verification_complete' NOT NULL,
	`signature` text NOT NULL,
	`raw_payload` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`processed_at` integer,
	`error_message` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `verification_job`(`smile_job_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_kyc_status` (
	`user_id` text PRIMARY KEY NOT NULL,
	`kyc_status` text DEFAULT 'PENDING' NOT NULL,
	`kyc_verified_at` integer,
	`smile_job_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `verification_job` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`smile_job_id` text NOT NULL,
	`product` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`result_code` text,
	`result_text` text,
	`raw_result` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `verification_job_smile_job_id_unique` ON `verification_job` (`smile_job_id`);--> statement-breakpoint
CREATE TABLE `payment_transaction` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text,
	`processor` text NOT NULL,
	`processor_ref` text NOT NULL,
	`processor_transaction_id` text,
	`amount` integer NOT NULL,
	`fees` integer DEFAULT 0 NOT NULL,
	`currency` text NOT NULL,
	`payment_method` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`status_message` text,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`currency`) REFERENCES `currencies`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_transaction_processor_ref_unique` ON `payment_transaction` (`processor_ref`);--> statement-breakpoint
CREATE TABLE `refund` (
	`id` text PRIMARY KEY NOT NULL,
	`donation_id` text NOT NULL,
	`transaction_id` text NOT NULL,
	`amount` integer NOT NULL,
	`reason` text NOT NULL,
	`processor` text NOT NULL,
	`processor_refund_id` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`initiated_by` text,
	`processed_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `payment_transaction`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `webhook_event` (
	`id` text PRIMARY KEY NOT NULL,
	`processor` text DEFAULT 'paystack' NOT NULL,
	`processor_event_id` text NOT NULL,
	`event_type` text NOT NULL,
	`signature` text NOT NULL,
	`raw_payload` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`processed_at` integer,
	`error_message` text,
	`received_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `webhook_event_processor_event_id_unique` ON `webhook_event` (`processor_event_id`);--> statement-breakpoint
CREATE TABLE `withdrawal_account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_type` text NOT NULL,
	`bank_code` text,
	`account_number` text NOT NULL,
	`account_name` text,
	`name` text,
	`mobile_money_provider` text,
	`recipient_code` text NOT NULL,
	`organization_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
