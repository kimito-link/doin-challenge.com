/**
 * User-related Schema Tables
 *
 * ユーザー認証・プロフィール関連のテーブル定義
 */

import { pgTable, serial, integer, varchar, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";

const roleEnum = pgEnum("role", ["user", "admin"]);
const genderEnum = pgEnum("gender", ["male", "female", "unspecified"]);

// =============================================================================
// Users Table
// =============================================================================

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  gender: genderEnum("gender").default("unspecified").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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
export const twitterFollowStatus = pgTable("twitter_follow_status", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  twitterId: varchar("twitterId", { length: 64 }).notNull(),
  twitterUsername: varchar("twitterUsername", { length: 255 }),
  targetTwitterId: varchar("targetTwitterId", { length: 64 }).notNull(),
  targetUsername: varchar("targetUsername", { length: 255 }).notNull(),
  isFollowing: boolean("isFollowing").default(false).notNull(),
  lastCheckedAt: timestamp("lastCheckedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TwitterFollowStatus = typeof twitterFollowStatus.$inferSelect;
export type InsertTwitterFollowStatus = typeof twitterFollowStatus.$inferInsert;

// =============================================================================
// OAuth PKCE Data Table
// =============================================================================

/**
 * OAuth PKCE データテーブル（認証フロー用）
 */
export const oauthPkceData = pgTable("oauth_pkce_data", {
  id: serial("id").primaryKey(),
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
export const twitterUserCache = pgTable("twitter_user_cache", {
  id: serial("id").primaryKey(),
  twitterUsername: varchar("twitterUsername", { length: 255 }).notNull().unique(),
  twitterId: varchar("twitterId", { length: 64 }),
  displayName: varchar("displayName", { length: 255 }),
  profileImage: text("profileImage"),
  followersCount: integer("followersCount").default(0),
  description: text("description"),
  cachedAt: timestamp("cachedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TwitterUserCache = typeof twitterUserCache.$inferSelect;
export type InsertTwitterUserCache = typeof twitterUserCache.$inferInsert;
