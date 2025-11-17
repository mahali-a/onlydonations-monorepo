ALTER TABLE `donation` ADD `cover_fees` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `donation` ADD `failed_at` integer;--> statement-breakpoint
ALTER TABLE `donation` ADD `failure_reason` text;