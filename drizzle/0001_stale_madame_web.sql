CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`propertyTitle` varchar(255) NOT NULL,
	`visitorName` varchar(255) NOT NULL,
	`visitorEmail` varchar(320) NOT NULL,
	`visitorPhone` varchar(20) NOT NULL,
	`visitDate` varchar(10) NOT NULL,
	`visitTime` varchar(5) NOT NULL,
	`message` text,
	`status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
