/**
 * Notification-related Schema Tables
 *
 * 通知設定・履歴・リマインダー関連のテーブル定義
 */

import { pgTable, serial, integer, varchar, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";

const notificationTypeEnum = pgEnum("notification_type", ["goal_reached", "milestone_25", "milestone_50", "milestone_75", "new_participant"]);
const reminderTypeEnum = pgEnum("reminderType", ["day_before", "day_of", "hour_before", "custom"]);

export const notificationSettings = pgTable("notification_settings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  challengeId: integer("challengeId").notNull(),
  onGoalReached: boolean("onGoalReached").default(true).notNull(),
  onMilestone25: boolean("onMilestone25").default(true).notNull(),
  onMilestone50: boolean("onMilestone50").default(true).notNull(),
  onMilestone75: boolean("onMilestone75").default(true).notNull(),
  onNewParticipant: boolean("onNewParticipant").default(false).notNull(),
  expoPushToken: text("expoPushToken"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type NotificationSetting = typeof notificationSettings.$inferSelect;
export type InsertNotificationSetting = typeof notificationSettings.$inferInsert;

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  challengeId: integer("challengeId").notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  challengeId: integer("challengeId").notNull(),
  userId: integer("userId").notNull(),
  reminderType: reminderTypeEnum("reminderType").default("day_before").notNull(),
  customTime: timestamp("customTime"),
  isSent: boolean("isSent").default(false).notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;
