CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeId` varchar(64) NOT NULL,
	`badgeName` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(64) NOT NULL,
	`category` enum('streak','completion','consistency','milestone','special') NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `streak_freezes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`habitId` int NOT NULL,
	`userId` int NOT NULL,
	`freezeDate` date NOT NULL,
	`freezeType` enum('daily','weekly') NOT NULL DEFAULT 'daily',
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `streak_freezes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `ach_userIdIdx` ON `achievements` (`userId`);--> statement-breakpoint
CREATE INDEX `ach_badgeIdIdx` ON `achievements` (`badgeId`);--> statement-breakpoint
CREATE INDEX `ach_earnedAtIdx` ON `achievements` (`earnedAt`);--> statement-breakpoint
CREATE INDEX `freeze_habitIdIdx` ON `streak_freezes` (`habitId`);--> statement-breakpoint
CREATE INDEX `freeze_userIdIdx` ON `streak_freezes` (`userId`);--> statement-breakpoint
CREATE INDEX `freeze_freezeDateIdx` ON `streak_freezes` (`freezeDate`);