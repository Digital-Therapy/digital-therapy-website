CREATE TABLE `vendorCaseStudies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`summary` text,
	`sector` varchar(120),
	`outcome` text,
	`link` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vendorCaseStudies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendorCertifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`name` varchar(240) NOT NULL,
	`provider` varchar(240),
	`isCurrent` boolean NOT NULL DEFAULT true,
	CONSTRAINT `vendorCertifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendorFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`field` enum('resume','w9','headshot') NOT NULL,
	`filename` varchar(260) NOT NULL,
	`mimeType` varchar(160),
	`sizeBytes` int,
	`storageRef` varchar(500),
	CONSTRAINT `vendorFiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendorSectors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`sector` varchar(120) NOT NULL,
	CONSTRAINT `vendorSectors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendorSkills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`skill` varchar(120) NOT NULL,
	`source` enum('form','parsed') NOT NULL DEFAULT 'form',
	CONSTRAINT `vendorSkills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendorTeamMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`fullName` varchar(160),
	`title` varchar(160),
	`roleSkills` varchar(500),
	`location` varchar(160),
	`yearsTogether` varchar(60),
	CONSTRAINT `vendorTeamMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorTypeLabel` varchar(160) NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` varchar(160),
	`personalBio` text,
	`companyCv` text,
	`hourlyRate` varchar(120),
	`hoursPerMonth` varchar(120),
	`hourlyRateNumeric` int,
	`hoursPerMonthNumeric` int,
	`availabilityNotes` text,
	`additionalSkills` text,
	`teamSize` varchar(40),
	`marketingConsent` boolean NOT NULL DEFAULT false,
	`nameUsageConsent` boolean NOT NULL DEFAULT false,
	`signature` varchar(240),
	`ndaBusinessName` varchar(240),
	`ndaEntityDescriptor` varchar(240),
	`ndaAddress` varchar(500),
	`ndaSignerName` varchar(160),
	`ndaSignerTitle` varchar(160),
	`ndaSignerPhone` varchar(60),
	`ndaSignerEmail` varchar(320),
	`ndaSignatureText` varchar(160),
	`ndaSignatureDate` varchar(40),
	`ndaEffectiveDate` varchar(40),
	`ndaRequestCopy` boolean NOT NULL DEFAULT false,
	`context` varchar(240),
	`sourcePage` varchar(500),
	`status` enum('applied','screening','approved','onboarded','archived') NOT NULL DEFAULT 'applied',
	`statusNotes` text,
	`portalForwarded` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `vendorCaseStudies_vendor_idx` ON `vendorCaseStudies` (`vendorId`);--> statement-breakpoint
CREATE INDEX `vendorCertifications_vendor_idx` ON `vendorCertifications` (`vendorId`);--> statement-breakpoint
CREATE INDEX `vendorCertifications_name_idx` ON `vendorCertifications` (`name`);--> statement-breakpoint
CREATE INDEX `vendorFiles_vendor_idx` ON `vendorFiles` (`vendorId`);--> statement-breakpoint
CREATE INDEX `vendorSectors_vendor_idx` ON `vendorSectors` (`vendorId`);--> statement-breakpoint
CREATE INDEX `vendorSectors_sector_idx` ON `vendorSectors` (`sector`);--> statement-breakpoint
CREATE INDEX `vendorSkills_vendor_idx` ON `vendorSkills` (`vendorId`);--> statement-breakpoint
CREATE INDEX `vendorSkills_skill_idx` ON `vendorSkills` (`skill`);--> statement-breakpoint
CREATE INDEX `vendorSkills_vendor_skill_idx` ON `vendorSkills` (`vendorId`,`skill`);--> statement-breakpoint
CREATE INDEX `vendorTeamMembers_vendor_idx` ON `vendorTeamMembers` (`vendorId`);--> statement-breakpoint
CREATE INDEX `vendors_email_idx` ON `vendors` (`email`);--> statement-breakpoint
CREATE INDEX `vendors_status_idx` ON `vendors` (`status`);