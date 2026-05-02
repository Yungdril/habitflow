CREATE TABLE `habit_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`habitId` int NOT NULL,
	`userId` int NOT NULL,
	`completedDate` date NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `habit_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `habits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`color` varchar(7) NOT NULL DEFAULT '#3b82f6',
	`icon` varchar(64) NOT NULL DEFAULT 'circle',
	`frequency` enum('daily','weekly','custom') NOT NULL DEFAULT 'daily',
	`targetDaysPerWeek` int DEFAULT 7,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`totalCompletions` int NOT NULL DEFAULT 0,
	`lastCompletedDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `habits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `habitIdIdx` ON `habit_tracking` (`habitId`);--> statement-breakpoint
CREATE INDEX `userIdIdx` ON `habit_tracking` (`userId`);--> statement-breakpoint
CREATE INDEX `completedDateIdx` ON `habit_tracking` (`completedDate`);--> statement-breakpoint
CREATE INDEX `userIdIdx` ON `habits` (`userId`);