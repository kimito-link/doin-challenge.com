/**
 * User-related Schema Tables
 * 
 * ユーザー認証・プロフィール関連のテーブル定義
 */

import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, boolean, json } from "drizzle-orm/mysql-core";

// =============================================================================
// Users Table
// =============================================================================

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  genre: mysqlEnum("genre", ["idol", "artist", "vtuber", "streamer", "band", "dancer", "voice_actor", "other"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// =============================================================================
// Twitter Follow Status Table
// =============================================================================

/**
 * Twitterフォロー状態テーブル
 * 特定アカウント（@idolfunch）のフォロー状態を保存
 */
export const twitterFollowStatus = mysqlTable("twitter_follow_status", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  twitterId: varchar("twitterId", { length: 64 }).notNull(),
  twitterUsername: varchar("twitterUsername", { length: 255 }),
  targetTwitterId: varchar("targetTwitterId", { length: 64 }).notNull(),
  targetUsername: varchar("targetUsername", { length: 255 }).notNull(),
  isFollowing: boolean("isFollowing").default(false).notNull(),
  lastCheckedAt: timestamp("lastCheckedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TwitterFollowStatus = typeof twitterFollowStatus.$inferSelect;
export type InsertTwitterFollowStatus = typeof twitterFollowStatus.$inferInsert;

// =============================================================================
// OAuth PKCE Data Table
// =============================================================================

/**
 * OAuth PKCE データテーブル（認証フロー用）
 */
export const oauthPkceData = mysqlTable("oauth_pkce_data", {
  id: int("id").autoincrement().primaryKey(),
  state: varchar("state", { length: 64 }).notNull().unique(),
  codeVerifier: varchar("codeVerifier", { length: 128 }).notNull(),
  callbackUrl: text("callbackUrl").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OAuthPkceData = typeof oauthPkceData.$inferSelect;
export type InsertOAuthPkceData = typeof oauthPkceData.$inferInsert;

// =============================================================================
// Twitter User Cache Table
// =============================================================================

/**
 * Twitterユーザーキャッシュテーブル
 */
export const twitterUserCache = mysqlTable("twitter_user_cache", {
  id: int("id").autoincrement().primaryKey(),
  twitterUsername: varchar("twitterUsername", { length: 255 }).notNull().unique(),
  twitterId: varchar("twitterId", { length: 64 }),
  displayName: varchar("displayName", { length: 255 }),
  profileImage: text("profileImage"),
  followersCount: int("followersCount").default(0),
  description: text("description"),
  cachedAt: timestamp("cachedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TwitterUserCache = typeof twitterUserCache.$inferSelect;
export type InsertTwitterUserCache = typeof twitterUserCache.$inferInsert;
