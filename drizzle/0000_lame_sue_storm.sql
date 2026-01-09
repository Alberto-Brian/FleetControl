CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL
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
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`password` text NOT NULL,
	`gender` text,
	`address` text,
	`avatar` text
);
