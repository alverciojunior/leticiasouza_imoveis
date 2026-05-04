CREATE TABLE `propertyViews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `propertyViews_id` PRIMARY KEY(`id`)
);
