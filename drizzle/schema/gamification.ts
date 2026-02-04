/**
 * Gamification-related Schema Tables
 *
 * バッジ・アチーブメント・達成記念ページ関連のテーブル定義
 */

import { pgTable, serial, integer, varchar, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";

const badgeTypeEnum = pgEnum("badge_type", ["participation", "achievement", "milestone", "special"]);
const badgeConditionTypeEnum = pgEnum("badge_condition_type", [
  "first_participation", "goal_reached", "milestone_25", "milestone_50", "milestone_75",
  "contribution_5", "contribution_10", "contribution_20", "host_challenge", "special", "follower_badge",
]);
const achievementTypeEnum = pgEnum("achievement_type", ["participation", "hosting", "invitation", "contribution", "streak", "special"]);
const achievementConditionTypeEnum = pgEnum("achievement_condition_type", [
  "first_participation", "participate_5", "participate_10", "participate_25", "participate_50",
  "first_host", "host_5", "host_10", "invite_1", "invite_5", "invite_10", "invite_25",
  "contribution_10", "contribution_50", "contribution_100", "streak_3", "streak_7", "streak_30",
  "goal_reached", "special",
]);
const rarityEnum = pgEnum("rarity", ["common", "uncommon", "rare", "epic", "legendary"]);

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  iconUrl: text("iconUrl"),
  type: badgeTypeEnum("type").default("participation").notNull(),
  conditionType: badgeConditionTypeEnum("conditionType").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  badgeId: integer("badgeId").notNull(),
  challengeId: integer("challengeId"),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  iconUrl: text("iconUrl"),
  icon: varchar("icon", { length: 32 }).default("🏆").notNull(),
  type: achievementTypeEnum("type").default("participation").notNull(),
  conditionType: achievementConditionTypeEnum("conditionType").notNull(),
  conditionValue: integer("conditionValue").default(1).notNull(),
  points: integer("points").default(10).notNull(),
  rarity: rarityEnum("rarity").default("common").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  achievementId: integer("achievementId").notNull(),
  progress: integer("progress").default(0).notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

export const achievementPages = pgTable("achievement_pages", {
  id: serial("id").primaryKey(),
  challengeId: integer("challengeId").notNull(),
  achievedAt: timestamp("achievedAt").notNull(),
  finalValue: integer("finalValue").notNull(),
  goalValue: integer("goalValue").notNull(),
  totalParticipants: integer("totalParticipants").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AchievementPage = typeof achievementPages.$inferSelect;
export type InsertAchievementPage = typeof achievementPages.$inferInsert;

export const pickedComments = pgTable("picked_comments", {
  id: serial("id").primaryKey(),
  participationId: integer("participationId").notNull(),
  challengeId: integer("challengeId").notNull(),
  pickedBy: integer("pickedBy").notNull(),
  reason: text("reason"),
  isUsedInVideo: boolean("isUsedInVideo").default(false).notNull(),
  pickedAt: timestamp("pickedAt").defaultNow().notNull(),
});

export type PickedComment = typeof pickedComments.$inferSelect;
export type InsertPickedComment = typeof pickedComments.$inferInsert;
