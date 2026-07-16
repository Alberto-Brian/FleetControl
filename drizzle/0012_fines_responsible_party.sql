ALTER TABLE `fines` ADD `responsible_party` text CHECK(`responsible_party` IN ('company','driver'));
