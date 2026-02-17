CREATE TABLE `generated_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`period_start` text NOT NULL,
	`period_end` text NOT NULL,
	`language` text DEFAULT 'pt' NOT NULL,
	`file_name` text NOT NULL,
	`file_size` integer,
	`data_json` text NOT NULL,
	`stats_json` text NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text
);
