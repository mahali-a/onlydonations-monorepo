ALTER TABLE `donation` ADD `processor_fees` integer;--> statement-breakpoint
ALTER TABLE `donation` ADD `net_amount` integer;--> statement-breakpoint
UPDATE `donation` SET `processor_fees` = ROUND(`amount` * 0.0195), `net_amount` = `amount` - ROUND(`amount` * 0.0195) WHERE `status` = 'SUCCESS' AND `net_amount` IS NULL;