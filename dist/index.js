var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";
var users, challenges, participations, notificationSettings, notifications, badges, userBadges, pickedComments, cheers, achievementPages, reminders, directMessages, challengeTemplates, follows, searchHistory, categories, invitations, invitationUses, challengeStats, achievements, userAchievements, collaborators, collaboratorInvitations, twitterFollowStatus, oauthPkceData, participationCompanions, challengeMembers, twitterUserCache, ticketTransfers, ticketWaitlist, favoriteArtists;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: int("id").autoincrement().primaryKey(),
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    challenges = mysqlTable("challenges", {
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
      slug: varchar("slug", { length: 255 }),
      // URL用のスラッグ（例: birthday-live-100）
      description: text("description"),
      // 目標設定
      goalType: mysqlEnum("goalType", ["attendance", "followers", "viewers", "points", "custom"]).default("attendance").notNull(),
      goalValue: int("goalValue").default(100).notNull(),
      goalUnit: varchar("goalUnit", { length: 32 }).default("\u4EBA").notNull(),
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
      // === AI向け最適化カラム（非正規化・1ホップ取得用） ===
      // AIサマリー（チャレンジの盛り上がり状況をAIが要約）
      aiSummary: text("aiSummary"),
      // 意図タグ（チャレンジのカテゴリ・意図をタグ化）
      intentTags: json("intentTags").$type(),
      // 地域サマリー（都道府県別参加者数の事前集計）
      regionSummary: json("regionSummary").$type(),
      // 参加者サマリー（上位貢献者・最新メッセージなどを埋め込み）
      participantSummary: json("participantSummary").$type(),
      // AIサマリーの最終更新日時
      aiSummaryUpdatedAt: timestamp("aiSummaryUpdatedAt")
    });
    participations = mysqlTable("participations", {
      id: int("id").autoincrement().primaryKey(),
      challengeId: int("challengeId").notNull(),
      // 参加者の情報（Twitterログインまたは匿名）
      userId: int("userId"),
      twitterId: varchar("twitterId", { length: 64 }),
      displayName: varchar("displayName", { length: 255 }).notNull(),
      username: varchar("username", { length: 255 }),
      profileImage: text("profileImage"),
      // 参加者のTwitterフォロワー数
      followersCount: int("followersCount").default(0),
      // 参加情報
      message: text("message"),
      companionCount: int("companionCount").default(0).notNull(),
      // 地域情報
      prefecture: varchar("prefecture", { length: 32 }),
      // 性別（male/female/unspecified）
      gender: mysqlEnum("gender", ["male", "female", "unspecified"]).default("unspecified").notNull(),
      // 貢献度（自分 + 同伴者数）
      contribution: int("contribution").default(1).notNull(),
      isAnonymous: boolean("isAnonymous").default(false).notNull(),
      // メタデータ
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    notificationSettings = mysqlTable("notification_settings", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    notifications = mysqlTable("notifications", {
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
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    badges = mysqlTable("badges", {
      id: int("id").autoincrement().primaryKey(),
      // バッジ情報
      name: varchar("name", { length: 100 }).notNull(),
      description: text("description"),
      iconUrl: text("iconUrl"),
      // バッジ種別
      type: mysqlEnum("type", ["participation", "achievement", "milestone", "special"]).default("participation").notNull(),
      // 取得条件
      conditionType: mysqlEnum("conditionType", ["first_participation", "goal_reached", "milestone_25", "milestone_50", "milestone_75", "contribution_5", "contribution_10", "contribution_20", "host_challenge", "special", "follower_badge"]).notNull(),
      // メタデータ
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    userBadges = mysqlTable("user_badges", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      badgeId: int("badgeId").notNull(),
      challengeId: int("challengeId"),
      // 取得日時
      earnedAt: timestamp("earnedAt").defaultNow().notNull()
    });
    pickedComments = mysqlTable("picked_comments", {
      id: int("id").autoincrement().primaryKey(),
      participationId: int("participationId").notNull(),
      challengeId: int("challengeId").notNull(),
      // ピックアップ情報
      pickedBy: int("pickedBy").notNull(),
      // 管理者のuserId
      reason: text("reason"),
      // ピックアップ理由
      isUsedInVideo: boolean("isUsedInVideo").default(false).notNull(),
      // メタデータ
      pickedAt: timestamp("pickedAt").defaultNow().notNull()
    });
    cheers = mysqlTable("cheers", {
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
      emoji: varchar("emoji", { length: 32 }).default("\u{1F44F}").notNull(),
      // チャレンジ情報
      challengeId: int("challengeId").notNull(),
      // メタデータ
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    achievementPages = mysqlTable("achievement_pages", {
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
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    reminders = mysqlTable("reminders", {
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
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    directMessages = mysqlTable("direct_messages", {
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
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    challengeTemplates = mysqlTable("challenge_templates", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      // テンプレート情報
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      // チャレンジ設定
      goalType: mysqlEnum("goalType", ["attendance", "followers", "viewers", "points", "custom"]).default("attendance").notNull(),
      goalValue: int("goalValue").default(100).notNull(),
      goalUnit: varchar("goalUnit", { length: 32 }).default("\u4EBA").notNull(),
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    follows = mysqlTable("follows", {
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
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    searchHistory = mysqlTable("search_history", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      query: varchar("query", { length: 255 }).notNull(),
      resultCount: int("resultCount").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    categories = mysqlTable("categories", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 64 }).notNull(),
      slug: varchar("slug", { length: 64 }).notNull().unique(),
      icon: varchar("icon", { length: 32 }).default("\u{1F3A4}").notNull(),
      color: varchar("color", { length: 16 }).default("#EC4899").notNull(),
      description: text("description"),
      sortOrder: int("sortOrder").default(0).notNull(),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    invitations = mysqlTable("invitations", {
      id: int("id").autoincrement().primaryKey(),
      challengeId: int("challengeId").notNull(),
      // 招待者
      inviterId: int("inviterId").notNull(),
      inviterName: varchar("inviterName", { length: 255 }),
      // 招待コード
      code: varchar("code", { length: 32 }).notNull().unique(),
      // 使用制限
      maxUses: int("maxUses").default(0),
      // 0 = 無制限
      useCount: int("useCount").default(0).notNull(),
      // 有効期限
      expiresAt: timestamp("expiresAt"),
      // ステータス
      isActive: boolean("isActive").default(true).notNull(),
      // メタデータ
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    invitationUses = mysqlTable("invitation_uses", {
      id: int("id").autoincrement().primaryKey(),
      invitationId: int("invitationId").notNull(),
      // 招待された人
      userId: int("userId"),
      displayName: varchar("displayName", { length: 255 }),
      // 参加情報
      participationId: int("participationId"),
      // メタデータ
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    challengeStats = mysqlTable("challenge_stats", {
      id: int("id").autoincrement().primaryKey(),
      challengeId: int("challengeId").notNull(),
      // 日時
      recordedAt: timestamp("recordedAt").defaultNow().notNull(),
      recordDate: varchar("recordDate", { length: 10 }).notNull(),
      // YYYY-MM-DD
      recordHour: int("recordHour").default(0).notNull(),
      // 0-23
      // 統計データ
      participantCount: int("participantCount").default(0).notNull(),
      totalContribution: int("totalContribution").default(0).notNull(),
      newParticipants: int("newParticipants").default(0).notNull(),
      // 地域別データ（JSON形式）
      prefectureData: text("prefectureData"),
      // JSON: { "東京都": 10, "大阪府": 5, ... }
      // メタデータ
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    achievements = mysqlTable("achievements", {
      id: int("id").autoincrement().primaryKey(),
      // アチーブメント情報
      name: varchar("name", { length: 100 }).notNull(),
      description: text("description"),
      iconUrl: text("iconUrl"),
      icon: varchar("icon", { length: 32 }).default("\u{1F3C6}").notNull(),
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
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    userAchievements = mysqlTable("user_achievements", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    collaborators = mysqlTable("collaborators", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    collaboratorInvitations = mysqlTable("collaborator_invitations", {
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
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    twitterFollowStatus = mysqlTable("twitter_follow_status", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    oauthPkceData = mysqlTable("oauth_pkce_data", {
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
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    participationCompanions = mysqlTable("participation_companions", {
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
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    challengeMembers = mysqlTable("challenge_members", {
      id: int("id").autoincrement().primaryKey(),
      challengeId: int("challengeId").notNull(),
      // メンバーの情報
      twitterUsername: varchar("twitterUsername", { length: 255 }).notNull(),
      twitterId: varchar("twitterId", { length: 64 }),
      displayName: varchar("displayName", { length: 255 }),
      profileImage: text("profileImage"),
      followersCount: int("followersCount").default(0),
      // 並び順
      sortOrder: int("sortOrder").default(0).notNull(),
      // メタデータ
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    twitterUserCache = mysqlTable("twitter_user_cache", {
      id: int("id").autoincrement().primaryKey(),
      // Twitterユーザー情報
      twitterUsername: varchar("twitterUsername", { length: 255 }).notNull().unique(),
      twitterId: varchar("twitterId", { length: 64 }),
      displayName: varchar("displayName", { length: 255 }),
      profileImage: text("profileImage"),
      followersCount: int("followersCount").default(0),
      description: text("description"),
      // キャッシュ有効期限（24時間）
      cachedAt: timestamp("cachedAt").defaultNow().notNull(),
      expiresAt: timestamp("expiresAt").notNull(),
      // メタデータ
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    ticketTransfers = mysqlTable("ticket_transfers", {
      id: int("id").autoincrement().primaryKey(),
      challengeId: int("challengeId").notNull(),
      // 譲渡者の情報
      userId: int("userId").notNull(),
      userName: varchar("userName", { length: 255 }).notNull(),
      userUsername: varchar("userUsername", { length: 255 }),
      // Xのユーザー名（DM用）
      userImage: text("userImage"),
      // 譲渡情報
      ticketCount: int("ticketCount").default(1).notNull(),
      priceType: mysqlEnum("priceType", ["face_value", "negotiable", "free"]).default("face_value").notNull(),
      comment: text("comment"),
      // ステータス
      status: mysqlEnum("status", ["available", "reserved", "completed", "cancelled"]).default("available").notNull(),
      // メタデータ
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    ticketWaitlist = mysqlTable("ticket_waitlist", {
      id: int("id").autoincrement().primaryKey(),
      challengeId: int("challengeId").notNull(),
      // 待機者の情報
      userId: int("userId").notNull(),
      userName: varchar("userName", { length: 255 }).notNull(),
      userUsername: varchar("userUsername", { length: 255 }),
      // Xのユーザー名（DM用）
      userImage: text("userImage"),
      // 希望枚数
      desiredCount: int("desiredCount").default(1).notNull(),
      // 通知設定
      notifyOnNew: boolean("notifyOnNew").default(true).notNull(),
      // ステータス
      isActive: boolean("isActive").default(true).notNull(),
      // メタデータ
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    favoriteArtists = mysqlTable("favorite_artists", {
      id: int("id").autoincrement().primaryKey(),
      // フォローする人
      userId: int("userId").notNull(),
      userTwitterId: varchar("userTwitterId", { length: 64 }),
      // お気に入りアーティスト（ホスト）のTwitter ID
      artistTwitterId: varchar("artistTwitterId", { length: 64 }).notNull(),
      artistName: varchar("artistName", { length: 255 }),
      artistUsername: varchar("artistUsername", { length: 255 }),
      artistProfileImage: text("artistProfileImage"),
      // 通知設定
      notifyNewChallenge: boolean("notifyNewChallenge").default(true).notNull(),
      // Expoプッシュトークン
      expoPushToken: text("expoPushToken"),
      // メタデータ
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  addToTicketWaitlist: () => addToTicketWaitlist,
  awardBadge: () => awardBadge,
  awardFollowerBadge: () => awardFollowerBadge,
  cancelParticipation: () => cancelParticipation,
  cancelTicketTransfer: () => cancelTicketTransfer,
  checkAndAwardBadges: () => checkAndAwardBadges,
  clearSearchHistoryForUser: () => clearSearchHistoryForUser,
  createAchievementPage: () => createAchievementPage,
  createBadge: () => createBadge,
  createCategory: () => createCategory,
  createChallengeTemplate: () => createChallengeTemplate,
  createCompanion: () => createCompanion,
  createCompanions: () => createCompanions,
  createEvent: () => createEvent,
  createInvitation: () => createInvitation,
  createNotification: () => createNotification,
  createParticipation: () => createParticipation,
  createReminder: () => createReminder,
  createTicketTransfer: () => createTicketTransfer,
  deactivateInvitation: () => deactivateInvitation,
  deleteCategory: () => deleteCategory,
  deleteChallengeTemplate: () => deleteChallengeTemplate,
  deleteCompanion: () => deleteCompanion,
  deleteCompanionsForParticipation: () => deleteCompanionsForParticipation,
  deleteEvent: () => deleteEvent,
  deleteParticipation: () => deleteParticipation,
  deleteReminder: () => deleteReminder,
  followUser: () => followUser,
  generateSlug: () => generateSlug,
  getAchievementPage: () => getAchievementPage,
  getAllBadges: () => getAllBadges,
  getAllCategories: () => getAllCategories,
  getAllEvents: () => getAllEvents,
  getAllUsers: () => getAllUsers,
  getBadgeById: () => getBadgeById,
  getCategoryById: () => getCategoryById,
  getCategoryBySlug: () => getCategoryBySlug,
  getChallengeAchievementRanking: () => getChallengeAchievementRanking,
  getChallengeForAI: () => getChallengeForAI,
  getChallengeTemplateById: () => getChallengeTemplateById,
  getChallengeTemplatesForUser: () => getChallengeTemplatesForUser,
  getChallengesByCategory: () => getChallengesByCategory,
  getCheerCountForParticipation: () => getCheerCountForParticipation,
  getCheersForChallenge: () => getCheersForChallenge,
  getCheersForParticipation: () => getCheersForParticipation,
  getCheersReceivedByUser: () => getCheersReceivedByUser,
  getCheersSentByUser: () => getCheersSentByUser,
  getCompanionInviteStats: () => getCompanionInviteStats,
  getCompanionsForChallenge: () => getCompanionsForChallenge,
  getCompanionsForParticipation: () => getCompanionsForParticipation,
  getContributionRanking: () => getContributionRanking,
  getConversation: () => getConversation,
  getConversationList: () => getConversationList,
  getDataIntegrityReport: () => getDataIntegrityReport,
  getDb: () => getDb,
  getDirectMessagesForUser: () => getDirectMessagesForUser,
  getEventById: () => getEventById,
  getEventsByHostTwitterId: () => getEventsByHostTwitterId,
  getEventsByHostUserId: () => getEventsByHostUserId,
  getFollowerCount: () => getFollowerCount,
  getFollowerIdsForUser: () => getFollowerIdsForUser,
  getFollowersForUser: () => getFollowersForUser,
  getFollowingCount: () => getFollowingCount,
  getFollowingForUser: () => getFollowingForUser,
  getGlobalContributionRanking: () => getGlobalContributionRanking,
  getHostRanking: () => getHostRanking,
  getInvitationByCode: () => getInvitationByCode,
  getInvitationStats: () => getInvitationStats,
  getInvitationUses: () => getInvitationUses,
  getInvitationsForChallenge: () => getInvitationsForChallenge,
  getInvitationsForUser: () => getInvitationsForUser,
  getNotificationSettings: () => getNotificationSettings,
  getNotificationsByUserId: () => getNotificationsByUserId,
  getOshikatsuStats: () => getOshikatsuStats,
  getParticipationById: () => getParticipationById,
  getParticipationCountByEventId: () => getParticipationCountByEventId,
  getParticipationsByEventId: () => getParticipationsByEventId,
  getParticipationsByPrefecture: () => getParticipationsByPrefecture,
  getParticipationsByPrefectureFilter: () => getParticipationsByPrefectureFilter,
  getParticipationsByUserId: () => getParticipationsByUserId,
  getPendingReminders: () => getPendingReminders,
  getPickedCommentsByChallengeId: () => getPickedCommentsByChallengeId,
  getPickedCommentsWithParticipation: () => getPickedCommentsWithParticipation,
  getPrefectureRanking: () => getPrefectureRanking,
  getPublicAchievementPages: () => getPublicAchievementPages,
  getPublicChallengeTemplates: () => getPublicChallengeTemplates,
  getRecommendedHosts: () => getRecommendedHosts,
  getRemindersForChallenge: () => getRemindersForChallenge,
  getRemindersForUser: () => getRemindersForUser,
  getSearchHistoryForUser: () => getSearchHistoryForUser,
  getTicketTransfersForChallenge: () => getTicketTransfersForChallenge,
  getTicketTransfersForUser: () => getTicketTransfersForUser,
  getTicketWaitlistForChallenge: () => getTicketWaitlistForChallenge,
  getTicketWaitlistForUser: () => getTicketWaitlistForUser,
  getTotalCompanionCountByEventId: () => getTotalCompanionCountByEventId,
  getUnreadMessageCount: () => getUnreadMessageCount,
  getUserBadges: () => getUserBadges,
  getUserBadgesWithDetails: () => getUserBadgesWithDetails,
  getUserById: () => getUserById,
  getUserByOpenId: () => getUserByOpenId,
  getUserPublicProfile: () => getUserPublicProfile,
  getUserRankingPosition: () => getUserRankingPosition,
  getUserReminderForChallenge: () => getUserReminderForChallenge,
  getUsersWithNotificationEnabled: () => getUsersWithNotificationEnabled,
  getWaitlistUsersForNotification: () => getWaitlistUsersForNotification,
  incrementInvitationUseCount: () => incrementInvitationUseCount,
  incrementTemplateUseCount: () => incrementTemplateUseCount,
  invalidateEventsCache: () => invalidateEventsCache,
  isCommentPicked: () => isCommentPicked,
  isFollowing: () => isFollowing,
  isUserInWaitlist: () => isUserInWaitlist,
  markAllMessagesAsRead: () => markAllMessagesAsRead,
  markAllNotificationsAsRead: () => markAllNotificationsAsRead,
  markCommentAsUsedInVideo: () => markCommentAsUsedInVideo,
  markMessageAsRead: () => markMessageAsRead,
  markNotificationAsRead: () => markNotificationAsRead,
  markReminderAsSent: () => markReminderAsSent,
  pickComment: () => pickComment,
  recalculateChallengeCurrentValues: () => recalculateChallengeCurrentValues,
  recordInvitationUse: () => recordInvitationUse,
  refreshAllChallengeSummaries: () => refreshAllChallengeSummaries,
  refreshChallengeSummary: () => refreshChallengeSummary,
  removeFromTicketWaitlist: () => removeFromTicketWaitlist,
  saveSearchHistory: () => saveSearchHistory,
  searchChallenges: () => searchChallenges,
  searchChallengesForAI: () => searchChallengesForAI,
  sendCheer: () => sendCheer,
  sendDirectMessage: () => sendDirectMessage,
  unfollowUser: () => unfollowUser,
  unpickComment: () => unpickComment,
  updateAchievementPage: () => updateAchievementPage,
  updateCategory: () => updateCategory,
  updateChallengeTemplate: () => updateChallengeTemplate,
  updateEvent: () => updateEvent,
  updateFollowNotification: () => updateFollowNotification,
  updateParticipation: () => updateParticipation,
  updateReminder: () => updateReminder,
  updateTicketTransferStatus: () => updateTicketTransferStatus,
  updateUserRole: () => updateUserRole,
  upsertNotificationSettings: () => upsertNotificationSettings,
  upsertUser: () => upsertUser
});
import { eq, desc, and, sql, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
function generateSlug(title) {
  const translations = {
    "\u751F\u8A95\u796D": "birthday",
    "\u30E9\u30A4\u30D6": "live",
    "\u30EF\u30F3\u30DE\u30F3": "oneman",
    "\u52D5\u54E1": "attendance",
    "\u30C1\u30E3\u30EC\u30F3\u30B8": "challenge",
    "\u30D5\u30A9\u30ED\u30EF\u30FC": "followers",
    "\u540C\u6642\u8996\u8074": "viewers",
    "\u914D\u4FE1": "stream",
    "\u30B0\u30EB\u30FC\u30D7": "group",
    "\u30BD\u30ED": "solo",
    "\u30D5\u30A7\u30B9": "fes",
    "\u5BFE\u30D0\u30F3": "taiban",
    "\u30D5\u30A1\u30F3\u30DF\u30FC\u30C6\u30A3\u30F3\u30B0": "fanmeeting",
    "\u30EA\u30EA\u30FC\u30B9": "release",
    "\u30A4\u30D9\u30F3\u30C8": "event",
    "\u4EBA": "",
    "\u4E07": "0000"
  };
  let slug = title.toLowerCase();
  for (const [jp, en] of Object.entries(translations)) {
    slug = slug.replace(new RegExp(jp, "g"), en);
  }
  const words = slug.match(/[a-z]+|\d+/g) || [];
  slug = words.join("-");
  slug = slug.replace(/-+/g, "-");
  slug = slug.replace(/^-|-$/g, "");
  if (!slug) {
    slug = `challenge-${Date.now()}`;
  }
  return slug;
}
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      let connectionUrl = process.env.DATABASE_URL;
      if (connectionUrl && !connectionUrl.includes("ssl=")) {
        const separator = connectionUrl.includes("?") ? "&" : "?";
        connectionUrl = `${connectionUrl}${separator}ssl={"rejectUnauthorized":true}`;
      }
      _db = drizzle(connectionUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.lastSignedIn));
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function updateUserRole(userId, role) {
  const db = await getDb();
  if (!db) return false;
  await db.update(users).set({ role }).where(eq(users.id, userId));
  return true;
}
async function getAllEvents() {
  const now = Date.now();
  if (eventsCache.data && now - eventsCache.timestamp < EVENTS_CACHE_TTL) {
    return eventsCache.data;
  }
  const db = await getDb();
  if (!db) return eventsCache.data ?? [];
  const result = await db.select().from(events).where(eq(events.isPublic, true)).orderBy(desc(events.eventDate));
  eventsCache = { data: result, timestamp: now };
  return result;
}
function invalidateEventsCache() {
  eventsCache = { data: null, timestamp: 0 };
}
async function getEventById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(events).where(eq(events.id, id));
  return result[0] || null;
}
async function getEventsByHostUserId(hostUserId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).where(eq(events.hostUserId, hostUserId)).orderBy(desc(events.eventDate));
}
async function getEventsByHostTwitterId(hostTwitterId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).where(eq(events.hostTwitterId, hostTwitterId)).orderBy(desc(events.eventDate));
}
async function createEvent(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
  const eventDate = data.eventDate ? new Date(data.eventDate).toISOString().slice(0, 19).replace("T", " ") : now;
  const slug = data.slug || generateSlug(data.title);
  const result = await db.execute(sql`
    INSERT INTO challenges (
      hostUserId, hostTwitterId, hostName, hostUsername, hostProfileImage, hostFollowersCount, hostDescription,
      title, slug, description, goalType, goalValue, goalUnit, currentValue,
      eventType, categoryId, eventDate, venue, prefecture,
      ticketPresale, ticketDoor, ticketUrl, externalUrl,
      status, isPublic, createdAt, updatedAt
    ) VALUES (
      ${data.hostUserId ?? null},
      ${data.hostTwitterId ?? null},
      ${data.hostName},
      ${data.hostUsername ?? null},
      ${data.hostProfileImage ?? null},
      ${data.hostFollowersCount ?? 0},
      ${data.hostDescription ?? null},
      ${data.title},
      ${slug},
      ${data.description ?? null},
      ${data.goalType ?? "attendance"},
      ${data.goalValue ?? 100},
      ${data.goalUnit ?? "\u4EBA"},
      ${data.currentValue ?? 0},
      ${data.eventType ?? "solo"},
      ${data.categoryId ?? null},
      ${eventDate},
      ${data.venue ?? null},
      ${data.prefecture ?? null},
      ${data.ticketPresale ?? null},
      ${data.ticketDoor ?? null},
      ${data.ticketUrl ?? null},
      ${data.externalUrl ?? null},
      ${data.status ?? "active"},
      ${data.isPublic ?? true},
      ${now},
      ${now}
    )
  `);
  invalidateEventsCache();
  return result[0].insertId;
}
async function updateEvent(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(events).set(data).where(eq(events.id, id));
  invalidateEventsCache();
}
async function deleteEvent(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(events).where(eq(events.id, id));
  invalidateEventsCache();
}
async function getParticipationsByEventId(eventId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(participations).where(eq(participations.challengeId, eventId)).orderBy(desc(participations.createdAt));
}
async function getParticipationsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(participations).where(eq(participations.userId, userId)).orderBy(desc(participations.createdAt));
}
async function getParticipationById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(participations).where(eq(participations.id, id));
  return result[0] || null;
}
async function createParticipation(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(participations).values(data);
  const participationId = result[0].insertId;
  if (data.challengeId) {
    const contribution = (data.contribution || 1) + (data.companionCount || 0);
    await db.update(challenges).set({ currentValue: sql`${challenges.currentValue} + ${contribution}` }).where(eq(challenges.id, data.challengeId));
    invalidateEventsCache();
  }
  return participationId;
}
async function updateParticipation(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(participations).set(data).where(eq(participations.id, id));
}
async function deleteParticipation(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const participation = await db.select().from(participations).where(eq(participations.id, id));
  const p = participation[0];
  await db.delete(participations).where(eq(participations.id, id));
  if (p && p.challengeId) {
    const contribution = (p.contribution || 1) + (p.companionCount || 0);
    await db.update(challenges).set({ currentValue: sql`GREATEST(${challenges.currentValue} - ${contribution}, 0)` }).where(eq(challenges.id, p.challengeId));
    invalidateEventsCache();
  }
}
async function getParticipationCountByEventId(eventId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(participations).where(eq(participations.challengeId, eventId));
  return result.length;
}
async function getTotalCompanionCountByEventId(eventId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(participations).where(eq(participations.challengeId, eventId));
  return result.reduce((sum, p) => sum + (p.contribution || 1), 0);
}
async function getParticipationsByPrefecture(challengeId) {
  const db = await getDb();
  if (!db) return {};
  const result = await db.select().from(participations).where(eq(participations.challengeId, challengeId));
  const prefectureMap = {};
  result.forEach((p) => {
    const pref = p.prefecture || "\u672A\u8A2D\u5B9A";
    prefectureMap[pref] = (prefectureMap[pref] || 0) + (p.contribution || 1);
  });
  return prefectureMap;
}
async function getContributionRanking(challengeId, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(participations).where(eq(participations.challengeId, challengeId)).orderBy(desc(participations.contribution));
  return result.slice(0, limit).map((p, index) => ({
    rank: index + 1,
    userId: p.userId,
    displayName: p.displayName,
    username: p.username,
    profileImage: p.profileImage,
    contribution: p.contribution || 1,
    followersCount: p.followersCount || 0,
    isAnonymous: p.isAnonymous
  }));
}
async function getNotificationSettings(userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId));
  return result[0] || null;
}
async function upsertNotificationSettings(userId, challengeId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(notificationSettings).where(and(eq(notificationSettings.userId, userId), eq(notificationSettings.challengeId, challengeId)));
  if (existing.length > 0) {
    await db.update(notificationSettings).set(data).where(and(eq(notificationSettings.userId, userId), eq(notificationSettings.challengeId, challengeId)));
  } else {
    await db.insert(notificationSettings).values({ userId, challengeId, ...data });
  }
}
async function getUsersWithNotificationEnabled(challengeId, notificationType) {
  const db = await getDb();
  if (!db) return [];
  const settingsList = await db.select().from(notificationSettings).where(eq(notificationSettings.challengeId, challengeId));
  return settingsList.filter((s) => {
    if (notificationType === "goal") return s.onGoalReached;
    if (notificationType === "milestone") return s.onMilestone25 || s.onMilestone50 || s.onMilestone75;
    if (notificationType === "participant") return s.onNewParticipant;
    return false;
  });
}
async function createNotification(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(data);
  return result[0].insertId;
}
async function getNotificationsByUserId(userId, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit);
}
async function markNotificationAsRead(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}
async function markAllNotificationsAsRead(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}
async function getAllBadges() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(badges);
}
async function getBadgeById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(badges).where(eq(badges.id, id));
  return result[0] || null;
}
async function createBadge(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(badges).values(data);
  return result[0].insertId;
}
async function getUserBadges(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userBadges).where(eq(userBadges.userId, userId)).orderBy(desc(userBadges.earnedAt));
}
async function getUserBadgesWithDetails(userId) {
  const db = await getDb();
  if (!db) return [];
  const userBadgeList = await db.select().from(userBadges).where(eq(userBadges.userId, userId));
  const badgeList = await db.select().from(badges);
  return userBadgeList.map((ub) => ({
    ...ub,
    badge: badgeList.find((b) => b.id === ub.badgeId)
  }));
}
async function awardBadge(userId, badgeId, challengeId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(userBadges).where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));
  if (existing.length > 0) return null;
  const result = await db.insert(userBadges).values({
    userId,
    badgeId,
    challengeId
  });
  return result[0].insertId;
}
async function checkAndAwardBadges(userId, challengeId, contribution) {
  const db = await getDb();
  if (!db) return [];
  const badgeList = await db.select().from(badges);
  const awardedBadges = [];
  const participationCount = await db.select().from(participations).where(eq(participations.userId, userId));
  for (const badge of badgeList) {
    let shouldAward = false;
    switch (badge.conditionType) {
      case "first_participation":
        shouldAward = participationCount.length === 1;
        break;
      case "contribution_5":
        shouldAward = contribution >= 5;
        break;
      case "contribution_10":
        shouldAward = contribution >= 10;
        break;
      case "contribution_20":
        shouldAward = contribution >= 20;
        break;
    }
    if (shouldAward) {
      const awarded = await awardBadge(userId, badge.id, challengeId);
      if (awarded) awardedBadges.push(badge);
    }
  }
  return awardedBadges;
}
async function awardFollowerBadge(userId) {
  const db = await getDb();
  if (!db) return null;
  let followerBadge = await db.select().from(badges).where(eq(badges.conditionType, "follower_badge"));
  if (followerBadge.length === 0) {
    const result = await db.insert(badges).values({
      name: "\u{1F49C} \u516C\u5F0F\u30D5\u30A9\u30ED\u30EF\u30FC",
      description: "\u30DB\u30B9\u30C8\u3092\u30D5\u30A9\u30ED\u30FC\u3057\u3066\u5FDC\u63F4\u3057\u3066\u3044\u307E\u3059\uFF01",
      type: "special",
      conditionType: "follower_badge"
    });
    followerBadge = await db.select().from(badges).where(eq(badges.id, result[0].insertId));
  }
  if (followerBadge.length === 0) return null;
  return awardBadge(userId, followerBadge[0].id);
}
async function getPickedCommentsByChallengeId(challengeId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pickedComments).where(eq(pickedComments.challengeId, challengeId)).orderBy(desc(pickedComments.pickedAt));
}
async function getPickedCommentsWithParticipation(challengeId) {
  const db = await getDb();
  if (!db) return [];
  const picked = await db.select().from(pickedComments).where(eq(pickedComments.challengeId, challengeId));
  const participationList = await db.select().from(participations).where(eq(participations.challengeId, challengeId));
  return picked.map((p) => ({
    ...p,
    participation: participationList.find((part) => part.id === p.participationId)
  }));
}
async function pickComment(participationId, challengeId, pickedBy, reason) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(pickedComments).where(eq(pickedComments.participationId, participationId));
  if (existing.length > 0) return null;
  const result = await db.insert(pickedComments).values({
    participationId,
    challengeId,
    pickedBy,
    reason
  });
  return result[0].insertId;
}
async function unpickComment(participationId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(pickedComments).where(eq(pickedComments.participationId, participationId));
}
async function markCommentAsUsedInVideo(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(pickedComments).set({ isUsedInVideo: true }).where(eq(pickedComments.id, id));
}
async function isCommentPicked(participationId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(pickedComments).where(eq(pickedComments.participationId, participationId));
  return result.length > 0;
}
async function getPrefectureRanking(challengeId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(participations).where(eq(participations.challengeId, challengeId));
  const prefectureMap = {};
  result.forEach((p) => {
    const pref = p.prefecture || "\u672A\u8A2D\u5B9A";
    if (!prefectureMap[pref]) {
      prefectureMap[pref] = { count: 0, contribution: 0 };
    }
    prefectureMap[pref].count += 1;
    prefectureMap[pref].contribution += p.contribution || 1;
  });
  return Object.entries(prefectureMap).map(([prefecture, data]) => ({
    prefecture,
    count: data.count,
    contribution: data.contribution
  })).sort((a, b) => b.contribution - a.contribution);
}
async function getParticipationsByPrefectureFilter(challengeId, prefecture) {
  const db = await getDb();
  if (!db) return [];
  if (prefecture === "all") {
    return db.select().from(participations).where(eq(participations.challengeId, challengeId)).orderBy(desc(participations.createdAt));
  }
  return db.select().from(participations).where(and(eq(participations.challengeId, challengeId), eq(participations.prefecture, prefecture))).orderBy(desc(participations.createdAt));
}
async function sendCheer(cheer) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(cheers).values(cheer);
  return result[0].insertId;
}
async function getCheersForParticipation(participationId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cheers).where(eq(cheers.toParticipationId, participationId)).orderBy(desc(cheers.createdAt));
}
async function getCheersForChallenge(challengeId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cheers).where(eq(cheers.challengeId, challengeId)).orderBy(desc(cheers.createdAt));
}
async function getCheerCountForParticipation(participationId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql`count(*)` }).from(cheers).where(eq(cheers.toParticipationId, participationId));
  return result[0]?.count || 0;
}
async function getCheersReceivedByUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cheers).where(eq(cheers.toUserId, userId)).orderBy(desc(cheers.createdAt));
}
async function getCheersSentByUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cheers).where(eq(cheers.fromUserId, userId)).orderBy(desc(cheers.createdAt));
}
async function createAchievementPage(page) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(achievementPages).values(page);
  return result[0].insertId;
}
async function getAchievementPage(challengeId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(achievementPages).where(eq(achievementPages.challengeId, challengeId));
  return result[0] || null;
}
async function updateAchievementPage(challengeId, updates) {
  const db = await getDb();
  if (!db) return;
  await db.update(achievementPages).set(updates).where(eq(achievementPages.challengeId, challengeId));
}
async function getPublicAchievementPages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(achievementPages).where(eq(achievementPages.isPublic, true)).orderBy(desc(achievementPages.achievedAt));
}
async function createReminder(reminder) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(reminders).values(reminder);
  return result[0].insertId;
}
async function getRemindersForUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reminders).where(eq(reminders.userId, userId)).orderBy(desc(reminders.createdAt));
}
async function getRemindersForChallenge(challengeId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reminders).where(eq(reminders.challengeId, challengeId)).orderBy(desc(reminders.createdAt));
}
async function getUserReminderForChallenge(userId, challengeId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(reminders).where(and(eq(reminders.userId, userId), eq(reminders.challengeId, challengeId)));
  return result[0] || null;
}
async function updateReminder(id, updates) {
  const db = await getDb();
  if (!db) return;
  await db.update(reminders).set(updates).where(eq(reminders.id, id));
}
async function deleteReminder(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(reminders).where(eq(reminders.id, id));
}
async function getPendingReminders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reminders).where(eq(reminders.isSent, false));
}
async function markReminderAsSent(id) {
  const db = await getDb();
  if (!db) return;
  await db.update(reminders).set({ isSent: true, sentAt: /* @__PURE__ */ new Date() }).where(eq(reminders.id, id));
}
async function sendDirectMessage(dm) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(directMessages).values(dm);
  return result[0].insertId;
}
async function getDirectMessagesForUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(directMessages).where(sql`${directMessages.fromUserId} = ${userId} OR ${directMessages.toUserId} = ${userId}`).orderBy(desc(directMessages.createdAt));
}
async function getConversation(userId1, userId2, challengeId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(directMessages).where(and(
    eq(directMessages.challengeId, challengeId),
    sql`((${directMessages.fromUserId} = ${userId1} AND ${directMessages.toUserId} = ${userId2}) OR (${directMessages.fromUserId} = ${userId2} AND ${directMessages.toUserId} = ${userId1}))`
  )).orderBy(directMessages.createdAt);
}
async function getUnreadMessageCount(userId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql`count(*)` }).from(directMessages).where(and(eq(directMessages.toUserId, userId), eq(directMessages.isRead, false)));
  return result[0]?.count || 0;
}
async function markMessageAsRead(id) {
  const db = await getDb();
  if (!db) return;
  await db.update(directMessages).set({ isRead: true, readAt: /* @__PURE__ */ new Date() }).where(eq(directMessages.id, id));
}
async function markAllMessagesAsRead(userId, fromUserId) {
  const db = await getDb();
  if (!db) return;
  await db.update(directMessages).set({ isRead: true, readAt: /* @__PURE__ */ new Date() }).where(and(eq(directMessages.toUserId, userId), eq(directMessages.fromUserId, fromUserId)));
}
async function getConversationList(userId) {
  const db = await getDb();
  if (!db) return [];
  const messages = await db.select().from(directMessages).where(sql`${directMessages.fromUserId} = ${userId} OR ${directMessages.toUserId} = ${userId}`).orderBy(desc(directMessages.createdAt));
  const conversationMap = /* @__PURE__ */ new Map();
  for (const msg of messages) {
    const partnerId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
    const key = `${partnerId}-${msg.challengeId}`;
    if (!conversationMap.has(key)) {
      conversationMap.set(key, msg);
    }
  }
  return Array.from(conversationMap.values());
}
async function createChallengeTemplate(template) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(challengeTemplates).values(template);
  return result[0].insertId;
}
async function getChallengeTemplatesForUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(challengeTemplates).where(eq(challengeTemplates.userId, userId)).orderBy(desc(challengeTemplates.createdAt));
}
async function getPublicChallengeTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(challengeTemplates).where(eq(challengeTemplates.isPublic, true)).orderBy(desc(challengeTemplates.useCount));
}
async function getChallengeTemplateById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(challengeTemplates).where(eq(challengeTemplates.id, id));
  return result[0] || null;
}
async function updateChallengeTemplate(id, updates) {
  const db = await getDb();
  if (!db) return;
  await db.update(challengeTemplates).set(updates).where(eq(challengeTemplates.id, id));
}
async function deleteChallengeTemplate(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(challengeTemplates).where(eq(challengeTemplates.id, id));
}
async function incrementTemplateUseCount(id) {
  const db = await getDb();
  if (!db) return;
  await db.update(challengeTemplates).set({ useCount: sql`${challengeTemplates.useCount} + 1` }).where(eq(challengeTemplates.id, id));
}
async function searchChallenges(query) {
  const db = await getDb();
  if (!db) return [];
  const searchTerm = `%${query}%`;
  return db.select().from(challenges).where(sql`${challenges.title} LIKE ${searchTerm} OR ${challenges.hostName} LIKE ${searchTerm} OR ${challenges.venue} LIKE ${searchTerm} OR ${challenges.description} LIKE ${searchTerm}`).orderBy(desc(challenges.createdAt));
}
async function saveSearchHistory(history) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(searchHistory).values(history);
  return result[0].insertId;
}
async function getSearchHistoryForUser(userId, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(searchHistory).where(eq(searchHistory.userId, userId)).orderBy(desc(searchHistory.createdAt)).limit(limit);
}
async function clearSearchHistoryForUser(userId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(searchHistory).where(eq(searchHistory.userId, userId));
}
async function followUser(follow) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(follows).where(and(eq(follows.followerId, follow.followerId), eq(follows.followeeId, follow.followeeId)));
  if (existing.length > 0) return null;
  const result = await db.insert(follows).values(follow);
  await awardFollowerBadge(follow.followerId);
  return result[0].insertId;
}
async function unfollowUser(followerId, followeeId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followeeId, followeeId)));
}
async function getFollowersForUser(userId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(follows).where(eq(follows.followeeId, userId)).orderBy(desc(follows.createdAt));
  const followersWithImages = await Promise.all(result.map(async (f) => {
    const latestParticipation = await db.select({ profileImage: participations.profileImage }).from(participations).where(eq(participations.userId, f.followerId)).orderBy(desc(participations.createdAt)).limit(1);
    return {
      ...f,
      followerImage: latestParticipation[0]?.profileImage || null
    };
  }));
  return followersWithImages;
}
async function getFollowingForUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(follows).where(eq(follows.followerId, userId)).orderBy(desc(follows.createdAt));
}
async function isFollowing(followerId, followeeId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(follows).where(and(eq(follows.followerId, followerId), eq(follows.followeeId, followeeId)));
  return result.length > 0;
}
async function getFollowerCount(userId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql`count(*)` }).from(follows).where(eq(follows.followeeId, userId));
  return result[0]?.count || 0;
}
async function getFollowingCount(userId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql`count(*)` }).from(follows).where(eq(follows.followerId, userId));
  return result[0]?.count || 0;
}
async function getFollowerIdsForUser(userId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({ followerId: follows.followerId }).from(follows).where(eq(follows.followeeId, userId));
  return result.map((r) => r.followerId);
}
async function updateFollowNotification(followerId, followeeId, notify) {
  const db = await getDb();
  if (!db) return;
  await db.update(follows).set({ notifyNewChallenge: notify }).where(and(eq(follows.followerId, followerId), eq(follows.followeeId, followeeId)));
}
async function getGlobalContributionRanking(period = "all", limit = 50) {
  const db = await getDb();
  if (!db) return [];
  let dateFilter = sql`1=1`;
  const now = /* @__PURE__ */ new Date();
  if (period === "weekly") {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
    dateFilter = sql`${participations.createdAt} >= ${weekAgo}`;
  } else if (period === "monthly") {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
    dateFilter = sql`${participations.createdAt} >= ${monthAgo}`;
  }
  const result = await db.select({
    userId: participations.userId,
    userName: participations.username,
    userImage: participations.profileImage,
    totalContribution: sql`SUM(${participations.contribution})`,
    participationCount: sql`COUNT(*)`
  }).from(participations).where(dateFilter).groupBy(participations.userId, participations.username, participations.profileImage).orderBy(sql`SUM(${participations.contribution}) DESC`).limit(limit);
  return result;
}
async function getChallengeAchievementRanking(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    id: challenges.id,
    title: challenges.title,
    hostName: challenges.hostName,
    goalValue: challenges.goalValue,
    currentValue: challenges.currentValue,
    achievementRate: sql`(${challenges.currentValue} / ${challenges.goalValue}) * 100`,
    eventDate: challenges.eventDate
  }).from(challenges).where(sql`${challenges.goalValue} > 0`).orderBy(sql`(${challenges.currentValue} / ${challenges.goalValue}) DESC`).limit(limit);
  return result;
}
async function getHostRanking(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    hostUserId: challenges.hostUserId,
    hostName: challenges.hostName,
    hostProfileImage: challenges.hostProfileImage,
    challengeCount: sql`COUNT(*)`,
    totalParticipants: sql`SUM(${challenges.currentValue})`,
    avgAchievementRate: sql`AVG((${challenges.currentValue} / ${challenges.goalValue}) * 100)`
  }).from(challenges).where(sql`${challenges.goalValue} > 0`).groupBy(challenges.hostUserId, challenges.hostName, challenges.hostProfileImage).orderBy(sql`AVG((${challenges.currentValue} / ${challenges.goalValue}) * 100) DESC`).limit(limit);
  return result;
}
async function getUserRankingPosition(userId, period = "all") {
  const db = await getDb();
  if (!db) return null;
  const ranking = await getGlobalContributionRanking(period, 1e3);
  const position = ranking.findIndex((r) => r.userId === userId);
  if (position === -1) return null;
  return {
    position: position + 1,
    totalContribution: ranking[position].totalContribution,
    participationCount: ranking[position].participationCount
  };
}
async function getAllCategories() {
  const now = Date.now();
  if (categoriesCache.data && now - categoriesCache.timestamp < CATEGORIES_CACHE_TTL) {
    return categoriesCache.data;
  }
  const db = await getDb();
  if (!db) return categoriesCache.data ?? [];
  const result = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder);
  categoriesCache = { data: result, timestamp: now };
  return result;
}
async function getCategoryById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(categories).where(eq(categories.id, id));
  return result[0] || null;
}
async function getCategoryBySlug(slug) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(categories).where(eq(categories.slug, slug));
  return result[0] || null;
}
async function createCategory(category) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(categories).values(category);
  return result[0].insertId;
}
async function getChallengesByCategory(categoryId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(challenges).where(eq(challenges.categoryId, categoryId)).orderBy(desc(challenges.eventDate));
}
async function updateCategory(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(categories).set(data).where(eq(categories.id, id));
  return getCategoryById(id);
}
async function deleteCategory(id) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(categories).where(eq(categories.id, id));
  return true;
}
async function createInvitation(invitation) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(invitations).values(invitation);
  return result[0].insertId;
}
async function getInvitationByCode(code) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(invitations).where(eq(invitations.code, code));
  return result[0] || null;
}
async function getInvitationsForChallenge(challengeId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invitations).where(eq(invitations.challengeId, challengeId)).orderBy(desc(invitations.createdAt));
}
async function getInvitationsForUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invitations).where(eq(invitations.inviterId, userId)).orderBy(desc(invitations.createdAt));
}
async function incrementInvitationUseCount(code) {
  const db = await getDb();
  if (!db) return;
  await db.update(invitations).set({ useCount: sql`${invitations.useCount} + 1` }).where(eq(invitations.code, code));
}
async function deactivateInvitation(id) {
  const db = await getDb();
  if (!db) return;
  await db.update(invitations).set({ isActive: false }).where(eq(invitations.id, id));
}
async function recordInvitationUse(use) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(invitationUses).values(use);
  return result[0].insertId;
}
async function getInvitationUses(invitationId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invitationUses).where(eq(invitationUses.invitationId, invitationId)).orderBy(desc(invitationUses.createdAt));
}
async function getInvitationStats(invitationId) {
  const db = await getDb();
  if (!db) return { useCount: 0, participationCount: 0 };
  const uses = await db.select({ count: sql`count(*)` }).from(invitationUses).where(eq(invitationUses.invitationId, invitationId));
  const participations_count = await db.select({ count: sql`count(*)` }).from(invitationUses).where(and(eq(invitationUses.invitationId, invitationId), sql`${invitationUses.participationId} IS NOT NULL`));
  return {
    useCount: uses[0]?.count || 0,
    participationCount: participations_count[0]?.count || 0
  };
}
async function getUserPublicProfile(userId) {
  const db = await getDb();
  if (!db) return null;
  const userResult = await db.select().from(users).where(eq(users.id, userId));
  if (userResult.length === 0) return null;
  const user = userResult[0];
  const participationList = await db.select({
    id: participations.id,
    challengeId: participations.challengeId,
    displayName: participations.displayName,
    username: participations.username,
    profileImage: participations.profileImage,
    message: participations.message,
    contribution: participations.contribution,
    prefecture: participations.prefecture,
    createdAt: participations.createdAt,
    // チャレンジ情報
    challengeTitle: challenges.title,
    challengeEventDate: challenges.eventDate,
    challengeVenue: challenges.venue,
    challengeGoalType: challenges.goalType,
    challengeHostName: challenges.hostName,
    challengeHostUsername: challenges.hostUsername,
    challengeCategoryId: challenges.categoryId
  }).from(participations).innerJoin(challenges, eq(participations.challengeId, challenges.id)).where(eq(participations.userId, userId)).orderBy(desc(participations.createdAt));
  const badgeList = await db.select().from(userBadges).where(eq(userBadges.userId, userId)).orderBy(desc(userBadges.earnedAt));
  const badgeIds = badgeList.map((b) => b.badgeId);
  const badgeDetails = badgeIds.length > 0 ? await db.select().from(badges).where(sql`${badges.id} IN (${badgeIds.join(",")})`) : [];
  const totalContribution = participationList.reduce((sum, p) => sum + (p.contribution || 1), 0);
  const challengeIds = [...new Set(participationList.map((p) => p.challengeId))];
  const categoryStats = {};
  participationList.forEach((p) => {
    const categoryId = p.challengeCategoryId || 0;
    categoryStats[categoryId] = (categoryStats[categoryId] || 0) + 1;
  });
  const hostedChallenges = await db.select({ count: sql`count(*)` }).from(challenges).where(eq(challenges.hostUserId, userId));
  const latestParticipation = participationList[0];
  return {
    user: {
      id: user.id,
      name: user.name || latestParticipation?.displayName || "\u30E6\u30FC\u30B6\u30FC",
      username: latestParticipation?.username || null,
      profileImage: latestParticipation?.profileImage || null,
      createdAt: user.createdAt
    },
    stats: {
      totalContribution,
      participationCount: participationList.length,
      challengeCount: challengeIds.length,
      hostedCount: hostedChallenges[0]?.count || 0,
      badgeCount: badgeList.length
    },
    categoryStats,
    participations: participationList,
    badges: badgeDetails
  };
}
async function getRecommendedHosts(userId, categoryId, limit = 5) {
  const db = await getDb();
  if (!db) return [];
  const allChallenges = await db.select({
    hostUserId: challenges.hostUserId,
    hostName: challenges.hostName,
    hostUsername: challenges.hostUsername,
    hostProfileImage: challenges.hostProfileImage,
    categoryId: challenges.categoryId
  }).from(challenges).where(challenges.hostUserId ? ne(challenges.hostUserId, userId || 0) : void 0).orderBy(desc(challenges.eventDate));
  const hostMap = /* @__PURE__ */ new Map();
  for (const c of allChallenges) {
    if (!c.hostUserId) continue;
    if (userId && c.hostUserId === userId) continue;
    const existing = hostMap.get(c.hostUserId);
    if (existing) {
      existing.challengeCount++;
      if (c.categoryId) existing.categoryIds.add(c.categoryId);
    } else {
      hostMap.set(c.hostUserId, {
        hostUserId: c.hostUserId,
        hostName: c.hostName,
        hostUsername: c.hostUsername,
        hostProfileImage: c.hostProfileImage,
        challengeCount: 1,
        categoryIds: c.categoryId ? /* @__PURE__ */ new Set([c.categoryId]) : /* @__PURE__ */ new Set()
      });
    }
  }
  let hosts = Array.from(hostMap.values());
  if (categoryId) {
    hosts.sort((a, b) => {
      const aHasCategory = a.categoryIds.has(categoryId) ? 1 : 0;
      const bHasCategory = b.categoryIds.has(categoryId) ? 1 : 0;
      if (aHasCategory !== bHasCategory) return bHasCategory - aHasCategory;
      return b.challengeCount - a.challengeCount;
    });
  } else {
    hosts.sort((a, b) => b.challengeCount - a.challengeCount);
  }
  return hosts.slice(0, limit).map((h) => ({
    userId: h.hostUserId,
    name: h.hostName,
    username: h.hostUsername,
    profileImage: h.hostProfileImage,
    challengeCount: h.challengeCount
  }));
}
async function createCompanion(companion) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(participationCompanions).values(companion);
  return result[0].insertId;
}
async function createCompanions(companions) {
  const db = await getDb();
  if (!db) return [];
  if (companions.length === 0) return [];
  const result = await db.insert(participationCompanions).values(companions);
  return result;
}
async function getCompanionsForParticipation(participationId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(participationCompanions).where(eq(participationCompanions.participationId, participationId)).orderBy(participationCompanions.createdAt);
}
async function getCompanionsForChallenge(challengeId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(participationCompanions).where(eq(participationCompanions.challengeId, challengeId)).orderBy(desc(participationCompanions.createdAt));
}
async function deleteCompanion(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(participationCompanions).where(eq(participationCompanions.id, id));
}
async function deleteCompanionsForParticipation(participationId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(participationCompanions).where(eq(participationCompanions.participationId, participationId));
}
async function getCompanionInviteStats(userId) {
  const db = await getDb();
  if (!db) return { totalInvited: 0, companions: [] };
  const companions = await db.select().from(participationCompanions).where(eq(participationCompanions.invitedByUserId, userId)).orderBy(desc(participationCompanions.createdAt));
  return {
    totalInvited: companions.length,
    companions
  };
}
async function refreshChallengeSummary(challengeId) {
  const db = await getDb();
  if (!db) return;
  try {
    const participationData = await db.select({
      prefecture: participations.prefecture,
      count: sql`COUNT(*)`
    }).from(participations).where(eq(participations.challengeId, challengeId)).groupBy(participations.prefecture);
    const regionSummary = {};
    let totalCount = 0;
    participationData.forEach((row) => {
      if (row.prefecture) {
        regionSummary[row.prefecture] = row.count;
      }
      totalCount += row.count;
    });
    const topContributors = await db.select({
      name: participations.displayName,
      contribution: participations.contribution,
      message: participations.message
    }).from(participations).where(eq(participations.challengeId, challengeId)).orderBy(desc(participations.contribution)).limit(5);
    const recentMessages = await db.select({
      name: participations.displayName,
      message: participations.message,
      createdAt: participations.createdAt
    }).from(participations).where(and(
      eq(participations.challengeId, challengeId),
      sql`${participations.message} IS NOT NULL AND ${participations.message} != ''`
    )).orderBy(desc(participations.createdAt)).limit(5);
    let hotRegion;
    let maxCount = 0;
    Object.entries(regionSummary).forEach(([region, count]) => {
      if (count > maxCount) {
        maxCount = count;
        hotRegion = region;
      }
    });
    const participantSummary = {
      totalCount,
      topContributors: topContributors.map((c2) => ({
        name: c2.name,
        contribution: c2.contribution,
        message: c2.message || void 0
      })),
      recentMessages: recentMessages.map((m) => ({
        name: m.name,
        message: m.message || "",
        createdAt: m.createdAt.toISOString()
      })),
      hotRegion
    };
    const challenge = await db.select().from(challenges).where(eq(challenges.id, challengeId)).limit(1);
    if (!challenge[0]) return;
    const c = challenge[0];
    const progressPercent = c.goalValue > 0 ? Math.round(c.currentValue / c.goalValue * 100) : 0;
    const daysUntilEvent = Math.ceil((new Date(c.eventDate).getTime() - Date.now()) / (1e3 * 60 * 60 * 24));
    let aiSummary = `\u3010${c.title}\u3011${c.hostName}\u4E3B\u50AC\u306E${c.eventType === "group" ? "\u30B0\u30EB\u30FC\u30D7" : "\u30BD\u30ED"}\u30A4\u30D9\u30F3\u30C8\u3002`;
    aiSummary += `\u76EE\u6A19${c.goalValue}${c.goalUnit}\u306B\u5BFE\u3057\u3066\u73FE\u5728${c.currentValue}${c.goalUnit}\uFF08\u9054\u6210\u7387${progressPercent}%\uFF09\u3002`;
    if (daysUntilEvent > 0) {
      aiSummary += `\u958B\u50AC\u307E\u3067\u6B8B\u308A${daysUntilEvent}\u65E5\u3002`;
    } else if (daysUntilEvent === 0) {
      aiSummary += `\u672C\u65E5\u958B\u50AC\uFF01`;
    } else {
      aiSummary += `\u30A4\u30D9\u30F3\u30C8\u7D42\u4E86\u6E08\u307F\u3002`;
    }
    if (totalCount > 0) {
      aiSummary += `${totalCount}\u540D\u304C\u53C2\u52A0\u8868\u660E\u3002`;
      if (hotRegion) {
        aiSummary += `${hotRegion}\u304B\u3089\u306E\u53C2\u52A0\u304C\u6700\u591A\uFF08${regionSummary[hotRegion]}\u540D\uFF09\u3002`;
      }
    }
    if (recentMessages.length > 0) {
      aiSummary += `\u6700\u65B0\u306E\u5FDC\u63F4\uFF1A\u300C${recentMessages[0].message}\u300D\uFF08${recentMessages[0].name}\uFF09`;
    }
    const intentTags = [];
    intentTags.push(c.eventType === "group" ? "\u30B0\u30EB\u30FC\u30D7" : "\u30BD\u30ED");
    intentTags.push(c.goalType);
    if (progressPercent >= 100) intentTags.push("\u9054\u6210\u6E08\u307F");
    else if (progressPercent >= 80) intentTags.push("\u3082\u3046\u3059\u3050\u9054\u6210");
    else if (progressPercent >= 50) intentTags.push("\u9806\u8ABF");
    else intentTags.push("\u5FDC\u63F4\u52DF\u96C6\u4E2D");
    if (daysUntilEvent <= 7 && daysUntilEvent > 0) intentTags.push("\u76F4\u524D");
    if (daysUntilEvent === 0) intentTags.push("\u672C\u65E5\u958B\u50AC");
    if (hotRegion) intentTags.push(hotRegion);
    await db.update(challenges).set({
      aiSummary,
      intentTags,
      regionSummary,
      participantSummary,
      aiSummaryUpdatedAt: /* @__PURE__ */ new Date()
    }).where(eq(challenges.id, challengeId));
  } catch (error) {
    console.error("[AI Summary] Failed to refresh challenge summary:", error);
  }
}
async function getChallengeForAI(challengeId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(challenges).where(eq(challenges.id, challengeId)).limit(1);
  if (!result[0]) return null;
  const c = result[0];
  const summaryAge = c.aiSummaryUpdatedAt ? Date.now() - new Date(c.aiSummaryUpdatedAt).getTime() : Infinity;
  if (summaryAge > 5 * 60 * 1e3) {
    refreshChallengeSummary(challengeId).catch(console.error);
  }
  return {
    // 基本情報
    id: c.id,
    title: c.title,
    description: c.description,
    hostName: c.hostName,
    hostUsername: c.hostUsername,
    hostProfileImage: c.hostProfileImage,
    eventDate: c.eventDate,
    venue: c.venue,
    prefecture: c.prefecture,
    eventType: c.eventType,
    // 進捗情報
    goalType: c.goalType,
    goalValue: c.goalValue,
    goalUnit: c.goalUnit,
    currentValue: c.currentValue,
    progressPercent: c.goalValue > 0 ? Math.round(c.currentValue / c.goalValue * 100) : 0,
    // AI向け非正規化データ（1ホップで取得可能）
    aiSummary: c.aiSummary,
    intentTags: c.intentTags,
    regionSummary: c.regionSummary,
    participantSummary: c.participantSummary,
    aiSummaryUpdatedAt: c.aiSummaryUpdatedAt
  };
}
async function searchChallengesForAI(tags, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  const allChallenges = await db.select().from(challenges).where(eq(challenges.isPublic, true)).limit(100);
  const scored = allChallenges.map((c) => {
    const challengeTags = c.intentTags || [];
    const matchCount = tags.filter((t2) => challengeTags.includes(t2)).length;
    return { challenge: c, score: matchCount };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => ({
    id: s.challenge.id,
    title: s.challenge.title,
    hostName: s.challenge.hostName,
    aiSummary: s.challenge.aiSummary,
    intentTags: s.challenge.intentTags,
    matchScore: s.score,
    progressPercent: s.challenge.goalValue > 0 ? Math.round(s.challenge.currentValue / s.challenge.goalValue * 100) : 0
  }));
}
async function refreshAllChallengeSummaries() {
  const db = await getDb();
  if (!db) return { updated: 0 };
  const allChallenges = await db.select({ id: challenges.id }).from(challenges);
  let updated = 0;
  for (const c of allChallenges) {
    try {
      await refreshChallengeSummary(c.id);
      updated++;
    } catch (error) {
      console.error(`[AI Summary] Failed to update challenge ${c.id}:`, error);
    }
  }
  return { updated, total: allChallenges.length };
}
async function createTicketTransfer(transfer) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(ticketTransfers).values(transfer);
  return result[0].insertId;
}
async function getTicketTransfersForChallenge(challengeId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ticketTransfers).where(and(
    eq(ticketTransfers.challengeId, challengeId),
    eq(ticketTransfers.status, "available")
  )).orderBy(desc(ticketTransfers.createdAt));
}
async function getTicketTransfersForUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ticketTransfers).where(eq(ticketTransfers.userId, userId)).orderBy(desc(ticketTransfers.createdAt));
}
async function updateTicketTransferStatus(id, status) {
  const db = await getDb();
  if (!db) return;
  await db.update(ticketTransfers).set({ status }).where(eq(ticketTransfers.id, id));
}
async function cancelTicketTransfer(id, userId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.update(ticketTransfers).set({ status: "cancelled" }).where(and(eq(ticketTransfers.id, id), eq(ticketTransfers.userId, userId)));
  return true;
}
async function addToTicketWaitlist(waitlist) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(ticketWaitlist).where(and(
    eq(ticketWaitlist.challengeId, waitlist.challengeId),
    eq(ticketWaitlist.userId, waitlist.userId),
    eq(ticketWaitlist.isActive, true)
  )).limit(1);
  if (existing.length > 0) {
    return existing[0].id;
  }
  const result = await db.insert(ticketWaitlist).values(waitlist);
  return result[0].insertId;
}
async function removeFromTicketWaitlist(challengeId, userId) {
  const db = await getDb();
  if (!db) return false;
  await db.update(ticketWaitlist).set({ isActive: false }).where(and(
    eq(ticketWaitlist.challengeId, challengeId),
    eq(ticketWaitlist.userId, userId)
  ));
  return true;
}
async function getTicketWaitlistForChallenge(challengeId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ticketWaitlist).where(and(
    eq(ticketWaitlist.challengeId, challengeId),
    eq(ticketWaitlist.isActive, true)
  )).orderBy(ticketWaitlist.createdAt);
}
async function getTicketWaitlistForUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ticketWaitlist).where(and(
    eq(ticketWaitlist.userId, userId),
    eq(ticketWaitlist.isActive, true)
  )).orderBy(desc(ticketWaitlist.createdAt));
}
async function isUserInWaitlist(challengeId, userId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(ticketWaitlist).where(and(
    eq(ticketWaitlist.challengeId, challengeId),
    eq(ticketWaitlist.userId, userId),
    eq(ticketWaitlist.isActive, true)
  )).limit(1);
  return result.length > 0;
}
async function getWaitlistUsersForNotification(challengeId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ticketWaitlist).where(and(
    eq(ticketWaitlist.challengeId, challengeId),
    eq(ticketWaitlist.isActive, true),
    eq(ticketWaitlist.notifyOnNew, true)
  ));
}
async function cancelParticipation(participationId, userId) {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };
  const participation = await db.select().from(participations).where(and(
    eq(participations.id, participationId),
    eq(participations.userId, userId)
  )).limit(1);
  if (participation.length === 0) {
    return { success: false, error: "Participation not found" };
  }
  const p = participation[0];
  await db.delete(participations).where(eq(participations.id, participationId));
  await db.delete(participationCompanions).where(eq(participationCompanions.participationId, participationId));
  await db.update(challenges).set({ currentValue: sql`${challenges.currentValue} - ${p.contribution}` }).where(eq(challenges.id, p.challengeId));
  return { success: true, challengeId: p.challengeId, contribution: p.contribution };
}
async function getOshikatsuStats(userId, twitterId) {
  const db = await getDb();
  if (!db) return null;
  if (!userId && !twitterId) return null;
  let participationList;
  if (userId) {
    participationList = await db.select({
      id: participations.id,
      challengeId: participations.challengeId,
      contribution: participations.contribution,
      createdAt: participations.createdAt
    }).from(participations).where(eq(participations.userId, userId)).orderBy(desc(participations.createdAt)).limit(20);
  } else if (twitterId) {
    participationList = await db.select({
      id: participations.id,
      challengeId: participations.challengeId,
      contribution: participations.contribution,
      createdAt: participations.createdAt
    }).from(participations).where(eq(participations.twitterId, twitterId)).orderBy(desc(participations.createdAt)).limit(20);
  } else {
    return null;
  }
  if (participationList.length === 0) {
    return {
      totalParticipations: 0,
      totalContribution: 0,
      recentChallenges: []
    };
  }
  const totalParticipations = participationList.length;
  const totalContribution = participationList.reduce((sum, p) => sum + (p.contribution || 1), 0);
  const challengeIds = [...new Set(participationList.map((p) => p.challengeId))];
  const challengeList = await db.select({
    id: challenges.id,
    title: challenges.title,
    hostName: challenges.hostName
  }).from(challenges).where(sql`${challenges.id} IN (${sql.join(challengeIds.map((id) => sql`${id}`), sql`, `)})`);
  const challengeMap = new Map(challengeList.map((c) => [c.id, c]));
  const recentChallenges = participationList.slice(0, 5).map((p) => {
    const challenge = challengeMap.get(p.challengeId);
    return {
      id: p.challengeId,
      title: challenge?.title || "\u4E0D\u660E\u306A\u30C1\u30E3\u30EC\u30F3\u30B8",
      targetName: challenge?.hostName || "",
      participatedAt: p.createdAt.toISOString()
    };
  });
  return {
    totalParticipations,
    totalContribution,
    recentChallenges
  };
}
async function recalculateChallengeCurrentValues() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const allChallenges = await db.select({
    id: challenges.id,
    title: challenges.title,
    currentValue: challenges.currentValue,
    goalValue: challenges.goalValue
  }).from(challenges);
  const results = [];
  for (const challenge of allChallenges) {
    const participationList = await db.select({
      contribution: participations.contribution,
      companionCount: participations.companionCount
    }).from(participations).where(eq(participations.challengeId, challenge.id));
    const actualValue = participationList.reduce((sum, p) => {
      return sum + (p.contribution || 1) + (p.companionCount || 0);
    }, 0);
    const oldValue = challenge.currentValue || 0;
    const diff = actualValue - oldValue;
    if (diff !== 0) {
      await db.update(challenges).set({ currentValue: actualValue }).where(eq(challenges.id, challenge.id));
      results.push({
        id: challenge.id,
        title: challenge.title,
        oldValue,
        newValue: actualValue,
        diff
      });
    }
  }
  invalidateEventsCache();
  return results;
}
async function getDataIntegrityReport() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const allChallenges = await db.select({
    id: challenges.id,
    title: challenges.title,
    hostName: challenges.hostName,
    hostUsername: challenges.hostUsername,
    currentValue: challenges.currentValue,
    goalValue: challenges.goalValue,
    status: challenges.status,
    eventDate: challenges.eventDate
  }).from(challenges).orderBy(desc(challenges.id));
  const report = [];
  for (const challenge of allChallenges) {
    const participationList = await db.select({
      id: participations.id,
      contribution: participations.contribution,
      companionCount: participations.companionCount
    }).from(participations).where(eq(participations.challengeId, challenge.id));
    const totalParticipations = participationList.length;
    const totalContribution = participationList.reduce((sum, p) => sum + (p.contribution || 1), 0);
    const totalCompanions = participationList.reduce((sum, p) => sum + (p.companionCount || 0), 0);
    const actualTotalContribution = totalContribution + totalCompanions;
    const storedCurrentValue = challenge.currentValue || 0;
    const hasDiscrepancy = storedCurrentValue !== actualTotalContribution;
    report.push({
      id: challenge.id,
      title: challenge.title,
      hostName: challenge.hostName,
      hostUsername: challenge.hostUsername,
      status: challenge.status,
      eventDate: challenge.eventDate,
      goalValue: challenge.goalValue,
      storedCurrentValue,
      actualParticipantCount: totalParticipations,
      actualTotalContribution,
      hasDiscrepancy,
      discrepancyAmount: actualTotalContribution - storedCurrentValue,
      participationBreakdown: {
        totalParticipations,
        totalContribution,
        totalCompanions
      }
    });
  }
  const summary = {
    totalChallenges: report.length,
    challengesWithDiscrepancy: report.filter((r) => r.hasDiscrepancy).length,
    totalStoredValue: report.reduce((sum, r) => sum + r.storedCurrentValue, 0),
    totalActualValue: report.reduce((sum, r) => sum + r.actualTotalContribution, 0),
    totalDiscrepancy: report.reduce((sum, r) => sum + r.discrepancyAmount, 0)
  };
  return { summary, challenges: report };
}
var events, _db, eventsCache, EVENTS_CACHE_TTL, categoriesCache, CATEGORIES_CACHE_TTL;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    init_schema();
    events = challenges;
    _db = null;
    eventsCache = { data: null, timestamp: 0 };
    EVENTS_CACHE_TTL = 30 * 1e3;
    categoriesCache = { data: null, timestamp: 0 };
    CATEGORIES_CACHE_TTL = 5 * 60 * 1e3;
  }
});

// server/_core/index.ts
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/oauth.ts
init_db();

// server/_core/cookies.ts
var LOCAL_HOSTS = /* @__PURE__ */ new Set(["localhost", "127.0.0.1", "::1"]);
function isIpAddress(host) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getParentDomain(hostname) {
  if (LOCAL_HOSTS.has(hostname) || isIpAddress(hostname)) {
    return void 0;
  }
  const parts = hostname.split(".");
  if (parts.length < 3) {
    return void 0;
  }
  return "." + parts.slice(-2).join(".");
}
function getSessionCookieOptions(req) {
  const hostname = req.hostname;
  const domain = getParentDomain(hostname);
  return {
    domain,
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
init_db();
init_env();
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(EXCHANGE_TOKEN_PATH, payload);
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(GET_USER_INFO_PATH, {
      accessToken: token.accessToken
    });
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(platforms.filter((p) => typeof p === "string"));
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice("Bearer ".length).trim();
    }
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = token || cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
async function syncUser(userInfo) {
  if (!userInfo.openId) {
    throw new Error("openId missing from user info");
  }
  const lastSignedIn = /* @__PURE__ */ new Date();
  await upsertUser({
    openId: userInfo.openId,
    name: userInfo.name || null,
    email: userInfo.email ?? null,
    loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
    lastSignedIn
  });
  const saved = await getUserByOpenId(userInfo.openId);
  return saved ?? {
    openId: userInfo.openId,
    name: userInfo.name,
    email: userInfo.email,
    loginMethod: userInfo.loginMethod ?? null,
    lastSignedIn
  };
}
function buildUserResponse(user) {
  return {
    id: user?.id ?? null,
    openId: user?.openId ?? null,
    name: user?.name ?? null,
    email: user?.email ?? null,
    loginMethod: user?.loginMethod ?? null,
    lastSignedIn: (user?.lastSignedIn ?? /* @__PURE__ */ new Date()).toISOString()
  };
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      await syncUser(userInfo);
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      const host = req.get("host") || "";
      const protocol = req.get("x-forwarded-proto") || req.protocol;
      const forceHttps = protocol === "https" || host.includes("manus.computer") || host.includes("manus.im");
      const frontendHost = host.replace(/^3000-/, "8081-");
      const frontendUrl = process.env.EXPO_WEB_PREVIEW_URL || process.env.EXPO_PACKAGER_PROXY_URL || (host ? `${forceHttps ? "https" : protocol}://${frontendHost}` : "http://localhost:8081");
      res.redirect(302, frontendUrl);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
  app.get("/api/oauth/mobile", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      const user = await syncUser(userInfo);
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({
        app_session_id: sessionToken,
        user: buildUserResponse(user)
      });
    } catch (error) {
      console.error("[OAuth] Mobile exchange failed", error);
      res.status(500).json({ error: "OAuth mobile exchange failed" });
    }
  });
  app.post("/api/auth/logout", (req, res) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });
  app.get("/api/auth/me", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({ user: buildUserResponse(user) });
    } catch (error) {
      console.error("[Auth] /api/auth/me failed:", error);
      res.status(401).json({ error: "Not authenticated", user: null });
    }
  });
  app.post("/api/auth/session", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
        res.status(400).json({ error: "Bearer token required" });
        return;
      }
      const token = authHeader.slice("Bearer ".length).trim();
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, user: buildUserResponse(user) });
    } catch (error) {
      console.error("[Auth] /api/auth/session failed:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  });
}

// server/twitter-oauth2.ts
init_db();
init_schema();
import crypto from "crypto";
import { eq as eq2, lt } from "drizzle-orm";

// server/rate-limit-handler.ts
var DEFAULT_OPTIONS = {
  maxRetries: 5,
  initialDelayMs: 1e3,
  maxDelayMs: 6e4
};
function extractRateLimitInfo(headers) {
  const limit = headers.get("x-rate-limit-limit");
  const remaining = headers.get("x-rate-limit-remaining");
  const reset = headers.get("x-rate-limit-reset");
  if (!limit || !remaining || !reset) {
    return null;
  }
  return {
    limit: parseInt(limit, 10),
    remaining: parseInt(remaining, 10),
    reset: parseInt(reset, 10)
  };
}
function calculateWaitTime(resetTimestamp) {
  const now = Math.floor(Date.now() / 1e3);
  const waitSeconds = Math.max(0, resetTimestamp - now + 1);
  return waitSeconds * 1e3;
}
function calculateExponentialBackoff(attempt, initialDelayMs, maxDelayMs) {
  const delay = initialDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * delay;
  return Math.min(delay + jitter, maxDelayMs);
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function withExponentialBackoff(requestFn, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError = null;
  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      const response = await requestFn();
      const rateLimitInfo = extractRateLimitInfo(response.headers);
      if (rateLimitInfo && rateLimitInfo.remaining < 10) {
        console.warn(
          `[RateLimit] Warning: Only ${rateLimitInfo.remaining}/${rateLimitInfo.limit} requests remaining. Resets at ${new Date(rateLimitInfo.reset * 1e3).toISOString()}`
        );
      }
      if (response.status === 429) {
        let waitTime;
        if (rateLimitInfo) {
          waitTime = calculateWaitTime(rateLimitInfo.reset);
          console.log(
            `[RateLimit] Rate limit exceeded. Waiting ${Math.ceil(waitTime / 1e3)}s until reset...`
          );
        } else {
          waitTime = calculateExponentialBackoff(attempt, opts.initialDelayMs, opts.maxDelayMs);
          console.log(
            `[RateLimit] Rate limit exceeded. Exponential backoff: waiting ${Math.ceil(waitTime / 1e3)}s...`
          );
        }
        await sleep(waitTime);
        continue;
      }
      if (response.status >= 500) {
        const waitTime = calculateExponentialBackoff(attempt, opts.initialDelayMs, opts.maxDelayMs);
        console.log(
          `[RateLimit] Server error (${response.status}). Exponential backoff: waiting ${Math.ceil(waitTime / 1e3)}s...`
        );
        await sleep(waitTime);
        continue;
      }
      const data = await response.json();
      return { response, data, rateLimitInfo };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < opts.maxRetries - 1) {
        const waitTime = calculateExponentialBackoff(attempt, opts.initialDelayMs, opts.maxDelayMs);
        console.log(
          `[RateLimit] Network error: ${lastError.message}. Retrying in ${Math.ceil(waitTime / 1e3)}s...`
        );
        await sleep(waitTime);
        continue;
      }
    }
  }
  throw new Error(
    `Failed after ${opts.maxRetries} attempts. Last error: ${lastError?.message || "Unknown error"}`
  );
}
async function twitterApiFetch(url, options = {}, retryOptions = {}) {
  const result = await withExponentialBackoff(
    () => fetch(url, options),
    retryOptions
  );
  if (!result.response.ok && result.response.status !== 429) {
    const errorText = JSON.stringify(result.data);
    throw new Error(`Twitter API error (${result.response.status}): ${errorText}`);
  }
  return {
    data: result.data,
    rateLimitInfo: result.rateLimitInfo
  };
}

// server/twitter-oauth2.ts
var TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || "";
var TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || "";
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
  return { codeVerifier, codeChallenge };
}
function generateState() {
  return crypto.randomBytes(16).toString("hex");
}
function buildAuthorizationUrl(callbackUrl, state, codeChallenge, forceLogin = false) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: TWITTER_CLIENT_ID,
    redirect_uri: callbackUrl,
    scope: "users.read tweet.read follows.read offline.access",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256"
  });
  if (forceLogin) {
    params.set("prompt", "login");
    params.set("t", Date.now().toString());
  }
  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
}
async function exchangeCodeForTokens(code, callbackUrl, codeVerifier) {
  const url = "https://api.twitter.com/2/oauth2/token";
  const params = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    client_id: TWITTER_CLIENT_ID,
    redirect_uri: callbackUrl,
    code_verifier: codeVerifier
  });
  const credentials = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`
    },
    body: params.toString()
  });
  if (!response.ok) {
    const text2 = await response.text();
    console.error("Token exchange error:", text2);
    throw new Error(`Failed to exchange code for tokens: ${text2}`);
  }
  return response.json();
}
async function getUserProfile(accessToken) {
  const url = "https://api.twitter.com/2/users/me";
  const params = "user.fields=profile_image_url,public_metrics,description";
  const fullUrl = `${url}?${params}`;
  const response = await fetch(fullUrl, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  if (!response.ok) {
    const text2 = await response.text();
    console.error("User profile error:", text2);
    throw new Error(`Failed to get user profile: ${text2}`);
  }
  const json2 = await response.json();
  return json2.data;
}
async function refreshAccessToken(refreshToken) {
  const url = "https://api.twitter.com/2/oauth2/token";
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    client_id: TWITTER_CLIENT_ID
  });
  const credentials = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`
    },
    body: params.toString()
  });
  if (!response.ok) {
    const text2 = await response.text();
    throw new Error(`Failed to refresh token: ${text2}`);
  }
  return response.json();
}
async function storePKCEData(state, codeVerifier, callbackUrl) {
  pkceMemoryStore.set(state, { codeVerifier, callbackUrl });
  setTimeout(() => pkceMemoryStore.delete(state), 10 * 60 * 1e3);
  console.log("[PKCE] Stored PKCE data in memory for state:", state.substring(0, 8) + "...");
  setImmediate(async () => {
    try {
      const db = await getDb();
      if (!db) {
        console.log("[PKCE] Database not available, memory-only mode");
        return;
      }
      const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
      await db.delete(oauthPkceData).where(lt(oauthPkceData.expiresAt, /* @__PURE__ */ new Date())).catch(() => {
      });
      await db.insert(oauthPkceData).values({
        state,
        codeVerifier,
        callbackUrl,
        expiresAt
      });
      console.log("[PKCE] Also stored PKCE data in database for state:", state.substring(0, 8) + "...");
    } catch (error) {
      console.log("[PKCE] Database storage failed (memory fallback active):", error instanceof Error ? error.message : error);
    }
  });
}
async function getPKCEData(state) {
  const memoryData = pkceMemoryStore.get(state);
  if (memoryData) {
    console.log("[PKCE] Retrieved PKCE data from memory for state:", state.substring(0, 8) + "...");
    return memoryData;
  }
  const db = await getDb();
  if (!db) {
    console.warn("[PKCE] Database not available");
    return void 0;
  }
  try {
    const result = await db.select().from(oauthPkceData).where(eq2(oauthPkceData.state, state)).limit(1);
    if (result.length === 0) {
      console.log("[PKCE] No PKCE data found for state:", state.substring(0, 8) + "...");
      return void 0;
    }
    const data = result[0];
    if (new Date(data.expiresAt) < /* @__PURE__ */ new Date()) {
      console.log("[PKCE] PKCE data expired for state:", state.substring(0, 8) + "...");
      await deletePKCEData(state);
      return void 0;
    }
    console.log("[PKCE] Retrieved PKCE data for state:", state.substring(0, 8) + "...");
    return {
      codeVerifier: data.codeVerifier,
      callbackUrl: data.callbackUrl
    };
  } catch (error) {
    console.error("[PKCE] Failed to get from database:", error);
    return void 0;
  }
}
async function deletePKCEData(state) {
  pkceMemoryStore.delete(state);
  const db = await getDb();
  if (!db) {
    console.warn("[PKCE] Database not available for delete");
    return;
  }
  try {
    await db.delete(oauthPkceData).where(eq2(oauthPkceData.state, state));
    console.log("[PKCE] Deleted PKCE data for state:", state.substring(0, 8) + "...");
  } catch (error) {
    console.error("[PKCE] Failed to delete from database:", error);
  }
}
var pkceMemoryStore = /* @__PURE__ */ new Map();
var TARGET_TWITTER_USERNAME = "idolfunch";
async function checkFollowStatus(accessToken, sourceUserId, targetUsername = TARGET_TWITTER_USERNAME) {
  try {
    const userLookupUrl = `https://api.twitter.com/2/users/by/username/${targetUsername}`;
    const { data: userData, rateLimitInfo: userRateLimitInfo } = await twitterApiFetch(
      userLookupUrl,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      },
      { maxRetries: 2, initialDelayMs: 500, maxDelayMs: 5e3 }
      // リトライを減らして高速化
    );
    if (userRateLimitInfo && userRateLimitInfo.remaining <= 0) {
      console.log("[Twitter API] Rate limit reached, skipping follow check");
      return { isFollowing: false, targetUser: null, skipped: true };
    }
    const targetUser = userData.data;
    if (!targetUser) {
      console.error("Target user not found:", targetUsername);
      return { isFollowing: false, targetUser: null };
    }
    const followCheckUrl = `https://api.twitter.com/2/users/${sourceUserId}/following`;
    const params = new URLSearchParams({
      "user.fields": "id,name,username",
      "max_results": "1000"
    });
    const { data: followData, rateLimitInfo: followRateLimitInfo } = await twitterApiFetch(
      `${followCheckUrl}?${params}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      },
      { maxRetries: 2, initialDelayMs: 500, maxDelayMs: 5e3 }
      // リトライを減らして高速化
    );
    if (followRateLimitInfo) {
      console.log(
        `[Twitter API] Follow check rate limit: ${followRateLimitInfo.remaining}/${followRateLimitInfo.limit} remaining`
      );
    }
    const following = followData.data || [];
    const isFollowing2 = following.some((user) => user.id === targetUser.id);
    return {
      isFollowing: isFollowing2,
      targetUser: {
        id: targetUser.id,
        name: targetUser.name,
        username: targetUser.username
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
      console.log("[Twitter API] Rate limit error, skipping follow check");
      return { isFollowing: false, targetUser: null, skipped: true };
    }
    console.error("Follow status check error:", error);
    return { isFollowing: false, targetUser: null };
  }
}
function getTargetAccountInfo() {
  return {
    username: TARGET_TWITTER_USERNAME,
    displayName: "\u541B\u6597\u308A\u3093\u304F",
    profileUrl: `https://twitter.com/${TARGET_TWITTER_USERNAME}`
  };
}
async function getUserProfileByUsername(username) {
  let cleanUsername = username.trim();
  const urlMatch = cleanUsername.match(/(?:https?:\/\/)?(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)/i);
  if (urlMatch) {
    cleanUsername = urlMatch[1];
  }
  cleanUsername = cleanUsername.replace(/^@/, "");
  if (!cleanUsername) {
    return null;
  }
  try {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (!bearerToken) {
      console.error("TWITTER_BEARER_TOKEN is not set");
      return null;
    }
    const url = `https://api.twitter.com/2/users/by/username/${cleanUsername}`;
    const params = "user.fields=profile_image_url,public_metrics,description";
    const fullUrl = `${url}?${params}`;
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${bearerToken}`
      }
    });
    if (!response.ok) {
      const text2 = await response.text();
      console.error("Twitter user lookup error:", response.status, text2);
      return null;
    }
    const data = await response.json();
    if (!data.data) {
      console.error("Twitter user not found:", cleanUsername);
      return null;
    }
    const profileImageUrl = data.data.profile_image_url?.replace("_normal", "_400x400") || "";
    return {
      id: data.data.id,
      name: data.data.name,
      username: data.data.username,
      profile_image_url: profileImageUrl,
      description: data.data.description,
      public_metrics: data.data.public_metrics
    };
  } catch (error) {
    console.error("Error fetching Twitter user profile:", error);
    return null;
  }
}

// server/twitter-routes.ts
function registerTwitterRoutes(app) {
  app.get("/api/twitter/auth", async (req, res) => {
    try {
      const forceLogin = req.query.force === "true" || req.query.switch === "true";
      const protocol = req.get("x-forwarded-proto") || req.protocol;
      const forceHttps = protocol === "https" || req.get("host")?.includes("manus.computer");
      const callbackUrl = `${forceHttps ? "https" : protocol}://${req.get("host")}/api/twitter/callback`;
      const { codeVerifier, codeChallenge } = generatePKCE();
      const state = generateState();
      await storePKCEData(state, codeVerifier, callbackUrl);
      const authUrl = buildAuthorizationUrl(callbackUrl, state, codeChallenge, forceLogin);
      console.log("[Twitter OAuth 2.0] Redirecting to:", authUrl);
      res.redirect(authUrl);
    } catch (error) {
      console.error("Twitter auth error:", error);
      res.status(500).json({ error: "Failed to initiate Twitter authentication" });
    }
  });
  app.get("/api/twitter/callback", async (req, res) => {
    try {
      const { code, state, error: oauthError, error_description } = req.query;
      if (oauthError) {
        console.error("Twitter OAuth error:", oauthError, error_description);
        const host2 = req.get("host") || "";
        const protocol2 = req.get("x-forwarded-proto") || req.protocol;
        const forceHttps2 = protocol2 === "https" || host2.includes("manus.computer") || host2.includes("railway.app");
        let baseUrl2;
        if (host2.includes("railway.app")) {
          baseUrl2 = "https://doin-challenge.com";
        } else {
          const expoHost = host2.replace("3000-", "8081-");
          baseUrl2 = `${forceHttps2 ? "https" : protocol2}://${expoHost}`;
        }
        const errorData = encodeURIComponent(JSON.stringify({
          error: true,
          code: oauthError,
          message: oauthError === "access_denied" ? "\u8A8D\u8A3C\u304C\u30AD\u30E3\u30F3\u30BB\u30EB\u3055\u308C\u307E\u3057\u305F" : error_description || "Twitter\u8A8D\u8A3C\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F"
        }));
        res.redirect(`${baseUrl2}/oauth/twitter-callback?error=${errorData}`);
        return;
      }
      if (!code || !state) {
        res.status(400).json({ error: "Missing code or state parameter" });
        return;
      }
      const pkceData = await getPKCEData(state);
      if (!pkceData) {
        res.status(400).json({ error: "Invalid or expired state parameter" });
        return;
      }
      const { codeVerifier, callbackUrl } = pkceData;
      const tokens = await exchangeCodeForTokens(code, callbackUrl, codeVerifier);
      console.log("[Twitter OAuth 2.0] Token exchange successful");
      setImmediate(() => deletePKCEData(state).catch(() => {
      }));
      const userProfile = await getUserProfile(tokens.access_token);
      console.log("[Twitter OAuth 2.0] User profile retrieved:", userProfile.username);
      const isFollowingTarget = false;
      const targetAccount = null;
      console.log("[Twitter OAuth 2.0] Skipping follow check for faster login");
      const userData = {
        twitterId: userProfile.id,
        name: userProfile.name,
        username: userProfile.username,
        profileImage: userProfile.profile_image_url?.replace("_normal", "_400x400"),
        followersCount: userProfile.public_metrics?.followers_count || 0,
        followingCount: userProfile.public_metrics?.following_count || 0,
        description: userProfile.description || "",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        isFollowingTarget,
        targetAccount
      };
      const encodedData = encodeURIComponent(JSON.stringify(userData));
      const host = req.get("host") || "";
      const protocol = req.get("x-forwarded-proto") || req.protocol;
      const forceHttps = protocol === "https" || host.includes("manus.computer") || host.includes("railway.app");
      let baseUrl;
      if (host.includes("railway.app")) {
        baseUrl = "https://doin-challenge.com";
      } else {
        const expoHost = host.replace("3000-", "8081-");
        baseUrl = `${forceHttps ? "https" : protocol}://${expoHost}`;
      }
      const redirectUrl = `${baseUrl}/oauth/twitter-callback?data=${encodedData}`;
      console.log("[Twitter OAuth 2.0] Redirecting to:", redirectUrl.substring(0, 100) + "...");
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Twitter callback error:", error);
      let errorMessage = "Failed to complete Twitter authentication";
      let errorDetails = "";
      if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.stack || "";
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      const host = req.get("host") || "";
      const protocol = req.get("x-forwarded-proto") || req.protocol;
      const forceHttps = protocol === "https" || host.includes("manus.computer") || host.includes("railway.app");
      let baseUrl;
      if (host.includes("railway.app")) {
        baseUrl = "https://doin-challenge.com";
      } else {
        const expoHost = host.replace("3000-", "8081-");
        baseUrl = `${forceHttps ? "https" : protocol}://${expoHost}`;
      }
      const errorData = encodeURIComponent(JSON.stringify({
        error: true,
        message: errorMessage,
        details: errorDetails.substring(0, 200)
        // 長すぎる場合は切り詰め
      }));
      res.redirect(`${baseUrl}/oauth/twitter-callback?error=${errorData}`);
    }
  });
  app.get("/api/twitter/me", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid Authorization header" });
        return;
      }
      const accessToken = authHeader.substring(7);
      const userProfile = await getUserProfile(accessToken);
      res.json({
        twitterId: userProfile.id,
        name: userProfile.name,
        username: userProfile.username,
        profileImage: userProfile.profile_image_url?.replace("_normal", "_400x400"),
        followersCount: userProfile.public_metrics?.followers_count || 0,
        followingCount: userProfile.public_metrics?.following_count || 0,
        description: userProfile.description || ""
      });
    } catch (error) {
      console.error("Twitter profile error:", error);
      res.status(500).json({ error: "Failed to get Twitter profile" });
    }
  });
  app.get("/api/twitter/follow-status", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid Authorization header" });
        return;
      }
      const accessToken = authHeader.substring(7);
      const userId = req.query.userId;
      if (!userId) {
        res.status(400).json({ error: "Missing userId parameter" });
        return;
      }
      const followStatus = await checkFollowStatus(accessToken, userId);
      const targetInfo = getTargetAccountInfo();
      res.json({
        isFollowing: followStatus.isFollowing,
        targetAccount: {
          ...targetInfo,
          ...followStatus.targetUser
        }
      });
    } catch (error) {
      console.error("Follow status error:", error);
      res.status(500).json({ error: "Failed to check follow status" });
    }
  });
  app.get("/api/twitter/target-account", async (req, res) => {
    try {
      const targetInfo = getTargetAccountInfo();
      res.json(targetInfo);
    } catch (error) {
      console.error("Target account error:", error);
      res.status(500).json({ error: "Failed to get target account info" });
    }
  });
  app.get("/api/twitter/user/:username", async (req, res) => {
    try {
      const { username } = req.params;
      if (!username) {
        res.status(400).json({ error: "Username is required" });
        return;
      }
      const profile = await getUserProfileByUsername(username);
      if (!profile) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json({
        id: profile.id,
        name: profile.name,
        username: profile.username,
        profileImage: profile.profile_image_url,
        description: profile.description || "",
        followersCount: profile.public_metrics?.followers_count || 0,
        followingCount: profile.public_metrics?.following_count || 0
      });
    } catch (error) {
      console.error("Twitter user lookup error:", error);
      res.status(500).json({ error: "Failed to lookup Twitter user" });
    }
  });
  app.get("/api/twitter/refresh-follow-status", async (req, res) => {
    try {
      const protocol = req.get("x-forwarded-proto") || req.protocol;
      const forceHttps = protocol === "https" || req.get("host")?.includes("manus.computer");
      const callbackUrl = `${forceHttps ? "https" : protocol}://${req.get("host")}/api/twitter/callback`;
      const { codeVerifier, codeChallenge } = generatePKCE();
      const state = generateState();
      await storePKCEData(state, codeVerifier, callbackUrl);
      const authUrl = buildAuthorizationUrl(callbackUrl, state, codeChallenge);
      console.log("[Twitter OAuth 2.0] Refresh follow status - Redirecting to:", authUrl);
      res.redirect(authUrl);
    } catch (error) {
      console.error("Twitter refresh follow status error:", error);
      res.status(500).json({ error: "Failed to initiate follow status refresh" });
    }
  });
  app.post("/api/twitter/refresh", async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: "Refresh token is required" });
        return;
      }
      console.log("[Twitter OAuth 2.0] Refreshing access token...");
      const tokens = await refreshAccessToken(refreshToken);
      console.log("[Twitter OAuth 2.0] Token refresh successful");
      res.json({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        token_type: tokens.token_type,
        scope: tokens.scope
      });
    } catch (error) {
      console.error("Twitter token refresh error:", error);
      res.status(401).json({ error: "Failed to refresh token" });
    }
  });
  app.post("/api/twitter/lookup", async (req, res) => {
    try {
      const { input } = req.body;
      if (!input) {
        res.status(400).json({ error: "Input is required" });
        return;
      }
      const profile = await getUserProfileByUsername(input);
      if (!profile) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json({
        id: profile.id,
        name: profile.name,
        username: profile.username,
        profileImage: profile.profile_image_url,
        description: profile.description || "",
        followersCount: profile.public_metrics?.followers_count || 0,
        followingCount: profile.public_metrics?.following_count || 0
      });
    } catch (error) {
      console.error("Twitter user lookup error:", error);
      res.status(500).json({ error: "Failed to lookup Twitter user" });
    }
  });
}

// server/routers.ts
import { z as z2 } from "zod";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL("webdevtoken.v1.WebDevService/SendNotification", normalizedBase).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// shared/version.ts
var APP_VERSION = "v5.91";

// server/_core/systemRouter.ts
var systemRouter = router({
  // バージョン取得エンドポイント
  version: publicProcedure.query(() => ({
    version: APP_VERSION
  })),
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/storage.ts
init_env();
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

// server/_core/imageGeneration.ts
init_env();
async function generateImage(options) {
  if (!ENV.forgeApiUrl) {
    throw new Error("BUILT_IN_FORGE_API_URL is not configured");
  }
  if (!ENV.forgeApiKey) {
    throw new Error("BUILT_IN_FORGE_API_KEY is not configured");
  }
  const baseUrl = ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`;
  const fullUrl = new URL("images.v1.ImageService/GenerateImage", baseUrl).toString();
  const response = await fetch(fullUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "connect-protocol-version": "1",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify({
      prompt: options.prompt,
      original_images: options.originalImages || []
    })
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Image generation request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
    );
  }
  const result = await response.json();
  const base64Data = result.image.b64Json;
  const buffer = Buffer.from(base64Data, "base64");
  const { url } = await storagePut(`generated/${Date.now()}.png`, buffer, result.image.mimeType);
  return {
    url
  };
}

// server/routers.ts
init_db();
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  // イベント関連API
  events: router({
    // 公開イベント一覧取得
    list: publicProcedure.query(async () => {
      return getAllEvents();
    }),
    // ページネーション対応のイベント一覧取得
    listPaginated: publicProcedure.input(z2.object({
      cursor: z2.number().optional(),
      // 次のページの開始位置
      limit: z2.number().min(1).max(50).default(20),
      filter: z2.enum(["all", "solo", "group"]).optional()
    })).query(async ({ input }) => {
      const { cursor = 0, limit, filter } = input;
      const allEvents = await getAllEvents();
      let filteredEvents = allEvents;
      if (filter && filter !== "all") {
        filteredEvents = allEvents.filter((e) => e.eventType === filter);
      }
      const items = filteredEvents.slice(cursor, cursor + limit);
      const nextCursor = cursor + limit < filteredEvents.length ? cursor + limit : void 0;
      return {
        items,
        nextCursor,
        totalCount: filteredEvents.length
      };
    }),
    // イベント詳細取得
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      const event = await getEventById(input.id);
      if (!event) return null;
      const participantCount = await getTotalCompanionCountByEventId(input.id);
      return { ...event, participantCount };
    }),
    // 自分が作成したイベント一覧
    myEvents: protectedProcedure.query(async ({ ctx }) => {
      return getEventsByHostTwitterId(ctx.user.openId);
    }),
    // イベント作成（publicProcedureでフロントエンドのユーザー情報を使用）
    create: publicProcedure.input(z2.object({
      title: z2.string().min(1).max(255),
      description: z2.string().optional(),
      eventDate: z2.string(),
      venue: z2.string().optional(),
      hostTwitterId: z2.string(),
      // 必須に変更
      hostName: z2.string(),
      hostUsername: z2.string().optional(),
      hostProfileImage: z2.string().optional(),
      hostFollowersCount: z2.number().optional(),
      hostDescription: z2.string().optional(),
      // 追加フィールド
      goalType: z2.enum(["attendance", "followers", "viewers", "points", "custom"]).optional(),
      goalValue: z2.number().optional(),
      goalUnit: z2.string().optional(),
      eventType: z2.enum(["solo", "group"]).optional(),
      categoryId: z2.number().optional(),
      externalUrl: z2.string().optional(),
      ticketPresale: z2.number().optional(),
      ticketDoor: z2.number().optional(),
      ticketUrl: z2.string().optional()
    })).mutation(async ({ input }) => {
      if (!input.hostTwitterId) {
        throw new Error("\u30ED\u30B0\u30A4\u30F3\u304C\u5FC5\u8981\u3067\u3059\u3002Twitter\u3067\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
      }
      const eventId = await createEvent({
        hostUserId: null,
        // セッションに依存しない
        hostTwitterId: input.hostTwitterId,
        hostName: input.hostName,
        hostUsername: input.hostUsername,
        hostProfileImage: input.hostProfileImage,
        hostFollowersCount: input.hostFollowersCount,
        hostDescription: input.hostDescription,
        title: input.title,
        description: input.description,
        eventDate: new Date(input.eventDate),
        venue: input.venue,
        isPublic: true,
        goalType: input.goalType || "attendance",
        goalValue: input.goalValue || 100,
        goalUnit: input.goalUnit || "\u4EBA",
        eventType: input.eventType || "solo",
        categoryId: input.categoryId,
        externalUrl: input.externalUrl,
        ticketPresale: input.ticketPresale,
        ticketDoor: input.ticketDoor,
        ticketUrl: input.ticketUrl
      });
      return { id: eventId };
    }),
    // イベント更新
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      title: z2.string().min(1).max(255).optional(),
      description: z2.string().optional(),
      eventDate: z2.string().optional(),
      venue: z2.string().optional(),
      isPublic: z2.boolean().optional(),
      goalValue: z2.number().optional(),
      goalUnit: z2.string().optional(),
      goalType: z2.enum(["attendance", "followers", "viewers", "points", "custom"]).optional(),
      eventType: z2.enum(["solo", "group"]).optional(),
      categoryId: z2.number().optional(),
      externalUrl: z2.string().optional(),
      ticketPresale: z2.number().optional(),
      ticketDoor: z2.number().optional(),
      ticketUrl: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const event = await getEventById(input.id);
      if (!event || event.hostTwitterId !== ctx.user.openId) {
        throw new Error("Unauthorized");
      }
      const { id, eventDate, ...rest } = input;
      await updateEvent(id, {
        ...rest,
        ...eventDate ? { eventDate: new Date(eventDate) } : {}
      });
      return { success: true };
    }),
    // イベント削除
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const event = await getEventById(input.id);
      if (!event || event.hostTwitterId !== ctx.user.openId) {
        throw new Error("Unauthorized");
      }
      await deleteEvent(input.id);
      return { success: true };
    })
  }),
  // 参加登録関連API
  participations: router({
    // イベントの参加者一覧
    listByEvent: publicProcedure.input(z2.object({ eventId: z2.number() })).query(async ({ input }) => {
      return getParticipationsByEventId(input.eventId);
    }),
    // 自分の参加一覧
    myParticipations: protectedProcedure.query(async ({ ctx }) => {
      return getParticipationsByUserId(ctx.user.id);
    }),
    // 参加登録（ログインユーザー - publicProcedureでクライアントからユーザー情報を受け取る）
    create: publicProcedure.input(z2.object({
      challengeId: z2.number(),
      message: z2.string().optional(),
      companionCount: z2.number().default(0),
      prefecture: z2.string().optional(),
      gender: z2.enum(["male", "female", "unspecified"]).optional(),
      // v5.86: 性別を追加
      twitterId: z2.string().optional(),
      displayName: z2.string(),
      username: z2.string().optional(),
      profileImage: z2.string().optional(),
      followersCount: z2.number().optional(),
      // 一緒に参加する友人（名前付き）
      companions: z2.array(z2.object({
        displayName: z2.string(),
        twitterUsername: z2.string().optional(),
        twitterId: z2.string().optional(),
        profileImage: z2.string().optional()
      })).optional()
    })).mutation(async ({ ctx, input }) => {
      if (!input.twitterId) {
        throw new Error("\u30ED\u30B0\u30A4\u30F3\u304C\u5FC5\u8981\u3067\u3059\u3002Twitter\u3067\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
      }
      const participationId = await createParticipation({
        challengeId: input.challengeId,
        userId: ctx.user?.id,
        // セッションがあれば使用、なくてもOK
        twitterId: input.twitterId,
        displayName: input.displayName,
        username: input.username,
        profileImage: input.profileImage,
        followersCount: input.followersCount,
        message: input.message,
        companionCount: input.companionCount,
        prefecture: input.prefecture,
        gender: input.gender || "unspecified",
        // v5.86: 性別を保存
        isAnonymous: false
      });
      if (input.companions && input.companions.length > 0 && participationId) {
        const companionRecords = input.companions.map((c) => ({
          participationId,
          challengeId: input.challengeId,
          displayName: c.displayName,
          twitterUsername: c.twitterUsername,
          twitterId: c.twitterId,
          profileImage: c.profileImage,
          invitedByUserId: ctx.user?.id
        }));
        await createCompanions(companionRecords);
      }
      return { id: participationId };
    }),
    // 匿名参加登録
    createAnonymous: publicProcedure.input(z2.object({
      challengeId: z2.number(),
      displayName: z2.string(),
      message: z2.string().optional(),
      companionCount: z2.number().default(0),
      prefecture: z2.string().optional(),
      // 一緒に参加する友人（名前付き）
      companions: z2.array(z2.object({
        displayName: z2.string(),
        twitterUsername: z2.string().optional(),
        twitterId: z2.string().optional(),
        profileImage: z2.string().optional()
      })).optional()
    })).mutation(async ({ input }) => {
      const participationId = await createParticipation({
        challengeId: input.challengeId,
        displayName: input.displayName,
        message: input.message,
        companionCount: input.companionCount,
        prefecture: input.prefecture,
        isAnonymous: true
      });
      if (input.companions && input.companions.length > 0 && participationId) {
        const companionRecords = input.companions.map((c) => ({
          participationId,
          challengeId: input.challengeId,
          displayName: c.displayName,
          twitterUsername: c.twitterUsername,
          twitterId: c.twitterId,
          profileImage: c.profileImage
        }));
        await createCompanions(companionRecords);
      }
      return { id: participationId };
    }),
    // 参加表明の更新（都道府県・コメント・一緒に参加する人の変更）
    update: publicProcedure.input(z2.object({
      id: z2.number(),
      twitterId: z2.string().optional(),
      message: z2.string().optional(),
      prefecture: z2.string().optional(),
      gender: z2.enum(["male", "female", "unspecified"]).optional(),
      companionCount: z2.number().default(0),
      companions: z2.array(z2.object({
        displayName: z2.string(),
        twitterUsername: z2.string().optional(),
        twitterId: z2.string().optional(),
        profileImage: z2.string().optional()
      })).optional()
    })).mutation(async ({ input }) => {
      const participation = await getParticipationById(input.id);
      if (!participation) {
        throw new Error("\u53C2\u52A0\u8868\u660E\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
      }
      await updateParticipation(input.id, {
        message: input.message,
        prefecture: input.prefecture,
        companionCount: input.companionCount,
        gender: input.gender
      });
      await deleteCompanionsForParticipation(input.id);
      if (input.companions && input.companions.length > 0) {
        const companionRecords = input.companions.map((c) => ({
          participationId: input.id,
          challengeId: participation.challengeId,
          displayName: c.displayName,
          twitterUsername: c.twitterUsername,
          twitterId: c.twitterId,
          profileImage: c.profileImage
        }));
        await createCompanions(companionRecords);
      }
      return { success: true };
    }),
    // 参加取消
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const participations2 = await getParticipationsByUserId(ctx.user.id);
      const participation = participations2.find((p) => p.id === input.id);
      if (!participation) {
        throw new Error("Unauthorized");
      }
      await deleteParticipation(input.id);
      return { success: true };
    }),
    // 参加をキャンセル（チケット譲渡オプション付き）
    cancel: protectedProcedure.input(z2.object({
      participationId: z2.number(),
      createTransfer: z2.boolean().default(false),
      // チケット譲渡投稿を同時に作成するか
      transferComment: z2.string().max(500).optional(),
      userUsername: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const result = await cancelParticipation(input.participationId, ctx.user.id);
      if (!result.success) {
        return result;
      }
      if (input.createTransfer && result.challengeId) {
        await createTicketTransfer({
          challengeId: result.challengeId,
          userId: ctx.user.id,
          userName: ctx.user.name || "\u533F\u540D",
          userUsername: input.userUsername,
          userImage: null,
          ticketCount: result.contribution || 1,
          priceType: "face_value",
          comment: input.transferComment || "\u53C2\u52A0\u30AD\u30E3\u30F3\u30BB\u30EB\u306E\u305F\u3081\u8B72\u6E21\u3057\u307E\u3059"
        });
        const waitlistUsers = await getWaitlistUsersForNotification(result.challengeId);
      }
      return { success: true, challengeId: result.challengeId };
    })
  }),
  // 通知関連API
  notifications: router({
    // 通知設定取得
    getSettings: protectedProcedure.input(z2.object({ challengeId: z2.number() })).query(async ({ ctx, input }) => {
      const settings = await getNotificationSettings(ctx.user.id);
      return settings;
    }),
    // 通知設定更新
    updateSettings: protectedProcedure.input(z2.object({
      challengeId: z2.number(),
      onGoalReached: z2.boolean().optional(),
      onMilestone25: z2.boolean().optional(),
      onMilestone50: z2.boolean().optional(),
      onMilestone75: z2.boolean().optional(),
      onNewParticipant: z2.boolean().optional(),
      expoPushToken: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const { challengeId, ...settings } = input;
      await upsertNotificationSettings(ctx.user.id, challengeId, settings);
      return { success: true };
    }),
    // 通知履歴取得
    list: protectedProcedure.query(async ({ ctx }) => {
      return getNotificationsByUserId(ctx.user.id);
    }),
    // 通知を既読にする
    markAsRead: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await markNotificationAsRead(input.id);
      return { success: true };
    }),
    // 全ての通知を既読にする
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    })
  }),
  // OGP画像生成API
  ogp: router({
    // チャレンジのシェア用OGP画像を生成
    generateChallengeOgp: publicProcedure.input(z2.object({ challengeId: z2.number() })).mutation(async ({ input }) => {
      const challenge = await getEventById(input.challengeId);
      if (!challenge) {
        throw new Error("Challenge not found");
      }
      const currentValue = challenge.currentValue || 0;
      const goalValue = challenge.goalValue || 100;
      const progress = Math.min(Math.round(currentValue / goalValue * 100), 100);
      const unit = challenge.goalUnit || "\u4EBA";
      const prompt = `Create a vibrant social media share card for a Japanese idol fan challenge app called "\u52D5\u54E1\u3061\u3083\u308C\u3093\u3058". 

Design requirements:
- Modern dark theme with pink to purple gradient accents (#EC4899 to #8B5CF6)
- Title: "${challenge.title}"
- Progress: ${currentValue}/${goalValue}${unit} (${progress}%)
- Host: ${challenge.hostName}
- Include a progress bar visualization
- Japanese text style with cute idol aesthetic
- Include sparkles and star decorations
- Aspect ratio 1200x630 (Twitter/OGP standard)
- Text should be large and readable
- Include "#\u52D5\u54E1\u3061\u3083\u308C\u3093\u3058" hashtag at bottom`;
      try {
        const result = await generateImage({ prompt });
        return { url: result.url };
      } catch (error) {
        console.error("OGP image generation failed:", error);
        throw new Error("Failed to generate OGP image");
      }
    })
  }),
  // バッジ関連API
  badges: router({
    // 全バッジ一覧
    list: publicProcedure.query(async () => {
      return getAllBadges();
    }),
    // ユーザーのバッジ一覧
    myBadges: protectedProcedure.query(async ({ ctx }) => {
      return getUserBadgesWithDetails(ctx.user.id);
    }),
    // バッジ付与（管理者用）
    award: protectedProcedure.input(z2.object({
      userId: z2.number(),
      badgeId: z2.number(),
      challengeId: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }
      const result = await awardBadge(input.userId, input.badgeId, input.challengeId);
      return { success: !!result, id: result };
    })
  }),
  // ピックアップコメント関連API
  pickedComments: router({
    // チャレンジのピックアップコメント一覧
    list: publicProcedure.input(z2.object({ challengeId: z2.number() })).query(async ({ input }) => {
      return getPickedCommentsWithParticipation(input.challengeId);
    }),
    // コメントをピックアップ（管理者/ホスト用）
    pick: protectedProcedure.input(z2.object({
      participationId: z2.number(),
      challengeId: z2.number(),
      reason: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const challenge = await getEventById(input.challengeId);
      if (!challenge) throw new Error("Challenge not found");
      if (challenge.hostUserId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Permission denied");
      }
      const result = await pickComment(input.participationId, input.challengeId, ctx.user.id, input.reason);
      return { success: !!result, id: result };
    }),
    // ピックアップ解除
    unpick: protectedProcedure.input(z2.object({ participationId: z2.number(), challengeId: z2.number() })).mutation(async ({ ctx, input }) => {
      const challenge = await getEventById(input.challengeId);
      if (!challenge) throw new Error("Challenge not found");
      if (challenge.hostUserId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Permission denied");
      }
      await unpickComment(input.participationId);
      return { success: true };
    }),
    // 動画使用済みにマーク
    markAsUsed: protectedProcedure.input(z2.object({ id: z2.number(), challengeId: z2.number() })).mutation(async ({ ctx, input }) => {
      const challenge = await getEventById(input.challengeId);
      if (!challenge) throw new Error("Challenge not found");
      if (challenge.hostUserId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Permission denied");
      }
      await markCommentAsUsedInVideo(input.id);
      return { success: true };
    }),
    // コメントがピックアップされているかチェック
    isPicked: publicProcedure.input(z2.object({ participationId: z2.number() })).query(async ({ input }) => {
      return isCommentPicked(input.participationId);
    })
  }),
  // 地域統計API
  prefectures: router({
    // 地域ランキング
    ranking: publicProcedure.input(z2.object({ challengeId: z2.number() })).query(async ({ input }) => {
      return getPrefectureRanking(input.challengeId);
    }),
    // 地域フィルター付き参加者一覧
    participations: publicProcedure.input(z2.object({ challengeId: z2.number(), prefecture: z2.string() })).query(async ({ input }) => {
      return getParticipationsByPrefectureFilter(input.challengeId, input.prefecture);
    })
  }),
  // エール（参加者同士の応援）API
  cheers: router({
    // エールを送る
    send: protectedProcedure.input(z2.object({
      toParticipationId: z2.number(),
      toUserId: z2.number().optional(),
      challengeId: z2.number(),
      message: z2.string().optional(),
      emoji: z2.string().default("\u{1F44F}")
    })).mutation(async ({ ctx, input }) => {
      const result = await sendCheer({
        fromUserId: ctx.user.id,
        fromUserName: ctx.user.name || "\u533F\u540D",
        fromUserImage: null,
        toParticipationId: input.toParticipationId,
        toUserId: input.toUserId,
        challengeId: input.challengeId,
        message: input.message,
        emoji: input.emoji
      });
      return { success: !!result, id: result };
    }),
    // 参加者へのエール一覧
    forParticipation: publicProcedure.input(z2.object({ participationId: z2.number() })).query(async ({ input }) => {
      return getCheersForParticipation(input.participationId);
    }),
    // チャレンジのエール一覧
    forChallenge: publicProcedure.input(z2.object({ challengeId: z2.number() })).query(async ({ input }) => {
      return getCheersForChallenge(input.challengeId);
    }),
    // エール数を取得
    count: publicProcedure.input(z2.object({ participationId: z2.number() })).query(async ({ input }) => {
      return getCheerCountForParticipation(input.participationId);
    }),
    // 自分が受けたエール
    received: protectedProcedure.query(async ({ ctx }) => {
      return getCheersReceivedByUser(ctx.user.id);
    }),
    // 自分が送ったエール
    sent: protectedProcedure.query(async ({ ctx }) => {
      return getCheersSentByUser(ctx.user.id);
    })
  }),
  // 達成記念ページAPI
  achievements: router({
    // 達成記念ページを作成
    create: protectedProcedure.input(z2.object({
      challengeId: z2.number(),
      title: z2.string(),
      message: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const challenge = await getEventById(input.challengeId);
      if (!challenge) throw new Error("Challenge not found");
      if (challenge.hostUserId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Permission denied");
      }
      const participations2 = await getParticipationsByEventId(input.challengeId);
      const result = await createAchievementPage({
        challengeId: input.challengeId,
        achievedAt: /* @__PURE__ */ new Date(),
        finalValue: challenge.currentValue || 0,
        goalValue: challenge.goalValue || 100,
        totalParticipants: participations2.length,
        title: input.title,
        message: input.message,
        isPublic: true
      });
      return { success: !!result, id: result };
    }),
    // 達成記念ページを取得
    get: publicProcedure.input(z2.object({ challengeId: z2.number() })).query(async ({ input }) => {
      return getAchievementPage(input.challengeId);
    }),
    // 達成記念ページを更新
    update: protectedProcedure.input(z2.object({
      challengeId: z2.number(),
      title: z2.string().optional(),
      message: z2.string().optional(),
      isPublic: z2.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      const challenge = await getEventById(input.challengeId);
      if (!challenge) throw new Error("Challenge not found");
      if (challenge.hostUserId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Permission denied");
      }
      await updateAchievementPage(input.challengeId, {
        title: input.title,
        message: input.message,
        isPublic: input.isPublic
      });
      return { success: true };
    }),
    // 公開中の達成記念ページ一覧
    public: publicProcedure.query(async () => {
      return getPublicAchievementPages();
    })
  }),
  // リマインダー関連
  reminders: router({
    // リマインダーを作成
    create: protectedProcedure.input(z2.object({
      challengeId: z2.number(),
      reminderType: z2.enum(["day_before", "day_of", "hour_before", "custom"]),
      customTime: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const result = await createReminder({
        challengeId: input.challengeId,
        userId: ctx.user.id,
        reminderType: input.reminderType,
        customTime: input.customTime ? new Date(input.customTime) : void 0
      });
      return { success: !!result, id: result };
    }),
    // ユーザーのリマインダー一覧
    list: protectedProcedure.query(async ({ ctx }) => {
      return getRemindersForUser(ctx.user.id);
    }),
    // チャレンジのリマインダー設定を取得
    getForChallenge: protectedProcedure.input(z2.object({ challengeId: z2.number() })).query(async ({ ctx, input }) => {
      return getUserReminderForChallenge(ctx.user.id, input.challengeId);
    }),
    // リマインダーを更新
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      reminderType: z2.enum(["day_before", "day_of", "hour_before", "custom"]).optional(),
      customTime: z2.string().optional()
    })).mutation(async ({ input }) => {
      await updateReminder(input.id, {
        reminderType: input.reminderType,
        customTime: input.customTime ? new Date(input.customTime) : void 0
      });
      return { success: true };
    }),
    // リマインダーを削除
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await deleteReminder(input.id);
      return { success: true };
    })
  }),
  // DM関連
  dm: router({
    // DMを送信
    send: protectedProcedure.input(z2.object({
      toUserId: z2.number(),
      challengeId: z2.number(),
      message: z2.string().min(1).max(1e3)
    })).mutation(async ({ ctx, input }) => {
      const result = await sendDirectMessage({
        fromUserId: ctx.user.id,
        fromUserName: ctx.user.name || "\u533F\u540D",
        fromUserImage: null,
        toUserId: input.toUserId,
        challengeId: input.challengeId,
        message: input.message
      });
      return { success: !!result, id: result };
    }),
    // 会話一覧を取得
    conversations: protectedProcedure.query(async ({ ctx }) => {
      return getConversationList(ctx.user.id);
    }),
    // 特定の会話を取得
    getConversation: protectedProcedure.input(z2.object({
      partnerId: z2.number(),
      challengeId: z2.number()
    })).query(async ({ ctx, input }) => {
      return getConversation(ctx.user.id, input.partnerId, input.challengeId);
    }),
    // 未読メッセージ数を取得
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return getUnreadMessageCount(ctx.user.id);
    }),
    // メッセージを既読にする
    markAsRead: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await markMessageAsRead(input.id);
      return { success: true };
    }),
    // 特定の相手からのメッセージを全て既読にする
    markAllAsRead: protectedProcedure.input(z2.object({ fromUserId: z2.number() })).mutation(async ({ ctx, input }) => {
      await markAllMessagesAsRead(ctx.user.id, input.fromUserId);
      return { success: true };
    })
  }),
  // テンプレート関連
  templates: router({
    // テンプレートを作成
    create: protectedProcedure.input(z2.object({
      name: z2.string().min(1).max(100),
      description: z2.string().optional(),
      goalType: z2.enum(["attendance", "followers", "viewers", "points", "custom"]),
      goalValue: z2.number().min(1),
      goalUnit: z2.string().default("\u4EBA"),
      eventType: z2.enum(["solo", "group"]),
      ticketPresale: z2.number().optional(),
      ticketDoor: z2.number().optional(),
      isPublic: z2.boolean().default(false)
    })).mutation(async ({ ctx, input }) => {
      const result = await createChallengeTemplate({
        userId: ctx.user.id,
        ...input
      });
      return { success: !!result, id: result };
    }),
    // ユーザーのテンプレート一覧
    list: protectedProcedure.query(async ({ ctx }) => {
      return getChallengeTemplatesForUser(ctx.user.id);
    }),
    // 公開テンプレート一覧
    public: publicProcedure.query(async () => {
      return getPublicChallengeTemplates();
    }),
    // テンプレート詳細を取得
    get: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getChallengeTemplateById(input.id);
    }),
    // テンプレートを更新
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().min(1).max(100).optional(),
      description: z2.string().optional(),
      goalType: z2.enum(["attendance", "followers", "viewers", "points", "custom"]).optional(),
      goalValue: z2.number().min(1).optional(),
      goalUnit: z2.string().optional(),
      eventType: z2.enum(["solo", "group"]).optional(),
      ticketPresale: z2.number().optional(),
      ticketDoor: z2.number().optional(),
      isPublic: z2.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      const template = await getChallengeTemplateById(input.id);
      if (!template) throw new Error("Template not found");
      if (template.userId !== ctx.user.id) throw new Error("Permission denied");
      await updateChallengeTemplate(input.id, input);
      return { success: true };
    }),
    // テンプレートを削除
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const template = await getChallengeTemplateById(input.id);
      if (!template) throw new Error("Template not found");
      if (template.userId !== ctx.user.id) throw new Error("Permission denied");
      await deleteChallengeTemplate(input.id);
      return { success: true };
    }),
    // テンプレートの使用回数をインクリメント
    incrementUseCount: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await incrementTemplateUseCount(input.id);
      return { success: true };
    })
  }),
  // 検索関連
  search: router({
    // チャレンジを検索
    challenges: publicProcedure.input(z2.object({ query: z2.string().min(1) })).query(async ({ input }) => {
      return searchChallenges(input.query);
    }),
    // ページネーション対応の検索
    challengesPaginated: publicProcedure.input(z2.object({
      query: z2.string().min(1),
      cursor: z2.number().optional(),
      limit: z2.number().min(1).max(50).default(20)
    })).query(async ({ input }) => {
      const { query, cursor = 0, limit } = input;
      const allResults = await searchChallenges(query);
      const items = allResults.slice(cursor, cursor + limit);
      const nextCursor = cursor + limit < allResults.length ? cursor + limit : void 0;
      return {
        items,
        nextCursor,
        totalCount: allResults.length
      };
    }),
    // 検索履歴を保存
    saveHistory: protectedProcedure.input(z2.object({ query: z2.string(), resultCount: z2.number() })).mutation(async ({ ctx, input }) => {
      const result = await saveSearchHistory({
        userId: ctx.user.id,
        query: input.query,
        resultCount: input.resultCount
      });
      return { success: !!result, id: result };
    }),
    // 検索履歴を取得
    history: protectedProcedure.input(z2.object({ limit: z2.number().optional() })).query(async ({ ctx, input }) => {
      return getSearchHistoryForUser(ctx.user.id, input.limit || 10);
    }),
    // 検索履歴をクリア
    clearHistory: protectedProcedure.mutation(async ({ ctx }) => {
      await clearSearchHistoryForUser(ctx.user.id);
      return { success: true };
    })
  }),
  // フォロー関連
  follows: router({
    // フォローする
    follow: protectedProcedure.input(z2.object({
      followeeId: z2.number(),
      followeeName: z2.string().optional(),
      followeeImage: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const result = await followUser({
        followerId: ctx.user.id,
        followerName: ctx.user.name || "\u533F\u540D",
        followeeId: input.followeeId,
        followeeName: input.followeeName,
        followeeImage: input.followeeImage
      });
      return { success: !!result, id: result };
    }),
    // フォロー解除
    unfollow: protectedProcedure.input(z2.object({ followeeId: z2.number() })).mutation(async ({ ctx, input }) => {
      await unfollowUser(ctx.user.id, input.followeeId);
      return { success: true };
    }),
    // フォロー中のユーザー一覧
    following: protectedProcedure.query(async ({ ctx }) => {
      return getFollowingForUser(ctx.user.id);
    }),
    // フォロワー一覧（特定ユーザーまたは自分）
    followers: publicProcedure.input(z2.object({ userId: z2.number().optional() }).optional()).query(async ({ ctx, input }) => {
      const targetUserId = input?.userId || ctx.user?.id;
      if (!targetUserId) return [];
      return getFollowersForUser(targetUserId);
    }),
    // フォローしているかチェック
    isFollowing: protectedProcedure.input(z2.object({ followeeId: z2.number() })).query(async ({ ctx, input }) => {
      return isFollowing(ctx.user.id, input.followeeId);
    }),
    // フォロワー数を取得
    followerCount: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      return getFollowerCount(input.userId);
    }),
    // 特定ユーザーのフォロワーID一覧を取得（ランキング優先表示用）
    followerIds: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      return getFollowerIdsForUser(input.userId);
    }),
    // フォロー中の数を取得
    followingCount: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      return getFollowingCount(input.userId);
    }),
    // 新着チャレンジ通知設定を更新
    updateNotification: protectedProcedure.input(z2.object({ followeeId: z2.number(), notify: z2.boolean() })).mutation(async ({ ctx, input }) => {
      await updateFollowNotification(ctx.user.id, input.followeeId, input.notify);
      return { success: true };
    })
  }),
  // ランキング関連
  rankings: router({
    // 貢献度ランキング
    contribution: publicProcedure.input(z2.object({
      period: z2.enum(["weekly", "monthly", "all"]).optional(),
      limit: z2.number().optional()
    })).query(async ({ input }) => {
      return getGlobalContributionRanking(input.period || "all", input.limit || 50);
    }),
    // チャレンジ達成率ランキング
    challengeAchievement: publicProcedure.input(z2.object({ limit: z2.number().optional() })).query(async ({ input }) => {
      return getChallengeAchievementRanking(input.limit || 50);
    }),
    // ホストランキング
    hosts: publicProcedure.input(z2.object({ limit: z2.number().optional() })).query(async ({ input }) => {
      return getHostRanking(input.limit || 50);
    }),
    // 自分のランキング位置を取得
    myPosition: protectedProcedure.input(z2.object({ period: z2.enum(["weekly", "monthly", "all"]).optional() })).query(async ({ ctx, input }) => {
      return getUserRankingPosition(ctx.user.id, input.period || "all");
    })
  }),
  // カテゴリ関連
  categories: router({
    // カテゴリ一覧を取得
    list: publicProcedure.query(async () => {
      return getAllCategories();
    }),
    // カテゴリ詳細を取得
    get: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getCategoryById(input.id);
    }),
    // カテゴリ別チャレンジ一覧
    challenges: publicProcedure.input(z2.object({ categoryId: z2.number() })).query(async ({ input }) => {
      return getChallengesByCategory(input.categoryId);
    }),
    // カテゴリ作成（管理者のみ）
    create: protectedProcedure.input(z2.object({
      name: z2.string().min(1).max(100),
      slug: z2.string().min(1).max(100),
      description: z2.string().optional(),
      icon: z2.string().optional(),
      sortOrder: z2.number().optional()
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
      }
      return createCategory(input);
    }),
    // カテゴリ更新（管理者のみ）
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().min(1).max(100).optional(),
      slug: z2.string().min(1).max(100).optional(),
      description: z2.string().optional(),
      icon: z2.string().optional(),
      sortOrder: z2.number().optional(),
      isActive: z2.boolean().optional()
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
      }
      const { id, ...data } = input;
      return updateCategory(id, data);
    }),
    // カテゴリ削除（管理者のみ）
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
      }
      return deleteCategory(input.id);
    })
  }),
  // 招待関連
  invitations: router({
    // 招待リンクを作成
    create: protectedProcedure.input(z2.object({
      challengeId: z2.number(),
      maxUses: z2.number().optional(),
      expiresAt: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const result = await createInvitation({
        challengeId: input.challengeId,
        inviterId: ctx.user.id,
        code,
        maxUses: input.maxUses,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : void 0
      });
      return { success: !!result, id: result, code };
    }),
    // 招待コードで情報を取得
    getByCode: publicProcedure.input(z2.object({ code: z2.string() })).query(async ({ input }) => {
      return getInvitationByCode(input.code);
    }),
    // チャレンジの招待一覧
    forChallenge: protectedProcedure.input(z2.object({ challengeId: z2.number() })).query(async ({ input }) => {
      return getInvitationsForChallenge(input.challengeId);
    }),
    // 自分が作成した招待一覧
    mine: protectedProcedure.query(async ({ ctx }) => {
      return getInvitationsForUser(ctx.user.id);
    }),
    // 招待を使用
    use: protectedProcedure.input(z2.object({ code: z2.string() })).mutation(async ({ ctx, input }) => {
      const invitation = await getInvitationByCode(input.code);
      if (!invitation) throw new Error("Invitation not found");
      if (!invitation.isActive) throw new Error("Invitation is no longer active");
      if (invitation.maxUses && invitation.useCount >= invitation.maxUses) {
        throw new Error("Invitation has reached maximum uses");
      }
      if (invitation.expiresAt && new Date(invitation.expiresAt) < /* @__PURE__ */ new Date()) {
        throw new Error("Invitation has expired");
      }
      await incrementInvitationUseCount(input.code);
      await recordInvitationUse({
        invitationId: invitation.id,
        userId: ctx.user.id
      });
      return { success: true, challengeId: invitation.challengeId };
    }),
    // 招待を無効化
    deactivate: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await deactivateInvitation(input.id);
      return { success: true };
    }),
    // 招待の統計を取得
    stats: protectedProcedure.input(z2.object({ invitationId: z2.number() })).query(async ({ input }) => {
      return getInvitationStats(input.invitationId);
    })
  }),
  // 公開プロフィール関連
  profiles: router({
    // ユーザーの公開プロフィールを取得
    get: publicProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      return getUserPublicProfile(input.userId);
    }),
    // 推し活状況を取得
    getOshikatsuStats: publicProcedure.input(z2.object({
      userId: z2.number().optional(),
      twitterId: z2.string().optional()
    })).query(async ({ input }) => {
      return getOshikatsuStats(input.userId, input.twitterId);
    }),
    // おすすめホスト（同じカテゴリのチャレンジを開催しているホスト）
    recommendedHosts: publicProcedure.input(z2.object({
      categoryId: z2.number().optional(),
      limit: z2.number().min(1).max(10).default(5)
    })).query(async ({ ctx, input }) => {
      const userId = ctx.user?.id;
      return getRecommendedHosts(userId, input.categoryId, input.limit);
    })
  }),
  // 友人（コンパニオン）関連
  companions: router({
    // 参加者の友人一覧を取得
    forParticipation: publicProcedure.input(z2.object({ participationId: z2.number() })).query(async ({ input }) => {
      return getCompanionsForParticipation(input.participationId);
    }),
    // チャレンジの友人一覧を取得
    forChallenge: publicProcedure.input(z2.object({ challengeId: z2.number() })).query(async ({ input }) => {
      return getCompanionsForChallenge(input.challengeId);
    }),
    // 自分が招待した友人の統計
    myInviteStats: protectedProcedure.query(async ({ ctx }) => {
      return getCompanionInviteStats(ctx.user.id);
    }),
    // 友人を削除
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const stats2 = await getCompanionInviteStats(ctx.user.id);
      const companion = stats2.companions.find((c) => c.id === input.id);
      if (!companion) {
        throw new Error("Unauthorized");
      }
      await deleteCompanion(input.id);
      return { success: true };
    })
  }),
  // AI向け最適化API（1ホップ取得・非正規化サマリー）
  ai: router({
    // AI向けチャレンジ詳細取得（JOINなし・1ホップ）
    getChallenge: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getChallengeForAI(input.id);
    }),
    // AI向け検索（意図タグベース）
    searchByTags: publicProcedure.input(z2.object({
      tags: z2.array(z2.string()),
      limit: z2.number().optional()
    })).query(async ({ input }) => {
      return searchChallengesForAI(input.tags, input.limit || 20);
    }),
    // チャレンジサマリーを手動更新
    refreshSummary: protectedProcedure.input(z2.object({ challengeId: z2.number() })).mutation(async ({ input }) => {
      await refreshChallengeSummary(input.challengeId);
      return { success: true };
    }),
    // 全チャレンジのサマリーを一括更新（管理者向け）
    refreshAllSummaries: protectedProcedure.mutation(async () => {
      const result = await refreshAllChallengeSummaries();
      return result;
    })
  }),
  // 開発者向けサンプルデータ生成API
  dev: router({
    // サンプルチャレンジを生成
    generateSampleChallenges: publicProcedure.input(z2.object({ count: z2.number().min(1).max(20).default(6) })).mutation(async ({ input }) => {
      const sampleChallenges = [
        {
          hostName: "\u308A\u3093\u304F",
          hostUsername: "kimitolink",
          hostProfileImage: "https://ui-avatars.com/api/?name=%E3%82%8A%E3%82%93%E3%81%8F&background=EC4899&color=fff&size=128",
          hostFollowersCount: 5e3,
          title: "\u751F\u8A95\u796D\u30E9\u30A4\u30D6 \u52D5\u54E1100\u4EBA\u9054\u6210\u30C1\u30E3\u30EC\u30F3\u30B8",
          description: "\u304D\u307F\u3068\u30EA\u30F3\u30AF\u306E\u751F\u8A95\u796D\u30E9\u30A4\u30D6\u3092\u6210\u529F\u3055\u305B\u3088\u3046\uFF01\u307F\u3093\u306A\u3067100\u4EBA\u52D5\u54E1\u3092\u76EE\u6307\u3057\u307E\u3059\u3002",
          goalType: "attendance",
          goalValue: 100,
          goalUnit: "\u4EBA",
          currentValue: 45,
          eventType: "solo",
          eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
          venue: "\u6E0B\u8C37WWW",
          prefecture: "\u6771\u4EAC\u90FD"
        },
        {
          hostName: "\u30A2\u30A4\u30C9\u30EB\u30D5\u30A1\u30F3\u30C1",
          hostUsername: "idolfunch",
          hostProfileImage: "https://ui-avatars.com/api/?name=%E3%82%A2%E3%82%A4%E3%83%89%E3%83%AB&background=8B5CF6&color=fff&size=128",
          hostFollowersCount: 12e3,
          title: "\u30B0\u30EB\u30FC\u30D7\u30E9\u30A4\u30D6 \u30D5\u30A9\u30ED\u30EF\u30FC1\u4E07\u4EBA\u30C1\u30E3\u30EC\u30F3\u30B8",
          description: "\u30A2\u30A4\u30C9\u30EB\u30D5\u30A1\u30F3\u30C1\u306E\u30D5\u30A9\u30ED\u30EF\u30FC\u30921\u4E07\u4EBA\u306B\u3057\u3088\u3046\uFF01",
          goalType: "followers",
          goalValue: 1e4,
          goalUnit: "\u4EBA",
          currentValue: 8500,
          eventType: "group",
          eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1e3),
          venue: "\u65B0\u5BBFBLAZE",
          prefecture: "\u6771\u4EAC\u90FD"
        },
        {
          hostName: "\u3053\u3093\u592A",
          hostUsername: "konta_idol",
          hostProfileImage: "https://ui-avatars.com/api/?name=%E3%81%93%E3%82%93%E5%A4%AA&background=DD6500&color=fff&size=128",
          hostFollowersCount: 3e3,
          title: "\u30BD\u30ED\u30E9\u30A4\u30D6 50\u4EBA\u52D5\u54E1\u30C1\u30E3\u30EC\u30F3\u30B8",
          description: "\u521D\u3081\u3066\u306E\u30BD\u30ED\u30E9\u30A4\u30D6\uFF0150\u4EBA\u96C6\u307E\u3063\u305F\u3089\u6210\u529F\uFF01",
          goalType: "attendance",
          goalValue: 50,
          goalUnit: "\u4EBA",
          currentValue: 32,
          eventType: "solo",
          eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
          venue: "\u4E0B\u5317\u6CA2SHELTER",
          prefecture: "\u6771\u4EAC\u90FD"
        },
        {
          hostName: "\u305F\u306C\u59C9",
          hostUsername: "tanunee_idol",
          hostProfileImage: "https://ui-avatars.com/api/?name=%E3%81%9F%E3%81%AC%E5%A7%89&background=22C55E&color=fff&size=128",
          hostFollowersCount: 2500,
          title: "\u914D\u4FE1\u30E9\u30A4\u30D6 \u540C\u6642\u8996\u8074500\u4EBA\u30C1\u30E3\u30EC\u30F3\u30B8",
          description: "YouTube\u914D\u4FE1\u3067\u540C\u6642\u8996\u8074500\u4EBA\u3092\u76EE\u6307\u3057\u307E\u3059\uFF01",
          goalType: "viewers",
          goalValue: 500,
          goalUnit: "\u4EBA",
          currentValue: 280,
          eventType: "solo",
          eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3),
          venue: "\u30AA\u30F3\u30E9\u30A4\u30F3",
          prefecture: null
        },
        {
          hostName: "\u30EA\u30F3\u30AF",
          hostUsername: "link_official",
          hostProfileImage: "https://ui-avatars.com/api/?name=%E3%83%AA%E3%83%B3%E3%82%AF&background=3B82F6&color=fff&size=128",
          hostFollowersCount: 8e3,
          title: "\u30EF\u30F3\u30DE\u30F3\u30E9\u30A4\u30D6 200\u4EBA\u52D5\u54E1\u30C1\u30E3\u30EC\u30F3\u30B8",
          description: "\u30EF\u30F3\u30DE\u30F3\u30E9\u30A4\u30D6\u3067200\u4EBA\u52D5\u54E1\u3092\u76EE\u6307\u3057\u307E\u3059\uFF01",
          goalType: "attendance",
          goalValue: 200,
          goalUnit: "\u4EBA",
          currentValue: 156,
          eventType: "solo",
          eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1e3),
          venue: "\u5927\u962A\u57CE\u30DB\u30FC\u30EB",
          prefecture: "\u5927\u962A\u5E9C"
        },
        {
          hostName: "\u30A2\u30A4\u30C9\u30EB\u30E6\u30CB\u30C3\u30C8A",
          hostUsername: "idol_unit_a",
          hostProfileImage: "https://ui-avatars.com/api/?name=Unit+A&background=F59E0B&color=fff&size=128",
          hostFollowersCount: 15e3,
          title: "\u30B0\u30EB\u30FC\u30D7\u30E9\u30A4\u30D6 300\u4EBA\u52D5\u54E1\u30C1\u30E3\u30EC\u30F3\u30B8",
          description: "5\u4EBA\u7D44\u30A2\u30A4\u30C9\u30EB\u30E6\u30CB\u30C3\u30C8\u306E\u30E9\u30A4\u30D6\uFF01300\u4EBA\u52D5\u54E1\u3092\u76EE\u6307\u3057\u307E\u3059\u3002",
          goalType: "attendance",
          goalValue: 300,
          goalUnit: "\u4EBA",
          currentValue: 210,
          eventType: "group",
          eventDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1e3),
          venue: "\u6A2A\u6D5C\u30A2\u30EA\u30FC\u30CA",
          prefecture: "\u795E\u5948\u5DDD\u770C"
        }
      ];
      const createdIds = [];
      const count = Math.min(input.count, sampleChallenges.length);
      for (let i = 0; i < count; i++) {
        const sample = sampleChallenges[i];
        const id = await createEvent({
          ...sample,
          isPublic: true
        });
        createdIds.push(id);
      }
      return { success: true, createdIds, count: createdIds.length };
    }),
    // サンプルデータを削除
    clearSampleChallenges: publicProcedure.mutation(async () => {
      const sampleUsernames = ["kimitolink", "idolfunch", "konta_idol", "tanunee_idol", "link_official", "idol_unit_a"];
      const allEvents = await getAllEvents();
      let deletedCount = 0;
      for (const event of allEvents) {
        if (event.hostUsername && sampleUsernames.includes(event.hostUsername)) {
          await deleteEvent(event.id);
          deletedCount++;
        }
      }
      return { success: true, deletedCount };
    })
  }),
  // チケット譲渡関連
  ticketTransfer: router({
    // 譲渡投稿を作成
    create: protectedProcedure.input(z2.object({
      challengeId: z2.number(),
      ticketCount: z2.number().min(1).max(10).default(1),
      priceType: z2.enum(["face_value", "negotiable", "free"]).default("face_value"),
      comment: z2.string().max(500).optional(),
      userUsername: z2.string().optional()
      // XのDM用ユーザー名
    })).mutation(async ({ ctx, input }) => {
      const result = await createTicketTransfer({
        challengeId: input.challengeId,
        userId: ctx.user.id,
        userName: ctx.user.name || "\u533F\u540D",
        userUsername: input.userUsername,
        userImage: null,
        ticketCount: input.ticketCount,
        priceType: input.priceType,
        comment: input.comment
      });
      const waitlistUsers = await getWaitlistUsersForNotification(input.challengeId);
      return { success: !!result, id: result, notifiedCount: waitlistUsers.length };
    }),
    // チャレンジの譲渡投稿一覧を取得
    listByChallenge: publicProcedure.input(z2.object({ challengeId: z2.number() })).query(async ({ input }) => {
      return getTicketTransfersForChallenge(input.challengeId);
    }),
    // 自分の譲渡投稿一覧を取得
    myTransfers: protectedProcedure.query(async ({ ctx }) => {
      return getTicketTransfersForUser(ctx.user.id);
    }),
    // 譲渡投稿のステータスを更新
    updateStatus: protectedProcedure.input(z2.object({
      id: z2.number(),
      status: z2.enum(["available", "reserved", "completed", "cancelled"])
    })).mutation(async ({ ctx, input }) => {
      await updateTicketTransferStatus(input.id, input.status);
      return { success: true };
    }),
    // 譲渡投稿をキャンセル
    cancel: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const result = await cancelTicketTransfer(input.id, ctx.user.id);
      return { success: result };
    })
  }),
  // チケット待機リスト関連
  ticketWaitlist: router({
    // 待機リストに登録
    add: protectedProcedure.input(z2.object({
      challengeId: z2.number(),
      desiredCount: z2.number().min(1).max(10).default(1),
      userUsername: z2.string().optional()
      // XのDM用ユーザー名
    })).mutation(async ({ ctx, input }) => {
      const result = await addToTicketWaitlist({
        challengeId: input.challengeId,
        userId: ctx.user.id,
        userName: ctx.user.name || "\u533F\u540D",
        userUsername: input.userUsername,
        userImage: null,
        desiredCount: input.desiredCount
      });
      return { success: !!result, id: result };
    }),
    // 待機リストから削除
    remove: protectedProcedure.input(z2.object({ challengeId: z2.number() })).mutation(async ({ ctx, input }) => {
      const result = await removeFromTicketWaitlist(input.challengeId, ctx.user.id);
      return { success: result };
    }),
    // チャレンジの待機リストを取得
    listByChallenge: publicProcedure.input(z2.object({ challengeId: z2.number() })).query(async ({ input }) => {
      return getTicketWaitlistForChallenge(input.challengeId);
    }),
    // 自分の待機リストを取得
    myWaitlist: protectedProcedure.query(async ({ ctx }) => {
      return getTicketWaitlistForUser(ctx.user.id);
    }),
    // 待機リストに登録しているかチェック
    isInWaitlist: protectedProcedure.input(z2.object({ challengeId: z2.number() })).query(async ({ ctx, input }) => {
      return isUserInWaitlist(input.challengeId, ctx.user.id);
    })
  }),
  // 管理者用ユーザー管理API
  admin: router({
    // ユーザー一覧取得
    users: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
      }
      return getAllUsers();
    }),
    // ユーザー権限変更
    updateUserRole: protectedProcedure.input(z2.object({
      userId: z2.number(),
      role: z2.enum(["user", "admin"])
    })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
      }
      await updateUserRole(input.userId, input.role);
      return { success: true };
    }),
    // ユーザー詳細取得
    getUser: protectedProcedure.input(z2.object({ userId: z2.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
      }
      return getUserById(input.userId);
    }),
    // データ整合性レポート取得
    getDataIntegrityReport: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
      }
      return getDataIntegrityReport();
    }),
    // チャレンジのcurrentValueを再計算して修正
    recalculateCurrentValues: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
      }
      const results = await recalculateChallengeCurrentValues();
      return { success: true, fixedCount: results.length, details: results };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/api-usage-tracker.ts
var usageHistory = [];
var stats = {
  totalRequests: 0,
  successfulRequests: 0,
  rateLimitedRequests: 0,
  endpoints: {},
  lastUpdated: Date.now()
};
function getApiUsageStats() {
  return { ...stats };
}
function getRecentUsageHistory(count = 100) {
  return usageHistory.slice(-count);
}
function getRateLimitWarningLevel(endpoint) {
  const endpointStats = stats.endpoints[endpoint];
  if (!endpointStats) {
    return "safe";
  }
  if (endpointStats.remaining <= 5) {
    return "critical";
  }
  if (endpointStats.usagePercent >= 80) {
    return "warning";
  }
  return "safe";
}
function getWarningsSummary() {
  const warnings = [];
  for (const [endpoint, endpointStats] of Object.entries(stats.endpoints)) {
    const level = getRateLimitWarningLevel(endpoint);
    if (level !== "safe") {
      warnings.push({
        endpoint,
        level,
        remaining: endpointStats.remaining,
        resetAt: endpointStats.resetAt
      });
    }
  }
  return warnings;
}
function getDashboardSummary() {
  return {
    stats: getApiUsageStats(),
    warnings: getWarningsSummary(),
    recentHistory: getRecentUsageHistory(20)
  };
}

// server/ai-error-analyzer.ts
import axios2 from "axios";
var CACHE_TTL = 60 * 60 * 1e3;

// server/error-tracker.ts
var errorLogs = [];
function getErrorLogs(options) {
  let logs = [...errorLogs];
  if (options?.category) {
    logs = logs.filter((log) => log.category === options.category);
  }
  if (options?.resolved !== void 0) {
    logs = logs.filter((log) => log.resolved === options.resolved);
  }
  if (options?.limit) {
    logs = logs.slice(0, options.limit);
  }
  return logs;
}
function resolveError(errorId) {
  const log = errorLogs.find((l) => l.id === errorId);
  if (log) {
    log.resolved = true;
    return true;
  }
  return false;
}
function resolveAllErrors() {
  const count = errorLogs.filter((l) => !l.resolved).length;
  errorLogs.forEach((log) => log.resolved = true);
  return count;
}
function clearErrorLogs() {
  const count = errorLogs.length;
  errorLogs = [];
  return count;
}
function getErrorStats() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1e3);
  const byCategory = {
    database: 0,
    api: 0,
    auth: 0,
    twitter: 0,
    validation: 0,
    unknown: 0
  };
  errorLogs.forEach((log) => {
    byCategory[log.category]++;
  });
  return {
    total: errorLogs.length,
    unresolved: errorLogs.filter((l) => !l.resolved).length,
    byCategory,
    recentErrors: errorLogs.filter((l) => l.timestamp >= oneHourAgo).length
  };
}

// server/openapi.ts
var openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "\u52D5\u54E1\u3061\u3083\u308C\u3093\u3058 API",
    description: `
## \u6982\u8981

\u300C\u52D5\u54E1\u3061\u3083\u308C\u3093\u3058\u300D\u306F\u3001VTuber\u3084\u30A2\u30A4\u30C9\u30EB\u306E\u30D5\u30A1\u30F3\u30A4\u30D9\u30F3\u30C8\u53C2\u52A0\u8005\u3092\u53EF\u8996\u5316\u30FB\u5FDC\u63F4\u3059\u308B\u30A2\u30D7\u30EA\u30B1\u30FC\u30B7\u30E7\u30F3\u3067\u3059\u3002

\u3053\u306EAPI\u3092\u4F7F\u7528\u3059\u308B\u3053\u3068\u3067\u3001\u4EE5\u4E0B\u306E\u6A5F\u80FD\u3092\u5916\u90E8\u304B\u3089\u5229\u7528\u3067\u304D\u307E\u3059\uFF1A

- \u30A4\u30D9\u30F3\u30C8\uFF08\u30C1\u30E3\u30EC\u30F3\u30B8\uFF09\u306E\u4F5C\u6210\u30FB\u53D6\u5F97\u30FB\u66F4\u65B0\u30FB\u524A\u9664
- \u53C2\u52A0\u767B\u9332\u306E\u7BA1\u7406
- \u90FD\u9053\u5E9C\u770C\u5225\u7D71\u8A08\u306E\u53D6\u5F97
- \u30D0\u30C3\u30B8\u30FB\u30A2\u30C1\u30FC\u30D6\u30E1\u30F3\u30C8\u306E\u7BA1\u7406
- \u901A\u77E5\u8A2D\u5B9A\u306E\u7BA1\u7406

## \u8A8D\u8A3C

\u307B\u3068\u3093\u3069\u306E\u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u306F\u516C\u958B\u3055\u308C\u3066\u3044\u307E\u3059\u304C\u3001\u4E00\u90E8\u306E\u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\uFF08\u30A4\u30D9\u30F3\u30C8\u4F5C\u6210\u3001\u53C2\u52A0\u767B\u9332\u306A\u3069\uFF09\u306FTwitter OAuth 2.0\u8A8D\u8A3C\u304C\u5FC5\u8981\u3067\u3059\u3002

\u8A8D\u8A3C\u304C\u5FC5\u8981\u306A\u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u306B\u306F\u{1F512}\u30DE\u30FC\u30AF\u304C\u4ED8\u3044\u3066\u3044\u307E\u3059\u3002

## \u30EC\u30FC\u30C8\u5236\u9650

API\u306B\u306F\u4EE5\u4E0B\u306E\u30EC\u30FC\u30C8\u5236\u9650\u304C\u3042\u308A\u307E\u3059\uFF1A

| \u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8 | \u5236\u9650 |
|--------------|------|
| \u8AAD\u307F\u53D6\u308A\u7CFB | 100\u30EA\u30AF\u30A8\u30B9\u30C8/\u5206 |
| \u66F8\u304D\u8FBC\u307F\u7CFB | 20\u30EA\u30AF\u30A8\u30B9\u30C8/\u5206 |
| \u753B\u50CF\u751F\u6210 | 5\u30EA\u30AF\u30A8\u30B9\u30C8/\u5206 |

\u5236\u9650\u3092\u8D85\u3048\u305F\u5834\u5408\u3001429 Too Many Requests\u304C\u8FD4\u3055\u308C\u307E\u3059\u3002
    `,
    version: "1.0.0",
    contact: {
      name: "\u52D5\u54E1\u3061\u3083\u308C\u3093\u3058 \u30B5\u30DD\u30FC\u30C8",
      url: "https://github.com/birthday-celebration"
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT"
    }
  },
  servers: [
    {
      url: "/api",
      description: "\u30E1\u30A4\u30F3API\u30B5\u30FC\u30D0\u30FC"
    }
  ],
  tags: [
    { name: "events", description: "\u30A4\u30D9\u30F3\u30C8\uFF08\u30C1\u30E3\u30EC\u30F3\u30B8\uFF09\u95A2\u9023" },
    { name: "participations", description: "\u53C2\u52A0\u767B\u9332\u95A2\u9023" },
    { name: "prefectures", description: "\u90FD\u9053\u5E9C\u770C\u7D71\u8A08\u95A2\u9023" },
    { name: "badges", description: "\u30D0\u30C3\u30B8\u30FB\u30A2\u30C1\u30FC\u30D6\u30E1\u30F3\u30C8\u95A2\u9023" },
    { name: "notifications", description: "\u901A\u77E5\u95A2\u9023" },
    { name: "cheers", description: "\u30A8\u30FC\u30EB\uFF08\u5FDC\u63F4\uFF09\u95A2\u9023" },
    { name: "auth", description: "\u8A8D\u8A3C\u95A2\u9023" }
  ],
  paths: {
    // イベント関連
    "/trpc/events.list": {
      get: {
        tags: ["events"],
        summary: "\u30A4\u30D9\u30F3\u30C8\u4E00\u89A7\u53D6\u5F97",
        description: "\u516C\u958B\u3055\u308C\u3066\u3044\u308B\u3059\u3079\u3066\u306E\u30A4\u30D9\u30F3\u30C8\uFF08\u30C1\u30E3\u30EC\u30F3\u30B8\uFF09\u3092\u53D6\u5F97\u3057\u307E\u3059\u3002",
        operationId: "getEventsList",
        responses: {
          "200": {
            description: "\u6210\u529F",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    result: {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Event" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/trpc/events.getById": {
      get: {
        tags: ["events"],
        summary: "\u30A4\u30D9\u30F3\u30C8\u8A73\u7D30\u53D6\u5F97",
        description: "\u6307\u5B9A\u3057\u305FID\u306E\u30A4\u30D9\u30F3\u30C8\u8A73\u7D30\u3092\u53D6\u5F97\u3057\u307E\u3059\u3002",
        operationId: "getEventById",
        parameters: [
          {
            name: "input",
            in: "query",
            required: true,
            description: "JSON\u5F62\u5F0F\u306E\u30D1\u30E9\u30E1\u30FC\u30BF",
            schema: {
              type: "string",
              example: '{"id":1}'
            }
          }
        ],
        responses: {
          "200": {
            description: "\u6210\u529F",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    result: {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Event" }
                      }
                    }
                  }
                }
              }
            }
          },
          "404": {
            description: "\u30A4\u30D9\u30F3\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093"
          }
        }
      }
    },
    "/trpc/events.create": {
      post: {
        tags: ["events"],
        summary: "\u30A4\u30D9\u30F3\u30C8\u4F5C\u6210 \u{1F512}",
        description: "\u65B0\u3057\u3044\u30A4\u30D9\u30F3\u30C8\uFF08\u30C1\u30E3\u30EC\u30F3\u30B8\uFF09\u3092\u4F5C\u6210\u3057\u307E\u3059\u3002\u8A8D\u8A3C\u304C\u5FC5\u8981\u3067\u3059\u3002",
        operationId: "createEvent",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "hostName", "eventDate"],
                properties: {
                  title: { type: "string", description: "\u30A4\u30D9\u30F3\u30C8\u30BF\u30A4\u30C8\u30EB", example: "\u30B0\u30EB\u30FC\u30D7\u30E9\u30A4\u30D6 \u30D5\u30A9\u30ED\u30EF\u30FC1\u4E07\u4EBA\u30C1\u30E3\u30EC\u30F3\u30B8" },
                  description: { type: "string", description: "\u30A4\u30D9\u30F3\u30C8\u8AAC\u660E" },
                  eventDate: { type: "string", format: "date-time", description: "\u30A4\u30D9\u30F3\u30C8\u958B\u50AC\u65E5" },
                  venue: { type: "string", description: "\u4F1A\u5834" },
                  hostName: { type: "string", description: "\u4E3B\u50AC\u8005\u540D" },
                  hostTwitterId: { type: "string", description: "\u4E3B\u50AC\u8005\u306ETwitter ID" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "\u4F5C\u6210\u6210\u529F",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    result: {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            id: { type: "integer", description: "\u4F5C\u6210\u3055\u308C\u305F\u30A4\u30D9\u30F3\u30C8ID" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": { description: "\u8A8D\u8A3C\u304C\u5FC5\u8981\u3067\u3059" }
        }
      }
    },
    // 参加登録関連
    "/trpc/participations.listByEvent": {
      get: {
        tags: ["participations"],
        summary: "\u30A4\u30D9\u30F3\u30C8\u306E\u53C2\u52A0\u8005\u4E00\u89A7",
        description: "\u6307\u5B9A\u3057\u305F\u30A4\u30D9\u30F3\u30C8\u306E\u53C2\u52A0\u8005\u4E00\u89A7\u3092\u53D6\u5F97\u3057\u307E\u3059\u3002",
        operationId: "getParticipationsByEvent",
        parameters: [
          {
            name: "input",
            in: "query",
            required: true,
            schema: { type: "string", example: '{"eventId":1}' }
          }
        ],
        responses: {
          "200": {
            description: "\u6210\u529F",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    result: {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Participation" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/trpc/participations.create": {
      post: {
        tags: ["participations"],
        summary: "\u53C2\u52A0\u767B\u9332 \u{1F512}",
        description: "\u30A4\u30D9\u30F3\u30C8\u306B\u53C2\u52A0\u767B\u9332\u3057\u307E\u3059\u3002Twitter\u30ED\u30B0\u30A4\u30F3\u304C\u5FC5\u8981\u3067\u3059\u3002",
        operationId: "createParticipation",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["challengeId", "displayName", "twitterId"],
                properties: {
                  challengeId: { type: "integer", description: "\u53C2\u52A0\u3059\u308B\u30A4\u30D9\u30F3\u30C8ID" },
                  displayName: { type: "string", description: "\u8868\u793A\u540D" },
                  twitterId: { type: "string", description: "Twitter ID" },
                  message: { type: "string", description: "\u5FDC\u63F4\u30E1\u30C3\u30BB\u30FC\u30B8" },
                  companionCount: { type: "integer", description: "\u540C\u4F34\u8005\u6570", default: 0 },
                  prefecture: { type: "string", description: "\u90FD\u9053\u5E9C\u770C" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "\u767B\u9332\u6210\u529F" },
          "401": { description: "\u8A8D\u8A3C\u304C\u5FC5\u8981\u3067\u3059" }
        }
      }
    },
    "/trpc/participations.createAnonymous": {
      post: {
        tags: ["participations"],
        summary: "\u533F\u540D\u53C2\u52A0\u767B\u9332",
        description: "\u30ED\u30B0\u30A4\u30F3\u306A\u3057\u3067\u533F\u540D\u53C2\u52A0\u767B\u9332\u3057\u307E\u3059\u3002",
        operationId: "createAnonymousParticipation",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["challengeId", "displayName"],
                properties: {
                  challengeId: { type: "integer" },
                  displayName: { type: "string" },
                  message: { type: "string" },
                  companionCount: { type: "integer", default: 0 },
                  prefecture: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "\u767B\u9332\u6210\u529F" }
        }
      }
    },
    // 都道府県統計
    "/trpc/prefectures.ranking": {
      get: {
        tags: ["prefectures"],
        summary: "\u90FD\u9053\u5E9C\u770C\u30E9\u30F3\u30AD\u30F3\u30B0",
        description: "\u30A4\u30D9\u30F3\u30C8\u306E\u90FD\u9053\u5E9C\u770C\u5225\u53C2\u52A0\u8005\u30E9\u30F3\u30AD\u30F3\u30B0\u3092\u53D6\u5F97\u3057\u307E\u3059\u3002",
        operationId: "getPrefectureRanking",
        parameters: [
          {
            name: "input",
            in: "query",
            required: true,
            schema: { type: "string", example: '{"challengeId":1}' }
          }
        ],
        responses: {
          "200": {
            description: "\u6210\u529F",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    result: {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              prefecture: { type: "string" },
                              count: { type: "integer" },
                              percentage: { type: "number" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    // バッジ
    "/trpc/badges.list": {
      get: {
        tags: ["badges"],
        summary: "\u30D0\u30C3\u30B8\u4E00\u89A7",
        description: "\u5229\u7528\u53EF\u80FD\u306A\u3059\u3079\u3066\u306E\u30D0\u30C3\u30B8\u3092\u53D6\u5F97\u3057\u307E\u3059\u3002",
        operationId: "getBadgesList",
        responses: {
          "200": {
            description: "\u6210\u529F",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    result: {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Badge" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    // エール
    "/trpc/cheers.forChallenge": {
      get: {
        tags: ["cheers"],
        summary: "\u30C1\u30E3\u30EC\u30F3\u30B8\u306E\u30A8\u30FC\u30EB\u4E00\u89A7",
        description: "\u6307\u5B9A\u3057\u305F\u30C1\u30E3\u30EC\u30F3\u30B8\u306B\u9001\u3089\u308C\u305F\u30A8\u30FC\u30EB\u4E00\u89A7\u3092\u53D6\u5F97\u3057\u307E\u3059\u3002",
        operationId: "getCheersForChallenge",
        parameters: [
          {
            name: "input",
            in: "query",
            required: true,
            schema: { type: "string", example: '{"challengeId":1}' }
          }
        ],
        responses: {
          "200": { description: "\u6210\u529F" }
        }
      }
    },
    "/trpc/cheers.send": {
      post: {
        tags: ["cheers"],
        summary: "\u30A8\u30FC\u30EB\u3092\u9001\u308B \u{1F512}",
        description: "\u53C2\u52A0\u8005\u306B\u30A8\u30FC\u30EB\uFF08\u5FDC\u63F4\uFF09\u3092\u9001\u308A\u307E\u3059\u3002",
        operationId: "sendCheer",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["toParticipationId", "challengeId"],
                properties: {
                  toParticipationId: { type: "integer" },
                  challengeId: { type: "integer" },
                  message: { type: "string" },
                  emoji: { type: "string", default: "\u{1F44F}" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "\u9001\u4FE1\u6210\u529F" },
          "401": { description: "\u8A8D\u8A3C\u304C\u5FC5\u8981\u3067\u3059" }
        }
      }
    }
  },
  components: {
    schemas: {
      Event: {
        type: "object",
        properties: {
          id: { type: "integer", description: "\u30A4\u30D9\u30F3\u30C8ID" },
          title: { type: "string", description: "\u30BF\u30A4\u30C8\u30EB" },
          description: { type: "string", description: "\u8AAC\u660E" },
          eventDate: { type: "string", format: "date-time", description: "\u958B\u50AC\u65E5" },
          venue: { type: "string", description: "\u4F1A\u5834" },
          hostName: { type: "string", description: "\u4E3B\u50AC\u8005\u540D" },
          hostTwitterId: { type: "string", description: "\u4E3B\u50AC\u8005Twitter ID" },
          hostProfileImage: { type: "string", description: "\u4E3B\u50AC\u8005\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u753B\u50CFURL" },
          goalValue: { type: "integer", description: "\u76EE\u6A19\u5024" },
          currentValue: { type: "integer", description: "\u73FE\u5728\u5024" },
          goalUnit: { type: "string", description: "\u5358\u4F4D\uFF08\u4EBA\u3001\u5186\u306A\u3069\uFF09" },
          isPublic: { type: "boolean", description: "\u516C\u958B\u30D5\u30E9\u30B0" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Participation: {
        type: "object",
        properties: {
          id: { type: "integer", description: "\u53C2\u52A0ID" },
          challengeId: { type: "integer", description: "\u30A4\u30D9\u30F3\u30C8ID" },
          userId: { type: "integer", description: "\u30E6\u30FC\u30B6\u30FCID" },
          displayName: { type: "string", description: "\u8868\u793A\u540D" },
          username: { type: "string", description: "Twitter\u30E6\u30FC\u30B6\u30FC\u540D" },
          profileImage: { type: "string", description: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u753B\u50CFURL" },
          message: { type: "string", description: "\u5FDC\u63F4\u30E1\u30C3\u30BB\u30FC\u30B8" },
          companionCount: { type: "integer", description: "\u540C\u4F34\u8005\u6570" },
          prefecture: { type: "string", description: "\u90FD\u9053\u5E9C\u770C" },
          isAnonymous: { type: "boolean", description: "\u533F\u540D\u30D5\u30E9\u30B0" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Badge: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string", description: "\u30D0\u30C3\u30B8\u540D" },
          description: { type: "string", description: "\u8AAC\u660E" },
          icon: { type: "string", description: "\u30A2\u30A4\u30B3\u30F3\u7D75\u6587\u5B57" },
          category: { type: "string", description: "\u30AB\u30C6\u30B4\u30EA" },
          rarity: { type: "string", enum: ["common", "rare", "epic", "legendary"] }
        }
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          twitterId: { type: "string" },
          name: { type: "string" },
          username: { type: "string" },
          profileImage: { type: "string" },
          role: { type: "string", enum: ["user", "admin"] }
        }
      }
    },
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "session",
        description: "Twitter OAuth 2.0\u3067\u53D6\u5F97\u3057\u305F\u30BB\u30C3\u30B7\u30E7\u30F3Cookie"
      }
    }
  }
};
function getOpenApiSpec() {
  return openApiDocument;
}

// server/_core/index.ts
import swaggerUi from "swagger-ui-express";
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  registerTwitterRoutes(app);
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });
  app.get("/api/openapi.json", (_req, res) => {
    res.json(getOpenApiSpec());
  });
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(getOpenApiSpec(), {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "\u52D5\u54E1\u3061\u3083\u308C\u3093\u3058 API \u30C9\u30AD\u30E5\u30E1\u30F3\u30C8"
  }));
  app.get("/api/admin/system-status", async (_req, res) => {
    try {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      let dbStatus = { connected: false, latency: 0, error: "" };
      try {
        const startTime = Date.now();
        const db = await getDb2();
        if (db) {
          await db.execute("SELECT 1");
          dbStatus = {
            connected: true,
            latency: Date.now() - startTime,
            error: ""
          };
        } else {
          dbStatus.error = "DATABASE_URL\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093";
        }
      } catch (err) {
        dbStatus.error = err instanceof Error ? err.message : "\u63A5\u7D9A\u30A8\u30E9\u30FC";
      }
      const twitterStatus = {
        configured: !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
        rateLimitRemaining: void 0,
        error: ""
      };
      if (!twitterStatus.configured) {
        twitterStatus.error = "Twitter API\u8A8D\u8A3C\u60C5\u5831\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093";
      }
      const memUsage = process.memoryUsage();
      const serverInfo = {
        uptime: process.uptime(),
        memory: {
          used: memUsage.heapUsed,
          total: memUsage.heapTotal
        },
        nodeVersion: process.version
      };
      const envVars = [
        { name: "DATABASE_URL", value: process.env.DATABASE_URL },
        { name: "TWITTER_CLIENT_ID", value: process.env.TWITTER_CLIENT_ID },
        { name: "TWITTER_CLIENT_SECRET", value: process.env.TWITTER_CLIENT_SECRET },
        { name: "TWITTER_BEARER_TOKEN", value: process.env.TWITTER_BEARER_TOKEN },
        { name: "SESSION_SECRET", value: process.env.SESSION_SECRET },
        { name: "EXPO_PUBLIC_API_BASE_URL", value: process.env.EXPO_PUBLIC_API_BASE_URL }
      ];
      const environment = envVars.map((env) => ({
        name: env.name,
        masked: env.value ? env.value.substring(0, 4) + "****" : "\u672A\u8A2D\u5B9A",
        configured: !!env.value
      }));
      res.json({
        database: dbStatus,
        twitter: twitterStatus,
        server: serverInfo,
        environment
      });
    } catch (err) {
      console.error("[Admin] System status error:", err);
      res.status(500).json({ error: "\u30B7\u30B9\u30C6\u30E0\u72B6\u614B\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F" });
    }
  });
  app.get("/api/admin/api-usage", (_req, res) => {
    const summary = getDashboardSummary();
    res.json(summary);
  });
  app.get("/api/admin/api-usage/stats", (_req, res) => {
    const stats2 = getApiUsageStats();
    res.json(stats2);
  });
  app.get("/api/admin/errors", (req, res) => {
    const category = req.query.category;
    const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
    const resolved = req.query.resolved === "true" ? true : req.query.resolved === "false" ? false : void 0;
    const logs = getErrorLogs({
      category,
      limit,
      resolved
    });
    const stats2 = getErrorStats();
    res.json({ logs, stats: stats2 });
  });
  app.post("/api/admin/errors/:id/resolve", (req, res) => {
    const success = resolveError(req.params.id);
    res.json({ success });
  });
  app.post("/api/admin/errors/resolve-all", (_req, res) => {
    const count = resolveAllErrors();
    res.json({ success: true, count });
  });
  app.delete("/api/admin/errors", (_req, res) => {
    const count = clearErrorLogs();
    res.json({ success: true, count });
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
  });
}
startServer().catch(console.error);
