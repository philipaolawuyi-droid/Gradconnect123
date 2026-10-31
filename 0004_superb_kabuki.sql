ALTER TABLE `commentLikes` ADD CONSTRAINT `uniqueCommentLike` UNIQUE(`commentId`,`userId`);--> statement-breakpoint
ALTER TABLE `eventRsvps` ADD CONSTRAINT `uniqueRsvp` UNIQUE(`eventId`,`userId`);--> statement-breakpoint
ALTER TABLE `postLikes` ADD CONSTRAINT `uniquePostLike` UNIQUE(`postId`,`userId`);--> statement-breakpoint
ALTER TABLE `superlativeVotes` ADD CONSTRAINT `uniqueVote` UNIQUE(`superlativeId`,`votedForUserId`,`votedByUserId`);