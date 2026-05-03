CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`enablePendingHabits` boolean NOT NULL DEFAULT true,
	`enableStreakMilestones` boolean NOT NULL DEFAULT true,
	`enableReminders` boolean NOT NULL DEFAULT true,
	`enableAchievements` boolean NOT NULL DEFAULT true,
	`reminderTime` varchar(5) DEFAULT '09:00',
	`timezone` varchar(64) DEFAULT 'UTC',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`habitId` int,
	`type` enum('pending_habit','streak_milestone','reminder','achievement') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`read` boolean NOT NULL DEFAULT false,
	`dismissed` boolean NOT NULL DEFAULT false,
	`actionUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `pref_userIdIdx` ON `notification_preferences` (`userId`);--> statement-breakpoint
CREATE INDEX `notif_userIdIdx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `notif_habitIdIdx` ON `notifications` (`habitId`);--> statement-breakpoint
CREATE INDEX `notif_createdAtIdx` ON `notifications` (`createdAt`);