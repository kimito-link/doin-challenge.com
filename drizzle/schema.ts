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
  // カテゴリ
  categoryId: int("categoryId"),
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

/**
 * エールテーブル（参加者同士の応援）
 */
export const cheers = mysqlTable("cheers", {
  id: int("id").autoincrement().primaryKey(),
  // エールを送る人
  fromUserId: int("fromUserId").notNull(),
  fromUserName: varchar("fromUserName", { length: 255 }).notNull(),
  fromUserImage: text("fromUserImage"),
  // エールを受ける人
  toParticipationId: int("toParticipationId").notNull(),
  toUserId: int("toUserId"),
  // エール内容
  message: text("message"),
  emoji: varchar("emoji", { length: 32 }).default("👏").notNull(),
  // チャレンジ情報
  challengeId: int("challengeId").notNull(),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Cheer = typeof cheers.$inferSelect;
export type InsertCheer = typeof cheers.$inferInsert;

/**
 * 達成記念ページテーブル
 */
export const achievementPages = mysqlTable("achievement_pages", {
  id: int("id").autoincrement().primaryKey(),
  challengeId: int("challengeId").notNull(),
  // 達成情報
  achievedAt: timestamp("achievedAt").notNull(),
  finalValue: int("finalValue").notNull(),
  goalValue: int("goalValue").notNull(),
  totalParticipants: int("totalParticipants").notNull(),
  // ページ設定
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  isPublic: boolean("isPublic").default(true).notNull(),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AchievementPage = typeof achievementPages.$inferSelect;
export type InsertAchievementPage = typeof achievementPages.$inferInsert;

// 後方互換性のためのエイリアス
export const events = challenges;
export type Event = Challenge;
export type InsertEvent = InsertChallenge;


/**
 * リマインダーテーブル
 */
export const reminders = mysqlTable("reminders", {
  id: int("id").autoincrement().primaryKey(),
  challengeId: int("challengeId").notNull(),
  userId: int("userId").notNull(),
  // リマインダー設定
  reminderType: mysqlEnum("reminderType", ["day_before", "day_of", "hour_before", "custom"]).default("day_before").notNull(),
  customTime: timestamp("customTime"),
  // ステータス
  isSent: boolean("isSent").default(false).notNull(),
  sentAt: timestamp("sentAt"),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

/**
 * ダイレクトメッセージテーブル
 */
export const directMessages = mysqlTable("direct_messages", {
  id: int("id").autoincrement().primaryKey(),
  // 送信者
  fromUserId: int("fromUserId").notNull(),
  fromUserName: varchar("fromUserName", { length: 255 }).notNull(),
  fromUserImage: text("fromUserImage"),
  // 受信者
  toUserId: int("toUserId").notNull(),
  // メッセージ内容
  message: text("message").notNull(),
  // チャレンジ情報（同じチャレンジの参加者同士のみ）
  challengeId: int("challengeId").notNull(),
  // ステータス
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = typeof directMessages.$inferInsert;

/**
 * チャレンジテンプレートテーブル
 */
export const challengeTemplates = mysqlTable("challenge_templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // テンプレート情報
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // チャレンジ設定
  goalType: mysqlEnum("goalType", ["attendance", "followers", "viewers", "points", "custom"]).default("attendance").notNull(),
  goalValue: int("goalValue").default(100).notNull(),
  goalUnit: varchar("goalUnit", { length: 32 }).default("人").notNull(),
  eventType: mysqlEnum("eventType", ["solo", "group"]).default("solo").notNull(),
  // チケット情報
  ticketPresale: int("ticketPresale"),
  ticketDoor: int("ticketDoor"),
  // 公開設定
  isPublic: boolean("isPublic").default(false).notNull(),
  // 使用回数
  useCount: int("useCount").default(0).notNull(),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChallengeTemplate = typeof challengeTemplates.$inferSelect;
export type InsertChallengeTemplate = typeof challengeTemplates.$inferInsert;


/**
 * フォローテーブル（ホスト・アーティストのフォロー）
 */
export const follows = mysqlTable("follows", {
  id: int("id").autoincrement().primaryKey(),
  // フォローする人
  followerId: int("followerId").notNull(),
  followerName: varchar("followerName", { length: 255 }),
  // フォローされる人（ホスト）
  followeeId: int("followeeId").notNull(),
  followeeName: varchar("followeeName", { length: 255 }),
  followeeImage: text("followeeImage"),
  // 通知設定
  notifyNewChallenge: boolean("notifyNewChallenge").default(true).notNull(),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;

/**
 * 検索履歴テーブル
 */
export const searchHistory = mysqlTable("search_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  query: varchar("query", { length: 255 }).notNull(),
  resultCount: int("resultCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = typeof searchHistory.$inferInsert;


/**
 * カテゴリマスターテーブル
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  icon: varchar("icon", { length: 32 }).default("🎤").notNull(),
  color: varchar("color", { length: 16 }).default("#EC4899").notNull(),
  description: text("description"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * チャレンジ招待テーブル
 */
export const invitations = mysqlTable("invitations", {
  id: int("id").autoincrement().primaryKey(),
  challengeId: int("challengeId").notNull(),
  // 招待者
  inviterId: int("inviterId").notNull(),
  inviterName: varchar("inviterName", { length: 255 }),
  // 招待コード
  code: varchar("code", { length: 32 }).notNull().unique(),
  // 使用制限
  maxUses: int("maxUses").default(0), // 0 = 無制限
  useCount: int("useCount").default(0).notNull(),
  // 有効期限
  expiresAt: timestamp("expiresAt"),
  // ステータス
  isActive: boolean("isActive").default(true).notNull(),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;

/**
 * 招待経由の参加追跡テーブル
 */
export const invitationUses = mysqlTable("invitation_uses", {
  id: int("id").autoincrement().primaryKey(),
  invitationId: int("invitationId").notNull(),
  // 招待された人
  userId: int("userId"),
  displayName: varchar("displayName", { length: 255 }),
  // 参加情報
  participationId: int("participationId"),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvitationUse = typeof invitationUses.$inferSelect;
export type InsertInvitationUse = typeof invitationUses.$inferInsert;


/**
 * 統計データテーブル（参加者数推移など）
 */
export const challengeStats = mysqlTable("challenge_stats", {
  id: int("id").autoincrement().primaryKey(),
  challengeId: int("challengeId").notNull(),
  // 日時
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  recordDate: varchar("recordDate", { length: 10 }).notNull(), // YYYY-MM-DD
  recordHour: int("recordHour").default(0).notNull(), // 0-23
  // 統計データ
  participantCount: int("participantCount").default(0).notNull(),
  totalContribution: int("totalContribution").default(0).notNull(),
  newParticipants: int("newParticipants").default(0).notNull(),
  // 地域別データ（JSON形式）
  prefectureData: text("prefectureData"), // JSON: { "東京都": 10, "大阪府": 5, ... }
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChallengeStat = typeof challengeStats.$inferSelect;
export type InsertChallengeStat = typeof challengeStats.$inferInsert;

/**
 * アチーブメントマスターテーブル
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  // アチーブメント情報
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  iconUrl: text("iconUrl"),
  icon: varchar("icon", { length: 32 }).default("🏆").notNull(),
  // アチーブメント種別
  type: mysqlEnum("type", ["participation", "hosting", "invitation", "contribution", "streak", "special"]).default("participation").notNull(),
  // 取得条件
  conditionType: mysqlEnum("conditionType", [
    "first_participation",
    "participate_5",
    "participate_10",
    "participate_25",
    "participate_50",
    "first_host",
    "host_5",
    "host_10",
    "invite_1",
    "invite_5",
    "invite_10",
    "invite_25",
    "contribution_10",
    "contribution_50",
    "contribution_100",
    "streak_3",
    "streak_7",
    "streak_30",
    "goal_reached",
    "special"
  ]).notNull(),
  conditionValue: int("conditionValue").default(1).notNull(),
  // ポイント・レアリティ
  points: int("points").default(10).notNull(),
  rarity: mysqlEnum("rarity", ["common", "uncommon", "rare", "epic", "legendary"]).default("common").notNull(),
  // メタデータ
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * ユーザーアチーブメントテーブル
 */
export const userAchievements = mysqlTable("user_achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  achievementId: int("achievementId").notNull(),
  // 進捗（条件が数値の場合）
  progress: int("progress").default(0).notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  // 取得日時
  completedAt: timestamp("completedAt"),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

/**
 * コラボホストテーブル（共同主催者）
 */
export const collaborators = mysqlTable("collaborators", {
  id: int("id").autoincrement().primaryKey(),
  challengeId: int("challengeId").notNull(),
  // コラボホストの情報
  userId: int("userId").notNull(),
  userName: varchar("userName", { length: 255 }).notNull(),
  userImage: text("userImage"),
  // 権限
  role: mysqlEnum("role", ["owner", "co-host", "moderator"]).default("co-host").notNull(),
  canEdit: boolean("canEdit").default(true).notNull(),
  canManageParticipants: boolean("canManageParticipants").default(true).notNull(),
  canInvite: boolean("canInvite").default(true).notNull(),
  // ステータス
  status: mysqlEnum("status", ["pending", "accepted", "declined"]).default("pending").notNull(),
  invitedAt: timestamp("invitedAt").defaultNow().notNull(),
  respondedAt: timestamp("respondedAt"),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Collaborator = typeof collaborators.$inferSelect;
export type InsertCollaborator = typeof collaborators.$inferInsert;

/**
 * コラボ招待テーブル
 */
export const collaboratorInvitations = mysqlTable("collaborator_invitations", {
  id: int("id").autoincrement().primaryKey(),
  challengeId: int("challengeId").notNull(),
  // 招待者（オーナー）
  inviterId: int("inviterId").notNull(),
  inviterName: varchar("inviterName", { length: 255 }),
  // 被招待者
  inviteeId: int("inviteeId"),
  inviteeEmail: varchar("inviteeEmail", { length: 320 }),
  inviteeTwitterId: varchar("inviteeTwitterId", { length: 64 }),
  // 招待コード
  code: varchar("code", { length: 32 }).notNull().unique(),
  // 権限設定
  role: mysqlEnum("role", ["co-host", "moderator"]).default("co-host").notNull(),
  // ステータス
  status: mysqlEnum("status", ["pending", "accepted", "declined", "expired"]).default("pending").notNull(),
  expiresAt: timestamp("expiresAt"),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CollaboratorInvitation = typeof collaboratorInvitations.$inferSelect;
export type InsertCollaboratorInvitation = typeof collaboratorInvitations.$inferInsert;


/**
 * Twitterフォロー状態テーブル
 * 特定アカウント（@idolfunch）のフォロー状態を保存
 */
export const twitterFollowStatus = mysqlTable("twitter_follow_status", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Twitter情報
  twitterId: varchar("twitterId", { length: 64 }).notNull(),
  twitterUsername: varchar("twitterUsername", { length: 255 }),
  // フォロー対象アカウント
  targetTwitterId: varchar("targetTwitterId", { length: 64 }).notNull(),
  targetUsername: varchar("targetUsername", { length: 255 }).notNull(),
  // フォロー状態
  isFollowing: boolean("isFollowing").default(false).notNull(),
  // 最終確認日時
  lastCheckedAt: timestamp("lastCheckedAt").defaultNow().notNull(),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TwitterFollowStatus = typeof twitterFollowStatus.$inferSelect;
export type InsertTwitterFollowStatus = typeof twitterFollowStatus.$inferInsert;


/**
 * OAuth PKCE データテーブル（認証フロー用）
 */
export const oauthPkceData = mysqlTable("oauth_pkce_data", {
  id: int("id").autoincrement().primaryKey(),
  // state パラメータ（一意識別子）
  state: varchar("state", { length: 64 }).notNull().unique(),
  // PKCE code verifier
  codeVerifier: varchar("codeVerifier", { length: 128 }).notNull(),
  // コールバックURL
  callbackUrl: text("callbackUrl").notNull(),
  // 有効期限（10分後）
  expiresAt: timestamp("expiresAt").notNull(),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OAuthPkceData = typeof oauthPkceData.$inferSelect;
export type InsertOAuthPkceData = typeof oauthPkceData.$inferInsert;


/**
 * 参加者の友人テーブル（一緒に参加する友人）
 */
export const participationCompanions = mysqlTable("participation_companions", {
  id: int("id").autoincrement().primaryKey(),
  // 参加登録への紐付け
  participationId: int("participationId").notNull(),
  challengeId: int("challengeId").notNull(),
  // 友人の情報
  displayName: varchar("displayName", { length: 255 }).notNull(),
  twitterUsername: varchar("twitterUsername", { length: 255 }),
  twitterId: varchar("twitterId", { length: 64 }),
  profileImage: text("profileImage"),
  // 招待した人のユーザーID
  invitedByUserId: int("invitedByUserId"),
  // メタデータ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ParticipationCompanion = typeof participationCompanions.$inferSelect;
export type InsertParticipationCompanion = typeof participationCompanions.$inferInsert;
