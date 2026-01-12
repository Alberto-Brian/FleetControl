CREATE TABLE `blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`letter` text NOT NULL,
	`description` text,
	`total_spaces` integer DEFAULT 0 NOT NULL,
	`occupied_spaces` integer DEFAULT 0 NOT NULL,
	`available_spaces` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	`metadata` text,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`seller_id` text NOT NULL,
	`space_id` text NOT NULL,
	`amount` integer NOT NULL,
	`status` text DEFAULT 'Pendente' NOT NULL,
	`method` text,
	`due_date` text NOT NULL,
	`paid_date` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`seller_id`) REFERENCES `sellers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sellers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`status` text DEFAULT 'Ativo' NOT NULL,
	`total_debt` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `spaces` (
	`id` text PRIMARY KEY NOT NULL,
	`block_id` text NOT NULL,
	`number` text NOT NULL,
	`size` text NOT NULL,
	`status` text DEFAULT 'Disponível' NOT NULL,
	`is_fixed` integer DEFAULT true NOT NULL,
	`payment_type` text NOT NULL,
	`price` integer NOT NULL,
	`seller_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`block_id`) REFERENCES `blocks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`seller_id`) REFERENCES `sellers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `system_info` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`system_name` text NOT NULL,
	`version` text NOT NULL,
	`installed_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`amount` integer NOT NULL,
	`status` text DEFAULT 'Pendente' NOT NULL,
	`method` text,
	`payment_id` text,
	`date` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`password` text NOT NULL,
	`gender` text,
	`address` text,
	`avatar` text
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`period` text NOT NULL,
	`total_collected` integer DEFAULT 0 NOT NULL,
	`total_pending` integer DEFAULT 0 NOT NULL,
	`total_overdue` integer DEFAULT 0 NOT NULL,
	`occupancy_rate` integer DEFAULT 0 NOT NULL,
	`active_spaces` integer DEFAULT 0 NOT NULL,
	`data` text,
	`generated_at` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blocks_letter_unique` ON `blocks` (`letter`);