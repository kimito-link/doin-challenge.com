/**
 * Participation-related Schema Tables
 * 
 * 参加登録・同伴者関連のテーブル定義
 */

import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, boolean } from "drizzle-orm/mysql-core";

// =============================================================================
// Participations Table
// =============================================================================

/**
 * 参加登録テーブル
 * 
 * v6.40: ソフトデリート対応
 * - deletedAt: 削除日時（nullなら有効、値があれば削除済み）
 * - deletedBy: 削除したユーザーID（本人 or 管理者）
 */
export const participations = mysqlTable("participations", {
  id: int("id").autoincrement().primaryKey(),
  challengeId: int("challengeId").notNull(),
  userId: int("userId"),
  twitterId: varchar("twitterId", { length: 64 }),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }),
  profileImage: text("profileImage"),
  followersCount: int("followersCount").default(0),
  message: text("message"),
  companionCount: int("companionCount").default(0).notNull(),
  prefecture: varchar("prefecture", { length: 32 }),
  gender: mysqlEnum("gender", ["male", "female", "unspecified"]).default("unspecified").notNull(),
  contribution: int("contribution").default(1).notNull(),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  // ソフトデリート用カラム
  deletedAt: timestamp("deletedAt"),
  deletedBy: int("deletedBy"),
});

export type Participation = typeof participations.$inferSelect;
export type InsertParticipation = typeof participations.$inferInsert;

// =============================================================================
// Participation Companions Table
// =============================================================================

/**
 * 参加者の友人テーブル（一緒に参加する友人）
 */
export const participationCompanions = mysqlTable("participation_companions", {
  id: int("id").autoincrement().primaryKey(),
  participationId: int("participationId").notNull(),
  challengeId: int("challengeId").notNull(),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  twitterUsername: varchar("twitterUsername", { length: 255 }),
  twitterId: varchar("twitterId", { length: 64 }),
  profileImage: text("profileImage"),
  invitedByUserId: int("invitedByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ParticipationCompanion = typeof participationCompanions.$inferSelect;
export type InsertParticipationCompanion = typeof participationCompanions.$inferInsert;
