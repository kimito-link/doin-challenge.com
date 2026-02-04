/**
 * Participation-related Schema Tables
 *
 * 参加登録・同伴者関連のテーブル定義
 */

import { pgTable, serial, integer, varchar, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";

const genderEnum = pgEnum("gender", ["male", "female", "unspecified"]);
const attendanceTypeEnum = pgEnum("attendanceType", ["venue", "streaming", "both"]);

export const participations = pgTable("participations", {
  id: serial("id").primaryKey(),
  challengeId: integer("challengeId").notNull(),
  userId: integer("userId"),
  twitterId: varchar("twitterId", { length: 64 }),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }),
  profileImage: text("profileImage"),
  followersCount: integer("followersCount").default(0),
  message: text("message"),
  companionCount: integer("companionCount").default(0).notNull(),
  prefecture: varchar("prefecture", { length: 32 }),
  gender: genderEnum("gender").default("unspecified").notNull(),
  contribution: integer("contribution").default(1).notNull(),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  attendanceType: attendanceTypeEnum("attendanceType").default("venue").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  deletedBy: integer("deletedBy"),
});

export type Participation = typeof participations.$inferSelect;
export type InsertParticipation = typeof participations.$inferInsert;

export const participationCompanions = pgTable("participation_companions", {
  id: serial("id").primaryKey(),
  participationId: integer("participationId").notNull(),
  challengeId: integer("challengeId").notNull(),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  twitterUsername: varchar("twitterUsername", { length: 255 }),
  twitterId: varchar("twitterId", { length: 64 }),
  profileImage: text("profileImage"),
  invitedByUserId: integer("invitedByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ParticipationCompanion = typeof participationCompanions.$inferSelect;
export type InsertParticipationCompanion = typeof participationCompanions.$inferInsert;
