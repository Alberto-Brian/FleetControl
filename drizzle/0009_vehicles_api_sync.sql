-- Migration: add api sync tracking to vehicles table
ALTER TABLE `vehicles` ADD `api_vehicle_id` text;
ALTER TABLE `vehicles` ADD `api_synced_at` text;
