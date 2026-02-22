CREATE TABLE `driver_leaves` (
	`id` text PRIMARY KEY NOT NULL,
	`driver_id` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`reason` text,
	`notes` text,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`cancelled_at` text,
	`cancelled_reason` text,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `vehicles` ADD `tire_size` text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_driver_leaves_driver_id` ON `driver_leaves` (`driver_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_driver_leaves_status` ON `driver_leaves` (`status`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_driver_leaves_start_date` ON `driver_leaves` (`start_date`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_driver_leaves_end_date` ON `driver_leaves` (`end_date`);