import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * チャレンジテーブル（動員ちゃれんじ）
 */
export const challenges = mysqlTable("challenges", {
  id: int("id").autoincrement().primaryKey(),
  // ホスト（主催者）の情報
  hostUserId: int("hostUserId"),
  hostTwitterId: varchar("hostTwitterId", { length: 64 }),
  hostName: varchar("hostName", { length: 255 }).notNull(),
  hostUsername: varchar("hostUsername", { length: 255 }),
  hostProfileImage: text("hostProfileImage"),
  hostFollowersCount: int("hostFollowersCount").default(0),
  hostDescription: text("hostDescription"),
  // チャレンジ情報
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  // 目標設定
  goalType: mysqlEnum("goalType", ["attendance", "followers", "viewers", "points", "custom"]).default("attendance").notNull(),
  goalValue: int("goalValue").default(100).notNull(),
  goalUnit: varchar("goalUnit", { length: 32 }).default("人").notNull(),
  currentValue: int("currentValue").default(0).notNull(),
  // イベント種別
  eventType: mysqlEnum("eventType", ["solo", "group"]).default("solo").notNull(),
  // 日時・場所
  eventDate: timestamp("eventDate").notNull(),
  venue: varchar("venue", { length: 255 }),
  prefecture: varchar("prefecture", { length: 32 }),
  // チケット情報
  ticketPresale: int("ticketPresale"),
  ticketDoor: int("ticketDoor"),
  ticketSaleStart: timestamp("ticketSaleStart"),
  ticketUrl: text("ticketUrl"),
  // 外部リンク（YouTube, ミクチャなど）
  externalUrl: text("externalUrl"),
  // ステータス
  status: mysqlEnum("status", ["upcoming", "active", "ended"]).default("active").notNull(),
  isPublic: boolean("isPublic").default(true).notNull(),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

/**
 * 参加登録テーブル
 */
export const participations = mysqlTable("participations", {
  id: int("id").autoincrement().primaryKey(),
  challengeId: int("challengeId").notNull(),
  // 参加者の情報（Twitterログインまたは匿名）
  userId: int("userId"),
  twitterId: varchar("twitterId", { length: 64 }),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }),
  profileImage: text("profileImage"),
  // 参加情報
  message: text("message"),
  companionCount: int("companionCount").default(0).notNull(),
  // 地域情報
  prefecture: varchar("prefecture", { length: 32 }),
  // 貢献度（自分 + 同伴者数）
  contribution: int("contribution").default(1).notNull(),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Participation = typeof participations.$inferSelect;
export type InsertParticipation = typeof participations.$inferInsert;

/**
 * 通知設定テーブル
 */
export const notificationSettings = mysqlTable("notification_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  challengeId: int("challengeId").notNull(),
  // 通知設定
  onGoalReached: boolean("onGoalReached").default(true).notNull(),
  onMilestone25: boolean("onMilestone25").default(true).notNull(),
  onMilestone50: boolean("onMilestone50").default(true).notNull(),
  onMilestone75: boolean("onMilestone75").default(true).notNull(),
  onNewParticipant: boolean("onNewParticipant").default(false).notNull(),
  // Expoプッシュトークン
  expoPushToken: text("expoPushToken"),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationSetting = typeof notificationSettings.$inferSelect;
export type InsertNotificationSetting = typeof notificationSettings.$inferInsert;

/**
 * 通知履歴テーブル
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  challengeId: int("challengeId").notNull(),
  // 通知内容
  type: mysqlEnum("type", ["goal_reached", "milestone_25", "milestone_50", "milestone_75", "new_participant"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  // ステータス
  isRead: boolean("isRead").default(false).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * バッジマスターテーブル
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  // バッジ情報
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  iconUrl: text("iconUrl"),
  // バッジ種別
  type: mysqlEnum("type", ["participation", "achievement", "milestone", "special"]).default("participation").notNull(),
  // 取得条件
  conditionType: mysqlEnum("conditionType", ["first_participation", "goal_reached", "milestone_25", "milestone_50", "milestone_75", "contribution_5", "contribution_10", "contribution_20", "host_challenge", "special"]).notNull(),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * ユーザーバッジ関連テーブル
 */
export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeId: int("badgeId").notNull(),
  challengeId: int("challengeId"),
  // 取得日時
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

/**
 * ピックアップコメントテーブル
 */
export const pickedComments = mysqlTable("picked_comments", {
  id: int("id").autoincrement().primaryKey(),
  participationId: int("participationId").notNull(),
  challengeId: int("challengeId").notNull(),
  // ピックアップ情報
  pickedBy: int("pickedBy").notNull(), // 管理者のuserId
  reason: text("reason"), // ピックアップ理由
  isUsedInVideo: boolean("isUsedInVideo").default(false).notNull(),
  // メタデータ
  pickedAt: timestamp("pickedAt").defaultNow().notNull(),
});

export type PickedComment = typeof pickedComments.$inferSelect;
export type InsertPickedComment = typeof pickedComments.$inferInsert;

// 後方互換性のためのエイリアス
export const events = challenges;
export type Event = Challenge;
export type InsertEvent = InsertChallenge;
