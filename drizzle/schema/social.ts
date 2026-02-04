/**
 * Social-related Schema Tables
 *
 * エール・フォロー・DM・検索履歴関連のテーブル定義
 */

import { pgTable, serial, integer, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const cheers = pgTable("cheers", {
  id: serial("id").primaryKey(),
  fromUserId: integer("fromUserId").notNull(),
  fromUserName: varchar("fromUserName", { length: 255 }).notNull(),
  fromUserImage: text("fromUserImage"),
  toParticipationId: integer("toParticipationId").notNull(),
  toUserId: integer("toUserId"),
  message: text("message"),
  emoji: varchar("emoji", { length: 32 }).default("👏").notNull(),
  challengeId: integer("challengeId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Cheer = typeof cheers.$inferSelect;
export type InsertCheer = typeof cheers.$inferInsert;

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("followerId").notNull(),
  followerName: varchar("followerName", { length: 255 }),
  followeeId: integer("followeeId").notNull(),
  followeeName: varchar("followeeName", { length: 255 }),
  followeeImage: text("followeeImage"),
  notifyNewChallenge: boolean("notifyNewChallenge").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;

export const directMessages = pgTable("direct_messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("fromUserId").notNull(),
  fromUserName: varchar("fromUserName", { length: 255 }).notNull(),
  fromUserImage: text("fromUserImage"),
  toUserId: integer("toUserId").notNull(),
  message: text("message").notNull(),
  challengeId: integer("challengeId").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = typeof directMessages.$inferInsert;

export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  query: varchar("query", { length: 255 }).notNull(),
  resultCount: integer("resultCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = typeof searchHistory.$inferInsert;

export const favoriteArtists = pgTable("favorite_artists", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  userTwitterId: varchar("userTwitterId", { length: 64 }),
  artistTwitterId: varchar("artistTwitterId", { length: 64 }).notNull(),
  artistName: varchar("artistName", { length: 255 }),
  artistUsername: varchar("artistUsername", { length: 255 }),
  artistProfileImage: text("artistProfileImage"),
  notifyNewChallenge: boolean("notifyNewChallenge").default(true).notNull(),
  expoPushToken: text("expoPushToken"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type FavoriteArtist = typeof favoriteArtists.$inferSelect;
export type InsertFavoriteArtist = typeof favoriteArtists.$inferInsert;
