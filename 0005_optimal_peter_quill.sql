CREATE TABLE `successStories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`imageKey` varchar(255),
	`imageUrl` varchar(500),
	`likeCount` int NOT NULL DEFAULT 0,
	`commentCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `successStories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `successStoryComments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storyId` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `successStoryComments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `successStoryLikes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storyId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `successStoryLikes_id` PRIMARY KEY(`id`),
	CONSTRAINT `successStoryLikes_userId_storyId_unique` UNIQUE(`userId`,`storyId`)
);
--> statement-breakpoint
ALTER TABLE `successStories` ADD CONSTRAINT `successStories_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `successStoryComments` ADD CONSTRAINT `successStoryComments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `successStoryComments` ADD CONSTRAINT `successStoryComments_storyId_successStories_id_fk` FOREIGN KEY (`storyId`) REFERENCES `successStories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `successStoryLikes` ADD CONSTRAINT `successStoryLikes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `successStoryLikes` ADD CONSTRAINT `successStoryLikes_storyId_successStories_id_fk` FOREIGN KEY (`storyId`) REFERENCES `successStories`(`id`) ON DELETE cascade ON UPDATE no action;