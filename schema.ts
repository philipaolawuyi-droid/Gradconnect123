import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  boolean,
  decimal,
  longtext,
  uniqueIndex,
  unique
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with alumni-specific fields.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Alumni-specific fields
  bio: text("bio"),
  graduationYear: int("graduationYear"),
  school: varchar("school", { length: 255 }),
  profilePhotoKey: varchar("profilePhotoKey", { length: 255 }), // S3 key
  // Google profile image URLs can exceed 500 characters, while S3 URLs remain supported.
  profilePhotoUrl: longtext("profilePhotoUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Posts/memories shared by alumni on the feed
 */
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  content: longtext("content").notNull(),
  photoKey: varchar("photoKey", { length: 255 }), // S3 key for post photo
  photoUrl: varchar("photoUrl", { length: 500 }), // S3 URL
  
  likeCount: int("likeCount").default(0).notNull(),
  commentCount: int("commentCount").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

/**
 * Comments on posts
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  
  likeCount: int("likeCount").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * Likes on posts
 */
export const postLikes = mysqlTable("postLikes", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  uniquePostLike: uniqueIndex("uniquePostLike").on(table.postId, table.userId),
}));

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;

/**
 * Likes on comments
 */
export const commentLikes = mysqlTable("commentLikes", {
  id: int("id").autoincrement().primaryKey(),
  commentId: int("commentId").notNull(),
  userId: int("userId").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  uniqueCommentLike: uniqueIndex("uniqueCommentLike").on(table.commentId, table.userId),
}));

export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = typeof commentLikes.$inferInsert;

/**
 * Connections/friendships between alumni
 */
export const connections = mysqlTable("connections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Initiator
  connectedUserId: int("connectedUserId").notNull(), // Target
  status: mysqlEnum("status", ["pending", "accepted", "blocked"]).default("pending").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Connection = typeof connections.$inferSelect;
export type InsertConnection = typeof connections.$inferInsert;

/**
 * One private conversation per connected alumni pair.
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userOneId: int("userOneId").notNull(),
  userTwoId: int("userTwoId").notNull(),
  lastMessageAt: timestamp("lastMessageAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueParticipantPair: uniqueIndex("uniqueParticipantPair").on(table.userOneId, table.userTwoId),
}));

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages belonging to a private alumni conversation.
 */
export const directMessages = mysqlTable("directMessages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  content: longtext("content").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = typeof directMessages.$inferInsert;

/**
 * Notifications for user activity
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Recipient
  actorId: int("actorId").notNull(), // Who triggered the notification
  type: mysqlEnum("type", ["like", "comment", "connection_request", "connection_accepted", "event_created", "event_rsvp"]).notNull(),
  
  postId: int("postId"), // For likes/comments
  commentId: int("commentId"), // For comment likes
  eventId: int("eventId"), // For event notifications
  
  isRead: boolean("isRead").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Superlatives/awards (e.g., "Most Likely To...")
 */
export const superlatives = mysqlTable("superlatives", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(), // e.g., "Most Likely To Become CEO"
  description: text("description"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Superlative = typeof superlatives.$inferSelect;
export type InsertSuperlative = typeof superlatives.$inferInsert;

/**
 * Votes for superlatives
 */
export const superlativeVotes = mysqlTable("superlativeVotes", {
  id: int("id").autoincrement().primaryKey(),
  superlativeId: int("superlativeId").notNull(),
  votedForUserId: int("votedForUserId").notNull(), // The alumni being voted for
  votedByUserId: int("votedByUserId").notNull(), // The alumni voting
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  uniqueVote: uniqueIndex("uniqueVote").on(table.superlativeId, table.votedForUserId, table.votedByUserId),
}));

export type SuperlativeVote = typeof superlativeVotes.$inferSelect;
export type InsertSuperlativeVote = typeof superlativeVotes.$inferInsert;

/**
 * Events organized by alumni (reunions, celebrations, etc.)
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  createdByUserId: int("createdByUserId").notNull(), // Event organizer
  title: varchar("title", { length: 255 }).notNull(),
  description: longtext("description"),
  location: varchar("location", { length: 500 }),
  eventDate: timestamp("eventDate").notNull(), // When the event happens
  eventEndDate: timestamp("eventEndDate"), // Optional end time
  
  photoKey: varchar("photoKey", { length: 255 }), // S3 key for event photo
  photoUrl: varchar("photoUrl", { length: 500 }), // S3 URL
  
  attendeeCount: int("attendeeCount").default(0).notNull(),
  maxAttendees: int("maxAttendees"), // Optional capacity limit
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Event RSVPs - track who is attending
 */
export const eventRsvps = mysqlTable("eventRsvps", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["going", "interested", "not_going"]).default("interested").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueRsvp: uniqueIndex("uniqueRsvp").on(table.eventId, table.userId),
}));

export type EventRsvp = typeof eventRsvps.$inferSelect;

export const successStories = mysqlTable("successStories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "career", "education", "business", "achievement"
  imageKey: varchar("imageKey", { length: 255 }),
  imageUrl: varchar("imageUrl", { length: 500 }),
  likeCount: int("likeCount").default(0).notNull(),
  commentCount: int("commentCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SuccessStory = typeof successStories.$inferSelect;
export type InsertSuccessStory = typeof successStories.$inferInsert;

export const successStoryLikes = mysqlTable(
  "successStoryLikes",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    storyId: int("storyId").notNull().references(() => successStories.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserStory: unique().on(table.userId, table.storyId),
  })
);

export const successStoryComments = mysqlTable("successStoryComments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  storyId: int("storyId").notNull().references(() => successStories.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SuccessStoryComment = typeof successStoryComments.$inferSelect;

export type InsertEventRsvp = typeof eventRsvps.$inferInsert;
