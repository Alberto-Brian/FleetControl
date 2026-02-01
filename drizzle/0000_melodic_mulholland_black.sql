CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`table_name` text NOT NULL,
	`record_id` text NOT NULL,
	`action` text NOT NULL,
	`previous_data` text,
	`new_data` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `company_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`company_name` text NOT NULL,
	`tax_id` text,
	`phone` text,
	`email` text,
	`address` text,
	`city` text,
	`state` text,
	`postal_code` text,
	`logo` text,
	`currency` text DEFAULT 'AOA' NOT NULL,
	`timezone` text DEFAULT 'Africa/Luanda' NOT NULL,
	`deleted_at` text,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `drivers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`tax_id` text,
	`id_number` text,
	`birth_date` text,
	`phone` text,
	`email` text,
	`address` text,
	`city` text,
	`state` text,
	`postal_code` text,
	`license_number` text NOT NULL,
	`license_category` text NOT NULL,
	`license_expiry_date` text NOT NULL,
	`hire_date` text,
	`status` text DEFAULT 'active' NOT NULL,
	`photo` text,
	`notes` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`vehicle_id` text,
	`trip_id` text,
	`driver_id` text,
	`description` text NOT NULL,
	`amount` integer NOT NULL,
	`expense_date` text NOT NULL,
	`due_date` text,
	`payment_date` text,
	`payment_method` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`document_number` text,
	`supplier` text,
	`notes` text,
	`file_path` text,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `expense_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text DEFAULT '#EF4444' NOT NULL,
	`type` text DEFAULT 'operational' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE TABLE `fines` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`driver_id` text,
	`fine_number` text NOT NULL,
	`fine_date` text NOT NULL,
	`infraction_type` text NOT NULL,
	`description` text NOT NULL,
	`location` text,
	`fine_amount` integer NOT NULL,
	`due_date` text,
	`payment_date` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`points` integer,
	`authority` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fuel_stations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`brand` text,
	`phone` text,
	`address` text,
	`city` text,
	`fuel_types` text,
	`has_convenience_store` text DEFAULT 'false' NOT NULL,
	`has_car_wash` text DEFAULT 'false' NOT NULL,
	`notes` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE TABLE `maintenance_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'corrective' NOT NULL,
	`description` text,
	`color` text DEFAULT '#F59E0B' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE TABLE `maintenance_items` (
	`id` text PRIMARY KEY NOT NULL,
	`maintenance_id` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price` integer NOT NULL,
	`total_price` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`maintenance_id`) REFERENCES `maintenances`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `maintenances` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`category_id` text NOT NULL,
	`workshop_id` text,
	`type` text NOT NULL,
	`entry_date` text NOT NULL,
	`exit_date` text,
	`vehicle_mileage` integer NOT NULL,
	`description` text NOT NULL,
	`diagnosis` text,
	`solution` text,
	`parts_cost` integer DEFAULT 0 NOT NULL,
	`labor_cost` integer DEFAULT 0 NOT NULL,
	`total_cost` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`work_order_number` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `maintenance_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`workshop_id`) REFERENCES `workshops`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `refuelings` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`driver_id` text,
	`trip_id` text,
	`station_id` text,
	`refueling_date` text NOT NULL,
	`fuel_type` text NOT NULL,
	`liters` integer NOT NULL,
	`price_per_liter` integer NOT NULL,
	`total_cost` integer NOT NULL,
	`current_mileage` integer NOT NULL,
	`is_full_tank` integer DEFAULT false NOT NULL,
	`invoice_number` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`station_id`) REFERENCES `fuel_stations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `routes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`origin` text NOT NULL,
	`destination` text NOT NULL,
	`distance_km` integer NOT NULL,
	`estimated_duration_hours` integer,
	`route_type` text DEFAULT 'regular' NOT NULL,
	`description` text,
	`waypoints` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE TABLE `system_info` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`system_name` text NOT NULL,
	`version` text NOT NULL,
	`installed_at` text NOT NULL,
	`deleted_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`driver_id` text NOT NULL,
	`route_id` text,
	`trip_code` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`start_mileage` integer NOT NULL,
	`end_mileage` integer,
	`origin` text,
	`destination` text,
	`purpose` text,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`avatar` text,
	`is_active` integer DEFAULT true NOT NULL,
	`last_access_at` text,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE TABLE `vehicle_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text DEFAULT '#3B82F6' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE TABLE `vehicle_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`document_type` text NOT NULL,
	`document_number` text,
	`issue_date` text,
	`expiry_date` text,
	`value` integer,
	`file_path` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`license_plate` text NOT NULL,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`year` integer NOT NULL,
	`color` text,
	`chassis_number` text,
	`engine_number` text,
	`fuel_tank_capacity` integer,
	`current_mileage` integer DEFAULT 0 NOT NULL,
	`acquisition_date` text,
	`acquisition_value` integer,
	`status` text DEFAULT 'available' NOT NULL,
	`notes` text,
	`photo` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`category_id`) REFERENCES `vehicle_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workshops` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`email` text,
	`address` text,
	`city` text,
	`state` text,
	`specialties` text,
	`notes` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`created_by` text,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `drivers_tax_id_unique` ON `drivers` (`tax_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `drivers_license_number_unique` ON `drivers` (`license_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `expense_categories_name_unique` ON `expense_categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `fines_fine_number_unique` ON `fines` (`fine_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `maintenance_categories_name_unique` ON `maintenance_categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `trips_trip_code_unique` ON `trips` (`trip_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `vehicle_categories_name_unique` ON `vehicle_categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `vehicles_license_plate_unique` ON `vehicles` (`license_plate`);