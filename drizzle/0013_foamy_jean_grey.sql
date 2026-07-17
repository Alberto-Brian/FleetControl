ALTER TABLE `fines` ADD `responsible_party` text;--> statement-breakpoint
ALTER TABLE `maintenances` ADD `next_maintenance_km` integer;--> statement-breakpoint
ALTER TABLE `vehicles` ADD `tracking_enabled` integer DEFAULT true NOT NULL;