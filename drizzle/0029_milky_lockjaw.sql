CREATE TABLE `message_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`participationId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `message_likes_id` PRIMARY KEY(`id`)
);
