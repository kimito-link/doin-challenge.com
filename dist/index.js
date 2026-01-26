var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/db/connection.ts
import { eq, desc, and, sql, isNull, or, gte, lte, lt, inArray, asc, ne, like, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
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
var _db;
var init_connection = __esm({
  "server/db/connection.ts"() {
    "use strict";
    _db = null;
  }
});

// drizzle/schema/users.ts
import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, boolean } from "drizzle-orm/mysql-core";
var users, twitterFollowStatus, oauthPkceData, twitterUserCache;
var init_users = __esm({
  "drizzle/schema/users.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: int("id").autoincrement().primaryKey(),
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
      gender: mysqlEnum("gender", ["male", "female", "other"]),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    twitterFollowStatus = mysqlTable("twitter_follow_status", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      twitterId: varchar("twitterId", { length: 64 }).notNull(),
      twitterUsername: varchar("twitterUsername", { length: 255 }),
      targetTwitterId: varchar("targetTwitterId", { length: 64 }).notNull(),
      targetUsername: varchar("targetUsername", { length: 255 }).notNull(),
      isFollowing: boolean("isFollowing").default(false).notNull(),
      lastCheckedAt: timestamp("lastCheckedAt").defaultNow().notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    oauthPkceData = mysqlTable("oauth_pkce_data", {
      id: int("id").autoincrement().primaryKey(),
      state: varchar("state", { length: 64 }).notNull().unique(),
      codeVerifier: varchar("codeVerifier", { length: 128 }).notNull(),
      callbackUrl: text("callbackUrl").notNull(),
      expiresAt: timestamp("expiresAt").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    twitterUserCache = mysqlTable("twitter_user_cache", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
  }
});

// drizzle/schema/challenges.ts
import { mysqlTable as mysqlTable2, int as int2, varchar as varchar2, text as text2, timestamp as timestamp2, mysqlEnum as mysqlEnum2, boolean as boolean2, json as json2 } from "drizzle-orm/mysql-core";
var challenges, events, categories, challengeTemplates, challengeStats, challengeMembers;
var init_challenges = __esm({
  "drizzle/schema/challenges.ts"() {
    "use strict";
    challenges = mysqlTable2("challenges", {
      id: int2("id").autoincrement().primaryKey(),
      // ホスト（主催者）の情報
      hostUserId: int2("hostUserId"),
      hostTwitterId: varchar2("hostTwitterId", { length: 64 }),
      hostName: varchar2("hostName", { length: 255 }).notNull(),
      hostUsername: varchar2("hostUsername", { length: 255 }),
      hostProfileImage: text2("hostProfileImage"),
      hostFollowersCount: int2("hostFollowersCount").default(0),
      hostDescription: text2("hostDescription"),
      hostGender: mysqlEnum2("hostGender", ["male", "female", "other"]),
      // チャレンジ情報
      title: varchar2("title", { length: 255 }).notNull(),
      slug: varchar2("slug", { length: 255 }),
      description: text2("description"),
      // 目標設定
      goalType: mysqlEnum2("goalType", ["attendance", "followers", "viewers", "points", "custom"]).default("attendance").notNull(),
      goalValue: int2("goalValue").default(100).notNull(),
      goalUnit: varchar2("goalUnit", { length: 32 }).default("\u4EBA").notNull(),
      currentValue: int2("currentValue").default(0).notNull(),
      // イベント種別
      eventType: mysqlEnum2("eventType", ["solo", "group"]).default("solo").notNull(),
      // カテゴリ
      categoryId: int2("categoryId"),
      // 日時・場所
      eventDate: timestamp2("eventDate").notNull(),
      venue: varchar2("venue", { length: 255 }),
      prefecture: varchar2("prefecture", { length: 32 }),
      // チケット情報
      ticketPresale: int2("ticketPresale"),
      ticketDoor: int2("ticketDoor"),
      ticketSaleStart: timestamp2("ticketSaleStart"),
      ticketUrl: text2("ticketUrl"),
      // 外部リンク
      externalUrl: text2("externalUrl"),
      // ステータス
      status: mysqlEnum2("status", ["upcoming", "active", "ended"]).default("active").notNull(),
      isPublic: boolean2("isPublic").default(true).notNull(),
      // メタデータ
      createdAt: timestamp2("createdAt").defaultNow().notNull(),
      updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull(),
      // AI向け最適化カラム
      aiSummary: text2("aiSummary"),
      intentTags: json2("intentTags").$type(),
      regionSummary: json2("regionSummary").$type(),
      participantSummary: json2("participantSummary").$type(),
      aiSummaryUpdatedAt: timestamp2("aiSummaryUpdatedAt")
    });
    events = challenges;
    categories = mysqlTable2("categories", {
      id: int2("id").autoincrement().primaryKey(),
      name: varchar2("name", { length: 64 }).notNull(),
      slug: varchar2("slug", { length: 64 }).notNull().unique(),
      icon: varchar2("icon", { length: 32 }).default("\u{1F3A4}").notNull(),
      color: varchar2("color", { length: 16 }).default("#EC4899").notNull(),
      description: text2("description"),
      sortOrder: int2("sortOrder").default(0).notNull(),
      isActive: boolean2("isActive").default(true).notNull(),
      createdAt: timestamp2("createdAt").defaultNow().notNull()
    });
    challengeTemplates = mysqlTable2("challenge_templates", {
      id: int2("id").autoincrement().primaryKey(),
      userId: int2("userId").notNull(),
      name: varchar2("name", { length: 255 }).notNull(),
      description: text2("description"),
      goalType: mysqlEnum2("goalType", ["attendance", "followers", "viewers", "points", "custom"]).default("attendance").notNull(),
      goalValue: int2("goalValue").default(100).notNull(),
      goalUnit: varchar2("goalUnit", { length: 32 }).default("\u4EBA").notNull(),
      eventType: mysqlEnum2("eventType", ["solo", "group"]).default("solo").notNull(),
      ticketPresale: int2("ticketPresale"),
      ticketDoor: int2("ticketDoor"),
      isPublic: boolean2("isPublic").default(false).notNull(),
      useCount: int2("useCount").default(0).notNull(),
      createdAt: timestamp2("createdAt").defaultNow().notNull(),
      updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    challengeStats = mysqlTable2("challenge_stats", {
      id: int2("id").autoincrement().primaryKey(),
      challengeId: int2("challengeId").notNull(),
      recordedAt: timestamp2("recordedAt").defaultNow().notNull(),
      recordDate: varchar2("recordDate", { length: 10 }).notNull(),
      recordHour: int2("recordHour").default(0).notNull(),
      participantCount: int2("participantCount").default(0).notNull(),
      totalContribution: int2("totalContribution").default(0).notNull(),
      newParticipants: int2("newParticipants").default(0).notNull(),
      prefectureData: text2("prefectureData"),
      createdAt: timestamp2("createdAt").defaultNow().notNull()
    });
    challengeMembers = mysqlTable2("challenge_members", {
      id: int2("id").autoincrement().primaryKey(),
      challengeId: int2("challengeId").notNull(),
      twitterUsername: varchar2("twitterUsername", { length: 255 }).notNull(),
      twitterId: varchar2("twitterId", { length: 64 }),
      displayName: varchar2("displayName", { length: 255 }),
      profileImage: text2("profileImage"),
      followersCount: int2("followersCount").default(0),
      sortOrder: int2("sortOrder").default(0).notNull(),
      createdAt: timestamp2("createdAt").defaultNow().notNull(),
      updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
    });
  }
});

// drizzle/schema/participations.ts
import { mysqlTable as mysqlTable3, int as int3, varchar as varchar3, text as text3, timestamp as timestamp3, mysqlEnum as mysqlEnum3, boolean as boolean3 } from "drizzle-orm/mysql-core";
var participations, participationCompanions;
var init_participations = __esm({
  "drizzle/schema/participations.ts"() {
    "use strict";
    participations = mysqlTable3("participations", {
      id: int3("id").autoincrement().primaryKey(),
      challengeId: int3("challengeId").notNull(),
      userId: int3("userId"),
      twitterId: varchar3("twitterId", { length: 64 }),
      displayName: varchar3("displayName", { length: 255 }).notNull(),
      username: varchar3("username", { length: 255 }),
      profileImage: text3("profileImage"),
      followersCount: int3("followersCount").default(0),
      message: text3("message"),
      companionCount: int3("companionCount").default(0).notNull(),
      prefecture: varchar3("prefecture", { length: 32 }),
      gender: mysqlEnum3("gender", ["male", "female", "unspecified"]).default("unspecified").notNull(),
      contribution: int3("contribution").default(1).notNull(),
      isAnonymous: boolean3("isAnonymous").default(false).notNull(),
      // 参加方法: venue(会場), streaming(配信), both(両方)
      attendanceType: mysqlEnum3("attendanceType", ["venue", "streaming", "both"]).default("venue").notNull(),
      createdAt: timestamp3("createdAt").defaultNow().notNull(),
      updatedAt: timestamp3("updatedAt").defaultNow().onUpdateNow().notNull(),
      // ソフトデリート用カラム
      deletedAt: timestamp3("deletedAt"),
      deletedBy: int3("deletedBy")
    });
    participationCompanions = mysqlTable3("participation_companions", {
      id: int3("id").autoincrement().primaryKey(),
      participationId: int3("participationId").notNull(),
      challengeId: int3("challengeId").notNull(),
      displayName: varchar3("displayName", { length: 255 }).notNull(),
      twitterUsername: varchar3("twitterUsername", { length: 255 }),
      twitterId: varchar3("twitterId", { length: 64 }),
      profileImage: text3("profileImage"),
      invitedByUserId: int3("invitedByUserId"),
      createdAt: timestamp3("createdAt").defaultNow().notNull()
    });
  }
});

// drizzle/schema/notifications.ts
import { mysqlTable as mysqlTable4, int as int4, varchar as varchar4, text as text4, timestamp as timestamp4, mysqlEnum as mysqlEnum4, boolean as boolean4 } from "drizzle-orm/mysql-core";
var notificationSettings, notifications, reminders;
var init_notifications = __esm({
  "drizzle/schema/notifications.ts"() {
    "use strict";
    notificationSettings = mysqlTable4("notification_settings", {
      id: int4("id").autoincrement().primaryKey(),
      userId: int4("userId").notNull(),
      challengeId: int4("challengeId").notNull(),
      onGoalReached: boolean4("onGoalReached").default(true).notNull(),
      onMilestone25: boolean4("onMilestone25").default(true).notNull(),
      onMilestone50: boolean4("onMilestone50").default(true).notNull(),
      onMilestone75: boolean4("onMilestone75").default(true).notNull(),
      onNewParticipant: boolean4("onNewParticipant").default(false).notNull(),
      expoPushToken: text4("expoPushToken"),
      createdAt: timestamp4("createdAt").defaultNow().notNull(),
      updatedAt: timestamp4("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    notifications = mysqlTable4("notifications", {
      id: int4("id").autoincrement().primaryKey(),
      userId: int4("userId").notNull(),
      challengeId: int4("challengeId").notNull(),
      type: mysqlEnum4("type", ["goal_reached", "milestone_25", "milestone_50", "milestone_75", "new_participant"]).notNull(),
      title: varchar4("title", { length: 255 }).notNull(),
      body: text4("body").notNull(),
      isRead: boolean4("isRead").default(false).notNull(),
      sentAt: timestamp4("sentAt").defaultNow().notNull(),
      createdAt: timestamp4("createdAt").defaultNow().notNull()
    });
    reminders = mysqlTable4("reminders", {
      id: int4("id").autoincrement().primaryKey(),
      challengeId: int4("challengeId").notNull(),
      userId: int4("userId").notNull(),
      reminderType: mysqlEnum4("reminderType", ["day_before", "day_of", "hour_before", "custom"]).default("day_before").notNull(),
      customTime: timestamp4("customTime"),
      isSent: boolean4("isSent").default(false).notNull(),
      sentAt: timestamp4("sentAt"),
      createdAt: timestamp4("createdAt").defaultNow().notNull()
    });
  }
});

// drizzle/schema/social.ts
import { mysqlTable as mysqlTable5, int as int5, varchar as varchar5, text as text5, timestamp as timestamp5, boolean as boolean5 } from "drizzle-orm/mysql-core";
var cheers, follows, directMessages, searchHistory, favoriteArtists;
var init_social = __esm({
  "drizzle/schema/social.ts"() {
    "use strict";
    cheers = mysqlTable5("cheers", {
      id: int5("id").autoincrement().primaryKey(),
      fromUserId: int5("fromUserId").notNull(),
      fromUserName: varchar5("fromUserName", { length: 255 }).notNull(),
      fromUserImage: text5("fromUserImage"),
      toParticipationId: int5("toParticipationId").notNull(),
      toUserId: int5("toUserId"),
      message: text5("message"),
      emoji: varchar5("emoji", { length: 32 }).default("\u{1F44F}").notNull(),
      challengeId: int5("challengeId").notNull(),
      createdAt: timestamp5("createdAt").defaultNow().notNull()
    });
    follows = mysqlTable5("follows", {
      id: int5("id").autoincrement().primaryKey(),
      followerId: int5("followerId").notNull(),
      followerName: varchar5("followerName", { length: 255 }),
      followeeId: int5("followeeId").notNull(),
      followeeName: varchar5("followeeName", { length: 255 }),
      followeeImage: text5("followeeImage"),
      notifyNewChallenge: boolean5("notifyNewChallenge").default(true).notNull(),
      createdAt: timestamp5("createdAt").defaultNow().notNull()
    });
    directMessages = mysqlTable5("direct_messages", {
      id: int5("id").autoincrement().primaryKey(),
      fromUserId: int5("fromUserId").notNull(),
      fromUserName: varchar5("fromUserName", { length: 255 }).notNull(),
      fromUserImage: text5("fromUserImage"),
      toUserId: int5("toUserId").notNull(),
      message: text5("message").notNull(),
      challengeId: int5("challengeId").notNull(),
      isRead: boolean5("isRead").default(false).notNull(),
      readAt: timestamp5("readAt"),
      createdAt: timestamp5("createdAt").defaultNow().notNull()
    });
    searchHistory = mysqlTable5("search_history", {
      id: int5("id").autoincrement().primaryKey(),
      userId: int5("userId").notNull(),
      query: varchar5("query", { length: 255 }).notNull(),
      resultCount: int5("resultCount").default(0).notNull(),
      createdAt: timestamp5("createdAt").defaultNow().notNull()
    });
    favoriteArtists = mysqlTable5("favorite_artists", {
      id: int5("id").autoincrement().primaryKey(),
      userId: int5("userId").notNull(),
      userTwitterId: varchar5("userTwitterId", { length: 64 }),
      artistTwitterId: varchar5("artistTwitterId", { length: 64 }).notNull(),
      artistName: varchar5("artistName", { length: 255 }),
      artistUsername: varchar5("artistUsername", { length: 255 }),
      artistProfileImage: text5("artistProfileImage"),
      notifyNewChallenge: boolean5("notifyNewChallenge").default(true).notNull(),
      expoPushToken: text5("expoPushToken"),
      createdAt: timestamp5("createdAt").defaultNow().notNull(),
      updatedAt: timestamp5("updatedAt").defaultNow().onUpdateNow().notNull()
    });
  }
});

// drizzle/schema/gamification.ts
import { mysqlTable as mysqlTable6, int as int6, varchar as varchar6, text as text6, timestamp as timestamp6, mysqlEnum as mysqlEnum5, boolean as boolean6 } from "drizzle-orm/mysql-core";
var badges, userBadges, achievements, userAchievements, achievementPages, pickedComments;
var init_gamification = __esm({
  "drizzle/schema/gamification.ts"() {
    "use strict";
    badges = mysqlTable6("badges", {
      id: int6("id").autoincrement().primaryKey(),
      name: varchar6("name", { length: 100 }).notNull(),
      description: text6("description"),
      iconUrl: text6("iconUrl"),
      type: mysqlEnum5("type", ["participation", "achievement", "milestone", "special"]).default("participation").notNull(),
      conditionType: mysqlEnum5("conditionType", ["first_participation", "goal_reached", "milestone_25", "milestone_50", "milestone_75", "contribution_5", "contribution_10", "contribution_20", "host_challenge", "special", "follower_badge"]).notNull(),
      createdAt: timestamp6("createdAt").defaultNow().notNull()
    });
    userBadges = mysqlTable6("user_badges", {
      id: int6("id").autoincrement().primaryKey(),
      userId: int6("userId").notNull(),
      badgeId: int6("badgeId").notNull(),
      challengeId: int6("challengeId"),
      earnedAt: timestamp6("earnedAt").defaultNow().notNull()
    });
    achievements = mysqlTable6("achievements", {
      id: int6("id").autoincrement().primaryKey(),
      name: varchar6("name", { length: 100 }).notNull(),
      description: text6("description"),
      iconUrl: text6("iconUrl"),
      icon: varchar6("icon", { length: 32 }).default("\u{1F3C6}").notNull(),
      type: mysqlEnum5("type", ["participation", "hosting", "invitation", "contribution", "streak", "special"]).default("participation").notNull(),
      conditionType: mysqlEnum5("conditionType", [
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
      conditionValue: int6("conditionValue").default(1).notNull(),
      points: int6("points").default(10).notNull(),
      rarity: mysqlEnum5("rarity", ["common", "uncommon", "rare", "epic", "legendary"]).default("common").notNull(),
      isActive: boolean6("isActive").default(true).notNull(),
      createdAt: timestamp6("createdAt").defaultNow().notNull()
    });
    userAchievements = mysqlTable6("user_achievements", {
      id: int6("id").autoincrement().primaryKey(),
      userId: int6("userId").notNull(),
      achievementId: int6("achievementId").notNull(),
      progress: int6("progress").default(0).notNull(),
      isCompleted: boolean6("isCompleted").default(false).notNull(),
      completedAt: timestamp6("completedAt"),
      createdAt: timestamp6("createdAt").defaultNow().notNull(),
      updatedAt: timestamp6("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    achievementPages = mysqlTable6("achievement_pages", {
      id: int6("id").autoincrement().primaryKey(),
      challengeId: int6("challengeId").notNull(),
      achievedAt: timestamp6("achievedAt").notNull(),
      finalValue: int6("finalValue").notNull(),
      goalValue: int6("goalValue").notNull(),
      totalParticipants: int6("totalParticipants").notNull(),
      title: varchar6("title", { length: 255 }).notNull(),
      message: text6("message"),
      isPublic: boolean6("isPublic").default(true).notNull(),
      createdAt: timestamp6("createdAt").defaultNow().notNull()
    });
    pickedComments = mysqlTable6("picked_comments", {
      id: int6("id").autoincrement().primaryKey(),
      participationId: int6("participationId").notNull(),
      challengeId: int6("challengeId").notNull(),
      pickedBy: int6("pickedBy").notNull(),
      reason: text6("reason"),
      isUsedInVideo: boolean6("isUsedInVideo").default(false).notNull(),
      pickedAt: timestamp6("pickedAt").defaultNow().notNull()
    });
  }
});

// drizzle/schema/invitations.ts
import { mysqlTable as mysqlTable7, int as int7, varchar as varchar7, text as text7, timestamp as timestamp7, mysqlEnum as mysqlEnum6, boolean as boolean7 } from "drizzle-orm/mysql-core";
var invitations, invitationUses, collaborators, collaboratorInvitations;
var init_invitations = __esm({
  "drizzle/schema/invitations.ts"() {
    "use strict";
    invitations = mysqlTable7("invitations", {
      id: int7("id").autoincrement().primaryKey(),
      challengeId: int7("challengeId").notNull(),
      inviterId: int7("inviterId").notNull(),
      inviterName: varchar7("inviterName", { length: 255 }),
      code: varchar7("code", { length: 32 }).notNull().unique(),
      customMessage: text7("customMessage"),
      customTitle: varchar7("customTitle", { length: 255 }),
      maxUses: int7("maxUses").default(0),
      useCount: int7("useCount").default(0).notNull(),
      expiresAt: timestamp7("expiresAt"),
      isActive: boolean7("isActive").default(true).notNull(),
      createdAt: timestamp7("createdAt").defaultNow().notNull()
    });
    invitationUses = mysqlTable7("invitation_uses", {
      id: int7("id").autoincrement().primaryKey(),
      invitationId: int7("invitationId").notNull(),
      userId: int7("userId"),
      displayName: varchar7("displayName", { length: 255 }),
      twitterId: varchar7("twitterId", { length: 64 }),
      twitterUsername: varchar7("twitterUsername", { length: 255 }),
      participationId: int7("participationId"),
      isConfirmed: boolean7("isConfirmed").default(false).notNull(),
      confirmedAt: timestamp7("confirmedAt"),
      createdAt: timestamp7("createdAt").defaultNow().notNull()
    });
    collaborators = mysqlTable7("collaborators", {
      id: int7("id").autoincrement().primaryKey(),
      challengeId: int7("challengeId").notNull(),
      userId: int7("userId").notNull(),
      userName: varchar7("userName", { length: 255 }).notNull(),
      userImage: text7("userImage"),
      role: mysqlEnum6("role", ["owner", "co-host", "moderator"]).default("co-host").notNull(),
      canEdit: boolean7("canEdit").default(true).notNull(),
      canManageParticipants: boolean7("canManageParticipants").default(true).notNull(),
      canInvite: boolean7("canInvite").default(true).notNull(),
      status: mysqlEnum6("status", ["pending", "accepted", "declined"]).default("pending").notNull(),
      invitedAt: timestamp7("invitedAt").defaultNow().notNull(),
      respondedAt: timestamp7("respondedAt"),
      createdAt: timestamp7("createdAt").defaultNow().notNull(),
      updatedAt: timestamp7("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    collaboratorInvitations = mysqlTable7("collaborator_invitations", {
      id: int7("id").autoincrement().primaryKey(),
      challengeId: int7("challengeId").notNull(),
      inviterId: int7("inviterId").notNull(),
      inviterName: varchar7("inviterName", { length: 255 }),
      inviteeId: int7("inviteeId"),
      inviteeEmail: varchar7("inviteeEmail", { length: 320 }),
      inviteeTwitterId: varchar7("inviteeTwitterId", { length: 64 }),
      code: varchar7("code", { length: 32 }).notNull().unique(),
      role: mysqlEnum6("role", ["co-host", "moderator"]).default("co-host").notNull(),
      status: mysqlEnum6("status", ["pending", "accepted", "declined", "expired"]).default("pending").notNull(),
      expiresAt: timestamp7("expiresAt"),
      createdAt: timestamp7("createdAt").defaultNow().notNull()
    });
  }
});

// drizzle/schema/tickets.ts
import { mysqlTable as mysqlTable8, int as int8, varchar as varchar8, text as text8, timestamp as timestamp8, mysqlEnum as mysqlEnum7, boolean as boolean8 } from "drizzle-orm/mysql-core";
var ticketTransfers, ticketWaitlist;
var init_tickets = __esm({
  "drizzle/schema/tickets.ts"() {
    "use strict";
    ticketTransfers = mysqlTable8("ticket_transfers", {
      id: int8("id").autoincrement().primaryKey(),
      challengeId: int8("challengeId").notNull(),
      userId: int8("userId").notNull(),
      userName: varchar8("userName", { length: 255 }).notNull(),
      userUsername: varchar8("userUsername", { length: 255 }),
      userImage: text8("userImage"),
      ticketCount: int8("ticketCount").default(1).notNull(),
      priceType: mysqlEnum7("priceType", ["face_value", "negotiable", "free"]).default("face_value").notNull(),
      comment: text8("comment"),
      status: mysqlEnum7("status", ["available", "reserved", "completed", "cancelled"]).default("available").notNull(),
      createdAt: timestamp8("createdAt").defaultNow().notNull(),
      updatedAt: timestamp8("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    ticketWaitlist = mysqlTable8("ticket_waitlist", {
      id: int8("id").autoincrement().primaryKey(),
      challengeId: int8("challengeId").notNull(),
      userId: int8("userId").notNull(),
      userName: varchar8("userName", { length: 255 }).notNull(),
      userUsername: varchar8("userUsername", { length: 255 }),
      userImage: text8("userImage"),
      desiredCount: int8("desiredCount").default(1).notNull(),
      notifyOnNew: boolean8("notifyOnNew").default(true).notNull(),
      isActive: boolean8("isActive").default(true).notNull(),
      createdAt: timestamp8("createdAt").defaultNow().notNull(),
      updatedAt: timestamp8("updatedAt").defaultNow().onUpdateNow().notNull()
    });
  }
});

// drizzle/schema/audit.ts
import { mysqlTable as mysqlTable9, int as int9, varchar as varchar9, text as text9, timestamp as timestamp9, mysqlEnum as mysqlEnum8, json as json3 } from "drizzle-orm/mysql-core";
var auditLogs, AUDIT_ACTIONS, ENTITY_TYPES;
var init_audit = __esm({
  "drizzle/schema/audit.ts"() {
    "use strict";
    auditLogs = mysqlTable9("audit_logs", {
      id: int9("id").autoincrement().primaryKey(),
      // リクエスト追跡用ID（tRPC middlewareで生成）
      requestId: varchar9("requestId", { length: 36 }).notNull(),
      // 操作種別
      action: mysqlEnum8("action", [
        "CREATE",
        "EDIT",
        "DELETE",
        "RESTORE",
        "BULK_DELETE",
        "BULK_RESTORE",
        "LOGIN",
        "LOGOUT",
        "ADMIN_ACTION"
      ]).notNull(),
      // 操作対象のエンティティ種別
      entityType: varchar9("entityType", { length: 64 }).notNull(),
      // 操作対象のID
      targetId: int9("targetId"),
      // 操作を実行したユーザーID
      actorId: int9("actorId"),
      // 操作を実行したユーザー名（ログイン名のスナップショット）
      actorName: varchar9("actorName", { length: 255 }),
      // 操作を実行したユーザーのロール
      actorRole: varchar9("actorRole", { length: 32 }),
      // 変更前のデータ（JSON）
      beforeData: json3("beforeData").$type(),
      // 変更後のデータ（JSON）
      afterData: json3("afterData").$type(),
      // 操作の詳細・理由（任意）
      reason: text9("reason"),
      // クライアント情報
      ipAddress: varchar9("ipAddress", { length: 45 }),
      userAgent: text9("userAgent"),
      // タイムスタンプ
      createdAt: timestamp9("createdAt").defaultNow().notNull()
    });
    AUDIT_ACTIONS = {
      CREATE: "CREATE",
      EDIT: "EDIT",
      DELETE: "DELETE",
      RESTORE: "RESTORE",
      BULK_DELETE: "BULK_DELETE",
      BULK_RESTORE: "BULK_RESTORE",
      LOGIN: "LOGIN",
      LOGOUT: "LOGOUT",
      ADMIN_ACTION: "ADMIN_ACTION"
    };
    ENTITY_TYPES = {
      PARTICIPATION: "participation",
      CHALLENGE: "challenge",
      USER: "user",
      CHEER: "cheer",
      COMMENT: "comment",
      INVITATION: "invitation"
    };
  }
});

// drizzle/schema/index.ts
var init_schema = __esm({
  "drizzle/schema/index.ts"() {
    "use strict";
    init_users();
    init_challenges();
    init_participations();
    init_notifications();
    init_social();
    init_gamification();
    init_invitations();
    init_tickets();
    init_audit();
  }
});

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  AUDIT_ACTIONS: () => AUDIT_ACTIONS,
  ENTITY_TYPES: () => ENTITY_TYPES,
  achievementPages: () => achievementPages,
  achievements: () => achievements,
  auditLogs: () => auditLogs,
  badges: () => badges,
  categories: () => categories,
  challengeMembers: () => challengeMembers,
  challengeStats: () => challengeStats,
  challengeTemplates: () => challengeTemplates,
  challenges: () => challenges,
  cheers: () => cheers,
  collaboratorInvitations: () => collaboratorInvitations,
  collaborators: () => collaborators,
  directMessages: () => directMessages,
  events: () => events,
  favoriteArtists: () => favoriteArtists,
  follows: () => follows,
  invitationUses: () => invitationUses,
  invitations: () => invitations,
  notificationSettings: () => notificationSettings,
  notifications: () => notifications,
  oauthPkceData: () => oauthPkceData,
  participationCompanions: () => participationCompanions,
  participations: () => participations,
  pickedComments: () => pickedComments,
  reminders: () => reminders,
  searchHistory: () => searchHistory,
  ticketTransfers: () => ticketTransfers,
  ticketWaitlist: () => ticketWaitlist,
  twitterFollowStatus: () => twitterFollowStatus,
  twitterUserCache: () => twitterUserCache,
  userAchievements: () => userAchievements,
  userBadges: () => userBadges,
  users: () => users
});
var init_schema2 = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    init_schema();
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

// server/db/user-db.ts
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
async function updateUserGender(userId, gender) {
  const db = await getDb();
  if (!db) return false;
  await db.update(users).set({ gender }).where(eq(users.id, userId));
  return true;
}
async function getUserByTwitterId(twitterId) {
  const db = await getDb();
  if (!db) return null;
  const openId = `twitter:${twitterId}`;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  if (result.length === 0) return null;
  const user = result[0];
  const { twitterFollowStatus: twitterFollowStatus2 } = await Promise.resolve().then(() => (init_schema2(), schema_exports));
  const followStatus = await db.select({ twitterUsername: twitterFollowStatus2.twitterUsername }).from(twitterFollowStatus2).where(eq(twitterFollowStatus2.userId, user.id)).limit(1);
  return {
    id: user.id,
    name: user.name,
    twitterId,
    twitterUsername: followStatus.length > 0 ? followStatus[0].twitterUsername : null
  };
}
var init_user_db = __esm({
  "server/db/user-db.ts"() {
    "use strict";
    init_connection();
    init_schema2();
    init_env();
  }
});

// server/db/challenge-db.ts
import { getTableColumns } from "drizzle-orm";
async function getAllEvents() {
  const now = Date.now();
  if (eventsCache.data && now - eventsCache.timestamp < EVENTS_CACHE_TTL) {
    return eventsCache.data;
  }
  const db = await getDb();
  if (!db) return eventsCache.data ?? [];
  const eventColumns = getTableColumns(events2);
  const result = await db.select({
    ...eventColumns,
    hostGender: users.gender
  }).from(events2).leftJoin(users, eq(events2.hostUserId, users.id)).where(eq(events2.isPublic, true)).orderBy(desc(events2.eventDate));
  eventsCache = { data: result, timestamp: now };
  return result;
}
function invalidateEventsCache() {
  eventsCache = { data: null, timestamp: 0 };
}
async function getEventById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(events2).where(eq(events2.id, id));
  return result[0] || null;
}
async function getEventsByHostUserId(hostUserId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events2).where(eq(events2.hostUserId, hostUserId)).orderBy(desc(events2.eventDate));
}
async function getEventsByHostTwitterId(hostTwitterId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events2).where(eq(events2.hostTwitterId, hostTwitterId)).orderBy(desc(events2.eventDate));
}
async function createEvent(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
  const eventDate = data.eventDate ? new Date(data.eventDate).toISOString().slice(0, 19).replace("T", " ") : now;
  const slug = data.slug || generateSlug(data.title);
  const ticketSaleStart = data.ticketSaleStart ? new Date(data.ticketSaleStart).toISOString().slice(0, 19).replace("T", " ") : null;
  const result = await db.execute(sql`
    INSERT INTO challenges (
      hostUserId, hostTwitterId, hostName, hostUsername, hostProfileImage, hostFollowersCount, hostDescription,
      title, description, goalType, goalValue, goalUnit, currentValue,
      eventType, categoryId, eventDate, venue, prefecture,
      ticketPresale, ticketDoor, ticketSaleStart, ticketUrl, externalUrl,
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
      ${ticketSaleStart},
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
  await db.update(events2).set(data).where(eq(events2.id, id));
  invalidateEventsCache();
}
async function deleteEvent(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(events2).where(eq(events2.id, id));
  invalidateEventsCache();
}
async function searchChallenges(query) {
  const db = await getDb();
  if (!db) return [];
  const normalizedQuery = query.toLowerCase().trim();
  const allChallenges = await db.select().from(challenges).where(eq(challenges.isPublic, true)).orderBy(desc(challenges.eventDate));
  return allChallenges.filter((c) => {
    const title = (c.title || "").toLowerCase();
    const hostName = (c.hostName || "").toLowerCase();
    const description = (c.description || "").toLowerCase();
    const venue = (c.venue || "").toLowerCase();
    return title.includes(normalizedQuery) || hostName.includes(normalizedQuery) || description.includes(normalizedQuery) || venue.includes(normalizedQuery);
  });
}
var events2, eventsCache, EVENTS_CACHE_TTL;
var init_challenge_db = __esm({
  "server/db/challenge-db.ts"() {
    "use strict";
    init_connection();
    init_connection();
    init_schema2();
    events2 = challenges;
    eventsCache = { data: null, timestamp: 0 };
    EVENTS_CACHE_TTL = 30 * 1e3;
  }
});

// server/db/participation-db.ts
async function getParticipationsByEventId(eventId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(participations).where(and(
    eq(participations.challengeId, eventId),
    isNull(participations.deletedAt)
  )).orderBy(desc(participations.createdAt));
}
async function getParticipationsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(participations).where(and(
    eq(participations.userId, userId),
    isNull(participations.deletedAt)
  )).orderBy(desc(participations.createdAt));
}
async function getParticipationById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(participations).where(eq(participations.id, id));
  return result[0] || null;
}
async function getActiveParticipationById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(participations).where(and(
    eq(participations.id, id),
    isNull(participations.deletedAt)
  ));
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
async function softDeleteParticipation(id, deletedByUserId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const participation = await db.select().from(participations).where(eq(participations.id, id));
  const p = participation[0];
  if (!p) {
    throw new Error("Participation not found");
  }
  await db.update(participations).set({
    deletedAt: /* @__PURE__ */ new Date(),
    deletedBy: deletedByUserId
  }).where(eq(participations.id, id));
  if (p.challengeId) {
    const contribution = (p.contribution || 1) + (p.companionCount || 0);
    await db.update(challenges).set({ currentValue: sql`GREATEST(${challenges.currentValue} - ${contribution}, 0)` }).where(eq(challenges.id, p.challengeId));
    invalidateEventsCache();
  }
  return { success: true, challengeId: p.challengeId };
}
async function deleteParticipation(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const participation = await db.select().from(participations).where(eq(participations.id, id));
  const p = participation[0];
  await db.delete(participations).where(eq(participations.id, id));
  if (p && p.challengeId && !p.deletedAt) {
    const contribution = (p.contribution || 1) + (p.companionCount || 0);
    await db.update(challenges).set({ currentValue: sql`GREATEST(${challenges.currentValue} - ${contribution}, 0)` }).where(eq(challenges.id, p.challengeId));
    invalidateEventsCache();
  }
}
async function getParticipationCountByEventId(eventId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(participations).where(and(
    eq(participations.challengeId, eventId),
    isNull(participations.deletedAt)
  ));
  return result.length;
}
async function getTotalCompanionCountByEventId(eventId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(participations).where(and(
    eq(participations.challengeId, eventId),
    isNull(participations.deletedAt)
  ));
  return result.reduce((sum, p) => sum + (p.contribution || 1), 0);
}
async function getParticipationsByPrefecture(challengeId) {
  const db = await getDb();
  if (!db) return {};
  const result = await db.select().from(participations).where(and(
    eq(participations.challengeId, challengeId),
    isNull(participations.deletedAt)
  ));
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
  const result = await db.select().from(participations).where(and(
    eq(participations.challengeId, challengeId),
    isNull(participations.deletedAt)
  )).orderBy(desc(participations.contribution));
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
async function getParticipationsByPrefectureFilter(challengeId, prefecture) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(participations).where(sql`${participations.challengeId} = ${challengeId} AND ${participations.prefecture} = ${prefecture} AND ${participations.deletedAt} IS NULL`).orderBy(desc(participations.createdAt));
}
async function getAttendanceTypeCounts(challengeId) {
  const db = await getDb();
  if (!db) return { venue: 0, streaming: 0, both: 0, total: 0 };
  const result = await db.select().from(participations).where(and(
    eq(participations.challengeId, challengeId),
    isNull(participations.deletedAt)
  ));
  const counts = {
    venue: 0,
    streaming: 0,
    both: 0,
    total: result.length
  };
  result.forEach((p) => {
    const type = p.attendanceType || "venue";
    if (type === "venue") counts.venue += 1;
    else if (type === "streaming") counts.streaming += 1;
    else if (type === "both") counts.both += 1;
  });
  return counts;
}
async function getPrefectureRanking(challengeId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(participations).where(and(
    eq(participations.challengeId, challengeId),
    isNull(participations.deletedAt)
  ));
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
async function getDeletedParticipations(filters) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(participations).where(sql`${participations.deletedAt} IS NOT NULL`);
  const conditions = [`${participations.deletedAt} IS NOT NULL`];
  if (filters?.challengeId) {
    conditions.push(`${participations.challengeId} = ${filters.challengeId}`);
  }
  if (filters?.userId) {
    conditions.push(`${participations.userId} = ${filters.userId}`);
  }
  const result = await db.select().from(participations).where(sql.raw(conditions.join(" AND "))).orderBy(desc(participations.deletedAt)).limit(filters?.limit || 100);
  return result;
}
async function restoreParticipation(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const participation = await db.select().from(participations).where(eq(participations.id, id));
  const p = participation[0];
  if (!p) {
    throw new Error("Participation not found");
  }
  if (!p.deletedAt) {
    throw new Error("Participation is not deleted");
  }
  await db.update(participations).set({
    deletedAt: null,
    deletedBy: null
  }).where(eq(participations.id, id));
  if (p.challengeId) {
    const contribution = (p.contribution || 1) + (p.companionCount || 0);
    await db.update(challenges).set({ currentValue: sql`${challenges.currentValue} + ${contribution}` }).where(eq(challenges.id, p.challengeId));
    invalidateEventsCache();
  }
  return { success: true, challengeId: p.challengeId };
}
async function bulkSoftDeleteParticipations(filter, deletedByUserId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!filter.challengeId && !filter.userId) {
    throw new Error("Either challengeId or userId must be specified");
  }
  const conditions = [`${participations.deletedAt} IS NULL`];
  if (filter.challengeId) {
    conditions.push(`${participations.challengeId} = ${filter.challengeId}`);
  }
  if (filter.userId) {
    conditions.push(`${participations.userId} = ${filter.userId}`);
  }
  const targets = await db.select().from(participations).where(sql.raw(conditions.join(" AND ")));
  if (targets.length === 0) {
    return { deletedCount: 0, affectedChallengeIds: [] };
  }
  const targetIds = targets.map((t2) => t2.id);
  await db.update(participations).set({
    deletedAt: /* @__PURE__ */ new Date(),
    deletedBy: deletedByUserId
  }).where(sql`${participations.id} IN (${sql.raw(targetIds.join(","))})`);
  const challengeContributions = {};
  targets.forEach((p) => {
    if (p.challengeId) {
      const contribution = (p.contribution || 1) + (p.companionCount || 0);
      challengeContributions[p.challengeId] = (challengeContributions[p.challengeId] || 0) + contribution;
    }
  });
  for (const [challengeId, contribution] of Object.entries(challengeContributions)) {
    await db.update(challenges).set({ currentValue: sql`GREATEST(${challenges.currentValue} - ${contribution}, 0)` }).where(eq(challenges.id, Number(challengeId)));
  }
  invalidateEventsCache();
  return {
    deletedCount: targets.length,
    affectedChallengeIds: Object.keys(challengeContributions).map(Number)
  };
}
async function bulkRestoreParticipations(filter) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (!filter.challengeId && !filter.userId) {
    throw new Error("Either challengeId or userId must be specified");
  }
  const conditions = [`${participations.deletedAt} IS NOT NULL`];
  if (filter.challengeId) {
    conditions.push(`${participations.challengeId} = ${filter.challengeId}`);
  }
  if (filter.userId) {
    conditions.push(`${participations.userId} = ${filter.userId}`);
  }
  const targets = await db.select().from(participations).where(sql.raw(conditions.join(" AND ")));
  if (targets.length === 0) {
    return { restoredCount: 0, affectedChallengeIds: [] };
  }
  const targetIds = targets.map((t2) => t2.id);
  await db.update(participations).set({
    deletedAt: null,
    deletedBy: null
  }).where(sql`${participations.id} IN (${sql.raw(targetIds.join(","))})`);
  const challengeContributions = {};
  targets.forEach((p) => {
    if (p.challengeId) {
      const contribution = (p.contribution || 1) + (p.companionCount || 0);
      challengeContributions[p.challengeId] = (challengeContributions[p.challengeId] || 0) + contribution;
    }
  });
  for (const [challengeId, contribution] of Object.entries(challengeContributions)) {
    await db.update(challenges).set({ currentValue: sql`${challenges.currentValue} + ${contribution}` }).where(eq(challenges.id, Number(challengeId)));
  }
  invalidateEventsCache();
  return {
    restoredCount: targets.length,
    affectedChallengeIds: Object.keys(challengeContributions).map(Number)
  };
}
var init_participation_db = __esm({
  "server/db/participation-db.ts"() {
    "use strict";
    init_connection();
    init_schema2();
    init_challenge_db();
  }
});

// server/websocket.ts
var websocket_exports = {};
__export(websocket_exports, {
  initWebSocketServer: () => initWebSocketServer,
  sendMessageToUser: () => sendMessageToUser,
  sendNotificationToUser: () => sendNotificationToUser
});
import { WebSocketServer, WebSocket } from "ws";
import { jwtVerify } from "jose";
function initWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws"
  });
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 3e4);
  wss.on("close", () => {
    clearInterval(interval);
  });
  wss.on("connection", async (ws, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const token = url.searchParams.get("token");
    if (!token) {
      ws.close(1008, "Unauthorized: No token provided");
      return;
    }
    try {
      const secret = new TextEncoder().encode(ENV.cookieSecret);
      const { payload } = await jwtVerify(token, secret);
      const userId = payload.sub;
      if (!userId) {
        ws.close(1008, "Unauthorized: Invalid user ID");
        return;
      }
      ws.userId = userId;
      ws.isAlive = true;
      if (!clients.has(ws.userId)) {
        clients.set(ws.userId, /* @__PURE__ */ new Set());
      }
      clients.get(ws.userId).add(ws);
      console.log(`[WebSocket] User ${ws.userId} connected`);
      ws.on("pong", () => {
        ws.isAlive = true;
      });
      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          handleMessage(ws, message);
        } catch (error) {
          console.error("[WebSocket] Failed to parse message:", error);
        }
      });
      ws.on("close", () => {
        if (ws.userId) {
          const userClients = clients.get(ws.userId);
          if (userClients) {
            userClients.delete(ws);
            if (userClients.size === 0) {
              clients.delete(ws.userId);
            }
          }
          console.log(`[WebSocket] User ${ws.userId} disconnected`);
        }
      });
      ws.on("error", (error) => {
        console.error("[WebSocket] Error:", error);
      });
    } catch (error) {
      console.error("[WebSocket] Authentication failed:", error);
      ws.close(1008, "Unauthorized: Invalid token");
    }
  });
  console.log("[WebSocket] Server initialized on /ws");
}
function handleMessage(ws, message) {
  switch (message.type) {
    case "ping":
      ws.send(JSON.stringify({ type: "pong" }));
      break;
    default:
      console.log(`[WebSocket] Received message from ${ws.userId}:`, message);
  }
}
function sendNotificationToUser(userId, notification) {
  const userClients = clients.get(userId);
  if (!userClients || userClients.size === 0) {
    console.log(`[WebSocket] User ${userId} is not connected`);
    return;
  }
  const message = {
    type: "notification",
    data: notification
  };
  userClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
  console.log(`[WebSocket] Sent notification to user ${userId}`);
}
function sendMessageToUser(userId, messageData) {
  const userClients = clients.get(userId);
  if (!userClients || userClients.size === 0) {
    console.log(`[WebSocket] User ${userId} is not connected`);
    return;
  }
  const message = {
    type: "message",
    data: messageData
  };
  userClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
  console.log(`[WebSocket] Sent message to user ${userId}`);
}
var clients;
var init_websocket = __esm({
  "server/websocket.ts"() {
    "use strict";
    init_env();
    clients = /* @__PURE__ */ new Map();
  }
});

// server/db/notification-db.ts
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
  const notificationId = result[0].insertId;
  try {
    const { sendNotificationToUser: sendNotificationToUser2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
    sendNotificationToUser2(data.userId.toString(), {
      id: notificationId,
      ...data
    });
  } catch (error) {
    console.error("[WebSocket] Failed to send notification:", error);
  }
  return notificationId;
}
async function getNotificationsByUserId(userId, limit = 20, cursor) {
  const db = await getDb();
  if (!db) return [];
  const conditions = cursor ? and(eq(notifications.userId, userId), lt(notifications.id, cursor)) : eq(notifications.userId, userId);
  return db.select().from(notifications).where(conditions).orderBy(desc(notifications.createdAt)).limit(limit);
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
var init_notification_db = __esm({
  "server/db/notification-db.ts"() {
    "use strict";
    init_connection();
    init_schema2();
  }
});

// server/db/badge-db.ts
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
var init_badge_db = __esm({
  "server/db/badge-db.ts"() {
    "use strict";
    init_connection();
    init_schema2();
  }
});

// server/db/social-db.ts
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
var init_social_db = __esm({
  "server/db/social-db.ts"() {
    "use strict";
    init_connection();
    init_schema2();
  }
});

// server/db/messaging-db.ts
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
  const messageId = result[0].insertId;
  try {
    const { sendMessageToUser: sendMessageToUser2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
    sendMessageToUser2(dm.toUserId.toString(), {
      id: messageId,
      ...dm
    });
  } catch (error) {
    console.error("[WebSocket] Failed to send message:", error);
  }
  return messageId;
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
async function getConversationList(userId, limit = 20, cursor) {
  const db = await getDb();
  if (!db) return [];
  const conditions = cursor ? sql`(${directMessages.fromUserId} = ${userId} OR ${directMessages.toUserId} = ${userId}) AND ${directMessages.id} < ${cursor}` : sql`${directMessages.fromUserId} = ${userId} OR ${directMessages.toUserId} = ${userId}`;
  const messages = await db.select().from(directMessages).where(conditions).orderBy(desc(directMessages.createdAt)).limit(limit * 3);
  const conversationMap = /* @__PURE__ */ new Map();
  for (const msg of messages) {
    if (conversationMap.size >= limit) break;
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
var init_messaging_db = __esm({
  "server/db/messaging-db.ts"() {
    "use strict";
    init_connection();
    init_schema2();
  }
});

// server/db/follow-db.ts
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
var init_follow_db = __esm({
  "server/db/follow-db.ts"() {
    "use strict";
    init_connection();
    init_schema2();
    init_badge_db();
  }
});

// server/db/ranking-db.ts
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
var init_ranking_db = __esm({
  "server/db/ranking-db.ts"() {
    "use strict";
    init_connection();
    init_schema2();
  }
});

// server/db/category-db.ts
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
var categoriesCache, CATEGORIES_CACHE_TTL;
var init_category_db = __esm({
  "server/db/category-db.ts"() {
    "use strict";
    init_connection();
    init_schema2();
    categoriesCache = { data: null, timestamp: 0 };
    CATEGORIES_CACHE_TTL = 5 * 60 * 1e3;
  }
});

// server/db/invitation-db.ts
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
async function confirmInvitationUse(invitationId, userId, participationId) {
  const db = await getDb();
  if (!db) return false;
  await db.update(invitationUses).set({
    isConfirmed: true,
    confirmedAt: /* @__PURE__ */ new Date(),
    participationId
  }).where(and(
    eq(invitationUses.invitationId, invitationId),
    eq(invitationUses.userId, userId)
  ));
  return true;
}
async function getUserInvitationStats(userId) {
  const db = await getDb();
  if (!db) return { totalInvited: 0, confirmedCount: 0 };
  const invitationsList = await db.select({ id: invitations.id }).from(invitations).where(eq(invitations.inviterId, userId));
  if (invitationsList.length === 0) return { totalInvited: 0, confirmedCount: 0 };
  const invitationIds = invitationsList.map((i) => i.id);
  const totalResult = await db.select({ count: sql`count(*)` }).from(invitationUses).where(sql`${invitationUses.invitationId} IN (${sql.join(invitationIds.map((id) => sql`${id}`), sql`, `)})`);
  const confirmedResult = await db.select({ count: sql`count(*)` }).from(invitationUses).where(and(
    sql`${invitationUses.invitationId} IN (${sql.join(invitationIds.map((id) => sql`${id}`), sql`, `)})`,
    eq(invitationUses.isConfirmed, true)
  ));
  return {
    totalInvited: totalResult[0]?.count || 0,
    confirmedCount: confirmedResult[0]?.count || 0
  };
}
async function getInvitedParticipants(challengeId, inviterId) {
  const db = await getDb();
  if (!db) return [];
  const invitationsList = await db.select({ id: invitations.id }).from(invitations).where(and(
    eq(invitations.challengeId, challengeId),
    eq(invitations.inviterId, inviterId)
  ));
  if (invitationsList.length === 0) return [];
  const invitationIds = invitationsList.map((i) => i.id);
  return db.select({
    id: invitationUses.id,
    displayName: invitationUses.displayName,
    twitterUsername: invitationUses.twitterUsername,
    isConfirmed: invitationUses.isConfirmed,
    confirmedAt: invitationUses.confirmedAt,
    createdAt: invitationUses.createdAt
  }).from(invitationUses).where(sql`${invitationUses.invitationId} IN (${sql.join(invitationIds.map((id) => sql`${id}`), sql`, `)})`).orderBy(desc(invitationUses.createdAt));
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
var init_invitation_db = __esm({
  "server/db/invitation-db.ts"() {
    "use strict";
    init_connection();
    init_schema2();
  }
});

// server/db/profile-db.ts
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
var init_profile_db = __esm({
  "server/db/profile-db.ts"() {
    "use strict";
    init_connection();
    init_schema2();
  }
});

// server/db/companion-db.ts
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
var init_companion_db = __esm({
  "server/db/companion-db.ts"() {
    "use strict";
    init_connection();
    init_schema2();
  }
});

// server/db/ai-db.ts
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
    Object.entries(regionSummary).forEach(([region, count2]) => {
      if (count2 > maxCount) {
        maxCount = count2;
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
var init_ai_db = __esm({
  "server/db/ai-db.ts"() {
    "use strict";
    init_connection();
    init_schema2();
  }
});

// server/db/ticket-db.ts
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
var init_ticket_db = __esm({
  "server/db/ticket-db.ts"() {
    "use strict";
    init_connection();
    init_schema2();
  }
});

// server/db/stats-db.ts
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
  return {
    totalChallenges: allChallenges.length,
    challengesWithDiscrepancy: report.filter((r) => r.hasDiscrepancy).length,
    challenges: report
  };
}
async function getDbSchema() {
  const db = await getDb();
  if (!db) return { tables: [], error: "Database not available" };
  try {
    const result = await db.execute(sql`
      SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `);
    return { tables: result[0] };
  } catch (error) {
    return { tables: [], error: String(error) };
  }
}
async function compareSchemas() {
  const db = await getDb();
  if (!db) return { match: false, error: "Database not available" };
  try {
    const result = await db.execute(sql`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
    `);
    const dbTables = result[0].map((r) => r.TABLE_NAME);
    const codeTables = [
      "users",
      "challenges",
      "participations",
      "notifications",
      "notification_settings",
      "badges",
      "user_badges",
      "cheers",
      "achievement_pages",
      "picked_comments",
      "reminders",
      "direct_messages",
      "challenge_templates",
      "follows",
      "search_history",
      "categories",
      "invitations",
      "invitation_uses",
      "participation_companions",
      "favorite_artists",
      "twitter_follow_status",
      "oauth_pkce_data",
      "twitter_user_cache",
      "challenge_members",
      "ticket_transfers",
      "ticket_waitlist",
      "collaborators",
      "collaborator_invitations",
      "achievements",
      "user_achievements",
      "challenge_stats"
    ];
    const missingInDb = codeTables.filter((t2) => !dbTables.includes(t2));
    const extraInDb = dbTables.filter((t2) => !codeTables.includes(t2));
    return {
      match: missingInDb.length === 0 && extraInDb.length === 0,
      dbTables,
      codeTables,
      missingInDb,
      extraInDb
    };
  } catch (error) {
    return { match: false, error: String(error) };
  }
}
var init_stats_db = __esm({
  "server/db/stats-db.ts"() {
    "use strict";
    init_connection();
    init_schema2();
    init_challenge_db();
  }
});

// server/db/audit-db.ts
async function createAuditLog(data) {
  const db = await getDb();
  if (!db) {
    console.warn("[AuditLog] Database not available, skipping audit log");
    return null;
  }
  try {
    const result = await db.insert(auditLogs).values(data);
    return result[0].insertId;
  } catch (error) {
    console.error("[AuditLog] Failed to create audit log:", error);
    return null;
  }
}
async function logAction(params) {
  return createAuditLog({
    requestId: params.requestId,
    action: params.action,
    entityType: params.entityType,
    targetId: params.targetId,
    actorId: params.actorId,
    actorName: params.actorName,
    actorRole: params.actorRole,
    beforeData: params.beforeData,
    afterData: params.afterData,
    reason: params.reason,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent
  });
}
async function getAuditLogs(options) {
  const db = await getDb();
  if (!db) return [];
  const limit = options?.limit || 100;
  const offset = options?.offset || 0;
  let query = db.select().from(auditLogs);
  const conditions = [];
  if (options?.entityType) {
    conditions.push(eq(auditLogs.entityType, options.entityType));
  }
  if (options?.targetId) {
    conditions.push(eq(auditLogs.targetId, options.targetId));
  }
  if (options?.actorId) {
    conditions.push(eq(auditLogs.actorId, options.actorId));
  }
  if (options?.startDate) {
    conditions.push(gte(auditLogs.createdAt, options.startDate));
  }
  if (options?.endDate) {
    conditions.push(lte(auditLogs.createdAt, options.endDate));
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  const result = await query.orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);
  return result;
}
async function getAuditLogsByRequestId(requestId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs).where(eq(auditLogs.requestId, requestId)).orderBy(desc(auditLogs.createdAt));
}
async function getEntityAuditHistory(entityType, targetId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs).where(and(
    eq(auditLogs.entityType, entityType),
    eq(auditLogs.targetId, targetId)
  )).orderBy(desc(auditLogs.createdAt));
}
async function getUserAuditHistory(actorId, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs).where(eq(auditLogs.actorId, actorId)).orderBy(desc(auditLogs.createdAt)).limit(limit);
}
var init_audit_db = __esm({
  "server/db/audit-db.ts"() {
    "use strict";
    init_connection();
    init_schema2();
  }
});

// server/db/index.ts
var init_db = __esm({
  "server/db/index.ts"() {
    "use strict";
    init_connection();
    init_user_db();
    init_challenge_db();
    init_participation_db();
    init_notification_db();
    init_badge_db();
    init_social_db();
    init_messaging_db();
    init_follow_db();
    init_ranking_db();
    init_category_db();
    init_invitation_db();
    init_profile_db();
    init_companion_db();
    init_ai_db();
    init_ticket_db();
    init_stats_db();
    init_audit_db();
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  addToTicketWaitlist: () => addToTicketWaitlist,
  and: () => and,
  asc: () => asc,
  awardBadge: () => awardBadge,
  awardFollowerBadge: () => awardFollowerBadge,
  bulkRestoreParticipations: () => bulkRestoreParticipations,
  bulkSoftDeleteParticipations: () => bulkSoftDeleteParticipations,
  cancelParticipation: () => cancelParticipation,
  cancelTicketTransfer: () => cancelTicketTransfer,
  checkAndAwardBadges: () => checkAndAwardBadges,
  clearSearchHistoryForUser: () => clearSearchHistoryForUser,
  compareSchemas: () => compareSchemas,
  confirmInvitationUse: () => confirmInvitationUse,
  count: () => count,
  createAchievementPage: () => createAchievementPage,
  createAuditLog: () => createAuditLog,
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
  desc: () => desc,
  eq: () => eq,
  followUser: () => followUser,
  generateSlug: () => generateSlug,
  getAchievementPage: () => getAchievementPage,
  getActiveParticipationById: () => getActiveParticipationById,
  getAllBadges: () => getAllBadges,
  getAllCategories: () => getAllCategories,
  getAllEvents: () => getAllEvents,
  getAllUsers: () => getAllUsers,
  getAttendanceTypeCounts: () => getAttendanceTypeCounts,
  getAuditLogs: () => getAuditLogs,
  getAuditLogsByRequestId: () => getAuditLogsByRequestId,
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
  getDbSchema: () => getDbSchema,
  getDeletedParticipations: () => getDeletedParticipations,
  getDirectMessagesForUser: () => getDirectMessagesForUser,
  getEntityAuditHistory: () => getEntityAuditHistory,
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
  getInvitedParticipants: () => getInvitedParticipants,
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
  getUserAuditHistory: () => getUserAuditHistory,
  getUserBadges: () => getUserBadges,
  getUserBadgesWithDetails: () => getUserBadgesWithDetails,
  getUserById: () => getUserById,
  getUserByOpenId: () => getUserByOpenId,
  getUserByTwitterId: () => getUserByTwitterId,
  getUserInvitationStats: () => getUserInvitationStats,
  getUserPublicProfile: () => getUserPublicProfile,
  getUserRankingPosition: () => getUserRankingPosition,
  getUserReminderForChallenge: () => getUserReminderForChallenge,
  getUsersWithNotificationEnabled: () => getUsersWithNotificationEnabled,
  getWaitlistUsersForNotification: () => getWaitlistUsersForNotification,
  gte: () => gte,
  inArray: () => inArray,
  incrementInvitationUseCount: () => incrementInvitationUseCount,
  incrementTemplateUseCount: () => incrementTemplateUseCount,
  invalidateEventsCache: () => invalidateEventsCache,
  isCommentPicked: () => isCommentPicked,
  isFollowing: () => isFollowing,
  isNull: () => isNull,
  isUserInWaitlist: () => isUserInWaitlist,
  like: () => like,
  logAction: () => logAction,
  lte: () => lte,
  markAllMessagesAsRead: () => markAllMessagesAsRead,
  markAllNotificationsAsRead: () => markAllNotificationsAsRead,
  markCommentAsUsedInVideo: () => markCommentAsUsedInVideo,
  markMessageAsRead: () => markMessageAsRead,
  markNotificationAsRead: () => markNotificationAsRead,
  markReminderAsSent: () => markReminderAsSent,
  ne: () => ne,
  or: () => or,
  pickComment: () => pickComment,
  recalculateChallengeCurrentValues: () => recalculateChallengeCurrentValues,
  recordInvitationUse: () => recordInvitationUse,
  refreshAllChallengeSummaries: () => refreshAllChallengeSummaries,
  refreshChallengeSummary: () => refreshChallengeSummary,
  removeFromTicketWaitlist: () => removeFromTicketWaitlist,
  restoreParticipation: () => restoreParticipation,
  saveSearchHistory: () => saveSearchHistory,
  searchChallenges: () => searchChallenges,
  searchChallengesForAI: () => searchChallengesForAI,
  sendCheer: () => sendCheer,
  sendDirectMessage: () => sendDirectMessage,
  softDeleteParticipation: () => softDeleteParticipation,
  sql: () => sql,
  ticketTransfers: () => ticketTransfers,
  ticketWaitlist: () => ticketWaitlist,
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
  updateUserGender: () => updateUserGender,
  updateUserRole: () => updateUserRole,
  upsertNotificationSettings: () => upsertNotificationSettings,
  upsertUser: () => upsertUser
});
var init_db2 = __esm({
  "server/db.ts"() {
    "use strict";
    init_db();
    init_schema2();
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
init_db2();

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
init_db2();
init_env();
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify as jwtVerify2 } from "jose";
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
      const { payload } = await jwtVerify2(cookieValue, secretKey, {
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
init_db2();
init_schema2();
import crypto from "crypto";
import { eq as eq3, lt as lt3 } from "drizzle-orm";

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
    const text10 = await response.text();
    console.error("Token exchange error:", text10);
    throw new Error(`Failed to exchange code for tokens: ${text10}`);
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
    const text10 = await response.text();
    console.error("User profile error:", text10);
    throw new Error(`Failed to get user profile: ${text10}`);
  }
  const json4 = await response.json();
  return json4.data;
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
    const text10 = await response.text();
    throw new Error(`Failed to refresh token: ${text10}`);
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
      await db.delete(oauthPkceData).where(lt3(oauthPkceData.expiresAt, /* @__PURE__ */ new Date())).catch(() => {
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
    const result = await db.select().from(oauthPkceData).where(eq3(oauthPkceData.state, state)).limit(1);
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
    await db.delete(oauthPkceData).where(eq3(oauthPkceData.state, state));
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
      const text10 = await response.text();
      console.error("Twitter user lookup error:", response.status, text10);
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

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

// server/_core/request-id.ts
import { randomUUID } from "crypto";
function generateRequestId() {
  return randomUUID();
}
var RESPONSE_REQUEST_ID_HEADER = "x-request-id";

// server/_core/trpc.ts
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var requestIdMiddleware = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  const requestId = ctx.req.headers["x-request-id"] || generateRequestId();
  ctx.res.setHeader(RESPONSE_REQUEST_ID_HEADER, requestId);
  if (process.env.NODE_ENV === "development") {
    console.log(`[tRPC] requestId=${requestId} path=${opts.path}`);
  }
  return next({
    ctx: {
      ...ctx,
      requestId
    }
  });
});
var publicProcedure = t.procedure.use(requestIdMiddleware);
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requestIdMiddleware).use(requireUser);
var adminProcedure = t.procedure.use(requestIdMiddleware).use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/routers/auth.ts
var authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  })
});

// server/routers/events.ts
import { z } from "zod";
init_db2();
var eventsRouter = router({
  // 公開イベント一覧取得
  list: publicProcedure.query(async () => {
    return getAllEvents();
  }),
  // ページネーション対応のイベント一覧取得
  listPaginated: publicProcedure.input(z.object({
    cursor: z.number().optional(),
    limit: z.number().min(1).max(50).default(20),
    filter: z.enum(["all", "solo", "group"]).optional()
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
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    console.log(`[events.getById] requestId=${requestId} input.id=${input.id} START`);
    try {
      const event = await getEventById(input.id);
      if (!event) {
        console.log(`[events.getById] requestId=${requestId} id=${input.id} NOT_FOUND elapsed=${Date.now() - startTime}ms`);
        return null;
      }
      const participantCount = await getTotalCompanionCountByEventId(input.id);
      console.log(`[events.getById] requestId=${requestId} id=${input.id} FOUND title="${event.title}" participantCount=${participantCount} elapsed=${Date.now() - startTime}ms`);
      return { ...event, participantCount };
    } catch (error) {
      console.error(`[events.getById] requestId=${requestId} id=${input.id} ERROR:`, error);
      throw error;
    }
  }),
  // 自分が作成したイベント一覧
  myEvents: protectedProcedure.query(async ({ ctx }) => {
    return getEventsByHostTwitterId(ctx.user.openId);
  }),
  // イベント作成
  create: publicProcedure.input(z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    eventDate: z.string(),
    venue: z.string().optional(),
    hostTwitterId: z.string(),
    hostName: z.string(),
    hostUsername: z.string().optional(),
    hostProfileImage: z.string().optional(),
    hostFollowersCount: z.number().optional(),
    hostDescription: z.string().optional(),
    goalType: z.enum(["attendance", "followers", "viewers", "points", "custom"]).optional(),
    goalValue: z.number().optional(),
    goalUnit: z.string().optional(),
    eventType: z.enum(["solo", "group"]).optional(),
    categoryId: z.number().optional(),
    externalUrl: z.string().optional(),
    ticketPresale: z.number().optional(),
    ticketDoor: z.number().optional(),
    ticketUrl: z.string().optional()
  })).mutation(async ({ input }) => {
    if (!input.hostTwitterId) {
      throw new Error("\u30ED\u30B0\u30A4\u30F3\u304C\u5FC5\u8981\u3067\u3059\u3002Twitter\u3067\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    }
    try {
      const eventId = await createEvent({
        hostUserId: null,
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
    } catch (error) {
      console.error("[Challenge Create] Error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Database not available") || errorMessage.includes("ECONNREFUSED")) {
        throw new Error("\u30B5\u30FC\u30D0\u30FC\u306B\u63A5\u7D9A\u3067\u304D\u307E\u305B\u3093\u3002\u3057\u3070\u3089\u304F\u5F85\u3063\u3066\u304B\u3089\u518D\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002");
      }
      if (errorMessage.includes("SQL") || errorMessage.includes("Failed query") || errorMessage.includes("ER_")) {
        throw new Error("\u30C1\u30E3\u30EC\u30F3\u30B8\u306E\u4F5C\u6210\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u5165\u529B\u5185\u5BB9\u3092\u78BA\u8A8D\u3057\u3066\u518D\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002");
      }
      if (errorMessage.includes("Duplicate entry") || errorMessage.includes("unique constraint")) {
        throw new Error("\u540C\u3058\u30BF\u30A4\u30C8\u30EB\u306E\u30C1\u30E3\u30EC\u30F3\u30B8\u304C\u3059\u3067\u306B\u5B58\u5728\u3057\u307E\u3059\u3002\u5225\u306E\u30BF\u30A4\u30C8\u30EB\u3092\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002");
      }
      throw new Error("\u30C1\u30E3\u30EC\u30F3\u30B8\u306E\u4F5C\u6210\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u3057\u3070\u3089\u304F\u5F85\u3063\u3066\u304B\u3089\u518D\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002");
    }
  }),
  // イベント更新
  update: protectedProcedure.input(z.object({
    id: z.number(),
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    eventDate: z.string().optional(),
    venue: z.string().optional(),
    isPublic: z.boolean().optional(),
    goalValue: z.number().optional(),
    goalUnit: z.string().optional(),
    goalType: z.enum(["attendance", "followers", "viewers", "points", "custom"]).optional(),
    eventType: z.enum(["solo", "group"]).optional(),
    categoryId: z.number().optional(),
    externalUrl: z.string().optional(),
    ticketPresale: z.number().optional(),
    ticketDoor: z.number().optional(),
    ticketUrl: z.string().optional()
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
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const event = await getEventById(input.id);
    if (!event || event.hostTwitterId !== ctx.user.openId) {
      throw new Error("Unauthorized");
    }
    await deleteEvent(input.id);
    return { success: true };
  })
});

// server/routers/participations.ts
import { z as z2 } from "zod";
init_db2();
init_schema2();
var participationsRouter = router({
  // イベントの参加者一覧
  listByEvent: publicProcedure.input(z2.object({ eventId: z2.number() })).query(async ({ input }) => {
    return getParticipationsByEventId(input.eventId);
  }),
  // 参加方法別集計
  getAttendanceTypeCounts: publicProcedure.input(z2.object({ eventId: z2.number() })).query(async ({ input }) => {
    return getAttendanceTypeCounts(input.eventId);
  }),
  // 自分の参加一覧
  myParticipations: protectedProcedure.query(async ({ ctx }) => {
    return getParticipationsByUserId(ctx.user.id);
  }),
  // 参加登録
  create: publicProcedure.input(z2.object({
    challengeId: z2.number(),
    message: z2.string().optional(),
    companionCount: z2.number().default(0),
    prefecture: z2.string().optional(),
    gender: z2.enum(["male", "female", "unspecified"]).optional(),
    attendanceType: z2.enum(["venue", "streaming", "both"]).default("venue"),
    twitterId: z2.string().optional(),
    displayName: z2.string(),
    username: z2.string().optional(),
    profileImage: z2.string().optional(),
    followersCount: z2.number().optional(),
    companions: z2.array(z2.object({
      displayName: z2.string(),
      twitterUsername: z2.string().optional(),
      twitterId: z2.string().optional(),
      profileImage: z2.string().optional()
    })).optional(),
    invitationCode: z2.string().optional()
  })).mutation(async ({ ctx, input }) => {
    if (!input.twitterId) {
      throw new Error("\u30ED\u30B0\u30A4\u30F3\u304C\u5FC5\u8981\u3067\u3059\u3002Twitter\u3067\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    }
    try {
      const participationId = await createParticipation({
        challengeId: input.challengeId,
        userId: ctx.user?.id,
        twitterId: input.twitterId,
        displayName: input.displayName,
        username: input.username,
        profileImage: input.profileImage,
        followersCount: input.followersCount,
        message: input.message,
        companionCount: input.companionCount,
        prefecture: input.prefecture,
        gender: input.gender || "unspecified",
        attendanceType: input.attendanceType || "venue",
        isAnonymous: false
      });
      if (participationId && ctx.requestId) {
        await logAction({
          requestId: ctx.requestId,
          action: AUDIT_ACTIONS.CREATE,
          entityType: ENTITY_TYPES.PARTICIPATION,
          targetId: participationId,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || input.displayName,
          afterData: {
            id: participationId,
            challengeId: input.challengeId,
            message: input.message,
            companionCount: input.companionCount,
            prefecture: input.prefecture
          },
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers["user-agent"]
        });
      }
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
      if (input.invitationCode && participationId && ctx.user?.id) {
        const invitation = await getInvitationByCode(input.invitationCode);
        if (invitation) {
          await confirmInvitationUse(invitation.id, ctx.user.id, participationId);
        }
      }
      const participations2 = await getParticipationsByEventId(input.challengeId);
      const participantNumber = participations2.length;
      return { id: participationId, requestId: ctx.requestId, participantNumber };
    } catch (error) {
      console.error("[Participation Create] Error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Database not available") || errorMessage.includes("ECONNREFUSED")) {
        throw new Error("\u30B5\u30FC\u30D0\u30FC\u306B\u63A5\u7D9A\u3067\u304D\u307E\u305B\u3093\u3002\u3057\u3070\u3089\u304F\u5F85\u3063\u3066\u304B\u3089\u518D\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002");
      }
      if (errorMessage.includes("Duplicate entry") || errorMessage.includes("unique constraint")) {
        throw new Error("\u3059\u3067\u306B\u53C2\u52A0\u8868\u660E\u6E08\u307F\u3067\u3059\u3002");
      }
      throw new Error("\u53C2\u52A0\u8868\u660E\u306E\u767B\u9332\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u3057\u3070\u3089\u304F\u5F85\u3063\u3066\u304B\u3089\u518D\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002");
    }
  }),
  // 匿名参加登録
  createAnonymous: publicProcedure.input(z2.object({
    challengeId: z2.number(),
    displayName: z2.string(),
    message: z2.string().optional(),
    companionCount: z2.number().default(0),
    prefecture: z2.string().optional(),
    companions: z2.array(z2.object({
      displayName: z2.string(),
      twitterUsername: z2.string().optional(),
      twitterId: z2.string().optional(),
      profileImage: z2.string().optional()
    })).optional()
  })).mutation(async ({ ctx, input }) => {
    const participationId = await createParticipation({
      challengeId: input.challengeId,
      displayName: input.displayName,
      message: input.message,
      companionCount: input.companionCount,
      prefecture: input.prefecture,
      isAnonymous: true
    });
    if (participationId && ctx.requestId) {
      await logAction({
        requestId: ctx.requestId,
        action: AUDIT_ACTIONS.CREATE,
        entityType: ENTITY_TYPES.PARTICIPATION,
        targetId: participationId,
        actorName: input.displayName + " (\u533F\u540D)",
        afterData: {
          id: participationId,
          challengeId: input.challengeId,
          message: input.message,
          companionCount: input.companionCount,
          prefecture: input.prefecture,
          isAnonymous: true
        },
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers["user-agent"]
      });
    }
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
    return { id: participationId, requestId: ctx.requestId };
  }),
  // 参加表明の更新（認証必須 - 自分の投稿のみ編集可能）
  update: protectedProcedure.input(z2.object({
    id: z2.number(),
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
  })).mutation(async ({ ctx, input }) => {
    const participation = await getActiveParticipationById(input.id);
    if (!participation) {
      throw new Error("\u53C2\u52A0\u8868\u660E\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
    }
    if (participation.userId !== ctx.user.id) {
      throw new Error("\u81EA\u5206\u306E\u53C2\u52A0\u8868\u660E\u306E\u307F\u7DE8\u96C6\u3067\u304D\u307E\u3059\u3002");
    }
    const beforeData = {
      id: participation.id,
      message: participation.message,
      prefecture: participation.prefecture,
      companionCount: participation.companionCount,
      gender: participation.gender
    };
    await updateParticipation(input.id, {
      message: input.message,
      prefecture: input.prefecture,
      companionCount: input.companionCount,
      gender: input.gender
    });
    if (ctx.requestId) {
      await logAction({
        requestId: ctx.requestId,
        action: AUDIT_ACTIONS.EDIT,
        entityType: ENTITY_TYPES.PARTICIPATION,
        targetId: input.id,
        actorId: ctx.user.id,
        actorName: ctx.user.name || void 0,
        beforeData,
        afterData: {
          id: input.id,
          message: input.message,
          prefecture: input.prefecture,
          companionCount: input.companionCount,
          gender: input.gender
        },
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers["user-agent"]
      });
    }
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
    return { success: true, requestId: ctx.requestId };
  }),
  // 参加取消（ソフトデリート）
  delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
    const participation = await getActiveParticipationById(input.id);
    if (!participation) {
      throw new Error("\u53C2\u52A0\u8868\u660E\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
    }
    if (participation.userId !== ctx.user.id) {
      throw new Error("\u81EA\u5206\u306E\u53C2\u52A0\u8868\u660E\u306E\u307F\u524A\u9664\u3067\u304D\u307E\u3059\u3002");
    }
    const beforeData = {
      id: participation.id,
      challengeId: participation.challengeId,
      message: participation.message,
      displayName: participation.displayName,
      deletedAt: null
    };
    await softDeleteParticipation(input.id, ctx.user.id);
    if (ctx.requestId) {
      await logAction({
        requestId: ctx.requestId,
        action: AUDIT_ACTIONS.DELETE,
        entityType: ENTITY_TYPES.PARTICIPATION,
        targetId: input.id,
        actorId: ctx.user.id,
        actorName: ctx.user.name || void 0,
        beforeData,
        afterData: {
          id: input.id,
          deletedAt: (/* @__PURE__ */ new Date()).toISOString(),
          deletedBy: ctx.user.id
        },
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers["user-agent"]
      });
    }
    return { success: true, requestId: ctx.requestId };
  }),
  // ソフトデリート（明示的なAPI）
  softDelete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
    const participation = await getActiveParticipationById(input.id);
    if (!participation) {
      throw new Error("\u53C2\u52A0\u8868\u660E\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
    }
    if (participation.userId !== ctx.user.id) {
      throw new Error("\u81EA\u5206\u306E\u53C2\u52A0\u8868\u660E\u306E\u307F\u524A\u9664\u3067\u304D\u307E\u3059\u3002");
    }
    const beforeData = {
      id: participation.id,
      challengeId: participation.challengeId,
      message: participation.message,
      displayName: participation.displayName,
      deletedAt: null
    };
    const result = await softDeleteParticipation(input.id, ctx.user.id);
    if (ctx.requestId) {
      await logAction({
        requestId: ctx.requestId,
        action: AUDIT_ACTIONS.DELETE,
        entityType: ENTITY_TYPES.PARTICIPATION,
        targetId: input.id,
        actorId: ctx.user.id,
        actorName: ctx.user.name || void 0,
        beforeData,
        afterData: {
          id: input.id,
          deletedAt: (/* @__PURE__ */ new Date()).toISOString(),
          deletedBy: ctx.user.id
        },
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers["user-agent"]
      });
    }
    return { success: true, challengeId: result.challengeId, requestId: ctx.requestId };
  }),
  // 参加をキャンセル（チケット譲渡オプション付き）
  cancel: protectedProcedure.input(z2.object({
    participationId: z2.number(),
    createTransfer: z2.boolean().default(false),
    transferComment: z2.string().max(500).optional(),
    userUsername: z2.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const result = await cancelParticipation(input.participationId, ctx.user.id);
    if (!result.success) {
      return result;
    }
    if (ctx.requestId) {
      await logAction({
        requestId: ctx.requestId,
        action: AUDIT_ACTIONS.DELETE,
        entityType: ENTITY_TYPES.PARTICIPATION,
        targetId: input.participationId,
        actorId: ctx.user.id,
        actorName: ctx.user.name || void 0,
        reason: "\u53C2\u52A0\u30AD\u30E3\u30F3\u30BB\u30EB" + (input.createTransfer ? " (\u30C1\u30B1\u30C3\u30C8\u8B72\u6E21\u3042\u308A)" : ""),
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers["user-agent"]
      });
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
    return { success: true, challengeId: result.challengeId, requestId: ctx.requestId };
  })
});

// server/routers/notifications.ts
import { z as z3 } from "zod";
init_db2();
var notificationsRouter = router({
  // 通知設定取得
  getSettings: protectedProcedure.input(z3.object({ challengeId: z3.number() })).query(async ({ ctx, input }) => {
    const settings = await getNotificationSettings(ctx.user.id);
    return settings;
  }),
  // 通知設定更新
  updateSettings: protectedProcedure.input(z3.object({
    challengeId: z3.number(),
    onGoalReached: z3.boolean().optional(),
    onMilestone25: z3.boolean().optional(),
    onMilestone50: z3.boolean().optional(),
    onMilestone75: z3.boolean().optional(),
    onNewParticipant: z3.boolean().optional(),
    expoPushToken: z3.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const { challengeId, ...settings } = input;
    await upsertNotificationSettings(ctx.user.id, challengeId, settings);
    return { success: true };
  }),
  // 通知履歴取得
  list: protectedProcedure.input(z3.object({
    limit: z3.number().optional().default(20),
    cursor: z3.number().optional()
    // 最後に取得したnotificationId
  })).query(async ({ ctx, input }) => {
    const notifications2 = await getNotificationsByUserId(
      ctx.user.id,
      input.limit,
      input.cursor
    );
    return {
      items: notifications2,
      nextCursor: notifications2.length === input.limit ? notifications2[notifications2.length - 1].id : void 0
    };
  }),
  // 通知を既読にする
  markAsRead: protectedProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
    await markNotificationAsRead(input.id);
    return { success: true };
  }),
  // 全ての通知を既読にする
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await markAllNotificationsAsRead(ctx.user.id);
    return { success: true };
  })
});

// server/routers/ogp.ts
import { z as z4 } from "zod";

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

// server/routers/ogp.ts
init_db2();
var ogpRouter = router({
  // チャレンジのシェア用OGP画像を生成
  generateChallengeOgp: publicProcedure.input(z4.object({ challengeId: z4.number() })).mutation(async ({ input }) => {
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
  }),
  // 招待リンク用OGP画像を生成
  generateInviteOgp: publicProcedure.input(z4.object({ code: z4.string() })).mutation(async ({ input }) => {
    const invitation = await getInvitationByCode(input.code);
    if (!invitation) {
      throw new Error("Invitation not found");
    }
    const challenge = await getEventById(invitation.challengeId);
    if (!challenge) {
      throw new Error("Challenge not found");
    }
    const currentValue = challenge.currentValue || 0;
    const goalValue = challenge.goalValue || 100;
    const progress = Math.min(Math.round(currentValue / goalValue * 100), 100);
    const unit = challenge.goalUnit || "\u4EBA";
    const inviterName = invitation.inviterName || "\u53CB\u9054";
    const customTitle = invitation.customTitle || challenge.title;
    const customMessage = invitation.customMessage || "";
    const prompt = `Create a personalized invitation card for a Japanese idol fan challenge app called "\u52D5\u54E1\u3061\u3083\u308C\u3093\u3058".

Design requirements:
- Modern dark theme with pink to purple gradient accents (#EC4899 to #8B5CF6)
- Large invitation text: "\u{1F389} ${inviterName}\u3055\u3093\u304B\u3089\u306E\u62DB\u5F85"
- Challenge title: "${customTitle}"
- Progress: ${currentValue}/${goalValue}${unit} (${progress}%)
${customMessage ? `- Personal message in speech bubble: "${customMessage.substring(0, 100)}"` : ""}
- Include a "Join Now" call-to-action button design
- Japanese text style with cute idol aesthetic
- Include sparkles, hearts, and star decorations
- Aspect ratio 1200x630 (Twitter/OGP standard)
- Text should be large and readable
- Include "#\u52D5\u54E1\u3061\u3083\u308C\u3093\u3058" hashtag at bottom
- Make it feel personal and welcoming`;
    try {
      const result = await generateImage({ prompt });
      return {
        url: result.url,
        title: `${inviterName}\u3055\u3093\u304B\u3089\u300C${customTitle}\u300D\u3078\u306E\u62DB\u5F85`,
        description: customMessage || `\u4E00\u7DD2\u306B\u30C1\u30E3\u30EC\u30F3\u30B8\u306B\u53C2\u52A0\u3057\u3088\u3046\uFF01\u76EE\u6A19: ${goalValue}${unit}`
      };
    } catch (error) {
      console.error("Invite OGP image generation failed:", error);
      throw new Error("Failed to generate invite OGP image");
    }
  }),
  // 招待リンクのOGP情報を取得（画像生成なし、メタデータのみ）
  getInviteOgpMeta: publicProcedure.input(z4.object({ code: z4.string() })).query(async ({ input }) => {
    const invitation = await getInvitationByCode(input.code);
    if (!invitation) {
      return null;
    }
    const challenge = await getEventById(invitation.challengeId);
    if (!challenge) {
      return null;
    }
    const goalValue = challenge.goalValue || 100;
    const unit = challenge.goalUnit || "\u4EBA";
    const inviterName = invitation.inviterName || "\u53CB\u9054";
    const customTitle = invitation.customTitle || challenge.title;
    const customMessage = invitation.customMessage || "";
    return {
      title: `${inviterName}\u3055\u3093\u304B\u3089\u300C${customTitle}\u300D\u3078\u306E\u62DB\u5F85`,
      description: customMessage || `\u4E00\u7DD2\u306B\u30C1\u30E3\u30EC\u30F3\u30B8\u306B\u53C2\u52A0\u3057\u3088\u3046\uFF01\u76EE\u6A19: ${goalValue}${unit}`,
      inviterName,
      challengeTitle: customTitle,
      originalTitle: challenge.title,
      customMessage,
      challengeId: challenge.id
    };
  })
});

// server/routers/badges.ts
import { z as z5 } from "zod";
init_db2();
var badgesRouter = router({
  // 全バッジ一覧
  list: publicProcedure.query(async () => {
    return getAllBadges();
  }),
  // ユーザーのバッジ一覧
  myBadges: protectedProcedure.query(async ({ ctx }) => {
    return getUserBadgesWithDetails(ctx.user.id);
  }),
  // バッジ付与（管理者用）
  award: protectedProcedure.input(z5.object({
    userId: z5.number(),
    badgeId: z5.number(),
    challengeId: z5.number().optional()
  })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Admin access required");
    }
    const result = await awardBadge(input.userId, input.badgeId, input.challengeId);
    return { success: !!result, id: result };
  })
});

// server/routers/picked-comments.ts
import { z as z6 } from "zod";
init_db2();
var pickedCommentsRouter = router({
  // チャレンジのピックアップコメント一覧
  list: publicProcedure.input(z6.object({ challengeId: z6.number() })).query(async ({ input }) => {
    return getPickedCommentsWithParticipation(input.challengeId);
  }),
  // コメントをピックアップ（管理者/ホスト用）
  pick: protectedProcedure.input(z6.object({
    participationId: z6.number(),
    challengeId: z6.number(),
    reason: z6.string().optional()
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
  unpick: protectedProcedure.input(z6.object({ participationId: z6.number(), challengeId: z6.number() })).mutation(async ({ ctx, input }) => {
    const challenge = await getEventById(input.challengeId);
    if (!challenge) throw new Error("Challenge not found");
    if (challenge.hostUserId !== ctx.user.id && ctx.user.role !== "admin") {
      throw new Error("Permission denied");
    }
    await unpickComment(input.participationId);
    return { success: true };
  }),
  // 動画使用済みにマーク
  markAsUsed: protectedProcedure.input(z6.object({ id: z6.number(), challengeId: z6.number() })).mutation(async ({ ctx, input }) => {
    const challenge = await getEventById(input.challengeId);
    if (!challenge) throw new Error("Challenge not found");
    if (challenge.hostUserId !== ctx.user.id && ctx.user.role !== "admin") {
      throw new Error("Permission denied");
    }
    await markCommentAsUsedInVideo(input.id);
    return { success: true };
  }),
  // コメントがピックアップされているかチェック
  isPicked: publicProcedure.input(z6.object({ participationId: z6.number() })).query(async ({ input }) => {
    return isCommentPicked(input.participationId);
  })
});

// server/routers/prefectures.ts
import { z as z7 } from "zod";
init_db2();
var prefecturesRouter = router({
  // 地域ランキング
  ranking: publicProcedure.input(z7.object({ challengeId: z7.number() })).query(async ({ input }) => {
    return getPrefectureRanking(input.challengeId);
  }),
  // 地域フィルター付き参加者一覧
  participations: publicProcedure.input(z7.object({ challengeId: z7.number(), prefecture: z7.string() })).query(async ({ input }) => {
    return getParticipationsByPrefectureFilter(input.challengeId, input.prefecture);
  })
});

// server/routers/cheers.ts
import { z as z8 } from "zod";
init_db2();
var cheersRouter = router({
  // エールを送る
  send: protectedProcedure.input(z8.object({
    toParticipationId: z8.number(),
    toUserId: z8.number().optional(),
    challengeId: z8.number(),
    message: z8.string().optional(),
    emoji: z8.string().default("\u{1F44F}")
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
  forParticipation: publicProcedure.input(z8.object({ participationId: z8.number() })).query(async ({ input }) => {
    return getCheersForParticipation(input.participationId);
  }),
  // チャレンジのエール一覧
  forChallenge: publicProcedure.input(z8.object({ challengeId: z8.number() })).query(async ({ input }) => {
    return getCheersForChallenge(input.challengeId);
  }),
  // エール数を取得
  count: publicProcedure.input(z8.object({ participationId: z8.number() })).query(async ({ input }) => {
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
});

// server/routers/achievements.ts
import { z as z9 } from "zod";
init_db2();
var achievementsRouter = router({
  // 達成記念ページを作成
  create: protectedProcedure.input(z9.object({
    challengeId: z9.number(),
    title: z9.string(),
    message: z9.string().optional()
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
  get: publicProcedure.input(z9.object({ challengeId: z9.number() })).query(async ({ input }) => {
    return getAchievementPage(input.challengeId);
  }),
  // 達成記念ページを更新
  update: protectedProcedure.input(z9.object({
    challengeId: z9.number(),
    title: z9.string().optional(),
    message: z9.string().optional(),
    isPublic: z9.boolean().optional()
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
});

// server/routers/reminders.ts
import { z as z10 } from "zod";
init_db2();
var remindersRouter = router({
  // リマインダーを作成
  create: protectedProcedure.input(z10.object({
    challengeId: z10.number(),
    reminderType: z10.enum(["day_before", "day_of", "hour_before", "custom"]),
    customTime: z10.string().optional()
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
  getForChallenge: protectedProcedure.input(z10.object({ challengeId: z10.number() })).query(async ({ ctx, input }) => {
    return getUserReminderForChallenge(ctx.user.id, input.challengeId);
  }),
  // リマインダーを更新
  update: protectedProcedure.input(z10.object({
    id: z10.number(),
    reminderType: z10.enum(["day_before", "day_of", "hour_before", "custom"]).optional(),
    customTime: z10.string().optional()
  })).mutation(async ({ input }) => {
    await updateReminder(input.id, {
      reminderType: input.reminderType,
      customTime: input.customTime ? new Date(input.customTime) : void 0
    });
    return { success: true };
  }),
  // リマインダーを削除
  delete: protectedProcedure.input(z10.object({ id: z10.number() })).mutation(async ({ input }) => {
    await deleteReminder(input.id);
    return { success: true };
  })
});

// server/routers/dm.ts
import { z as z11 } from "zod";
init_db2();
var dmRouter = router({
  // DMを送信
  send: protectedProcedure.input(z11.object({
    toUserId: z11.number(),
    challengeId: z11.number(),
    message: z11.string().min(1).max(1e3)
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
  conversations: protectedProcedure.input(z11.object({
    limit: z11.number().optional().default(20),
    cursor: z11.number().optional()
    // 最後に取得したmessageId
  })).query(async ({ ctx, input }) => {
    const conversations = await getConversationList(
      ctx.user.id,
      input.limit,
      input.cursor
    );
    return {
      items: conversations,
      nextCursor: conversations.length === input.limit ? conversations[conversations.length - 1].id : void 0
    };
  }),
  // 特定の会話を取得
  getConversation: protectedProcedure.input(z11.object({
    partnerId: z11.number(),
    challengeId: z11.number()
  })).query(async ({ ctx, input }) => {
    return getConversation(ctx.user.id, input.partnerId, input.challengeId);
  }),
  // 未読メッセージ数を取得
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return getUnreadMessageCount(ctx.user.id);
  }),
  // メッセージを既読にする
  markAsRead: protectedProcedure.input(z11.object({ id: z11.number() })).mutation(async ({ input }) => {
    await markMessageAsRead(input.id);
    return { success: true };
  }),
  // 特定の相手からのメッセージを全て既読にする
  markAllAsRead: protectedProcedure.input(z11.object({ fromUserId: z11.number() })).mutation(async ({ ctx, input }) => {
    await markAllMessagesAsRead(ctx.user.id, input.fromUserId);
    return { success: true };
  })
});

// server/routers/templates.ts
import { z as z12 } from "zod";
init_db2();
var templatesRouter = router({
  // テンプレートを作成
  create: protectedProcedure.input(z12.object({
    name: z12.string().min(1).max(100),
    description: z12.string().optional(),
    goalType: z12.enum(["attendance", "followers", "viewers", "points", "custom"]),
    goalValue: z12.number().min(1),
    goalUnit: z12.string().default("\u4EBA"),
    eventType: z12.enum(["solo", "group"]),
    ticketPresale: z12.number().optional(),
    ticketDoor: z12.number().optional(),
    isPublic: z12.boolean().default(false)
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
  get: publicProcedure.input(z12.object({ id: z12.number() })).query(async ({ input }) => {
    return getChallengeTemplateById(input.id);
  }),
  // テンプレートを更新
  update: protectedProcedure.input(z12.object({
    id: z12.number(),
    name: z12.string().min(1).max(100).optional(),
    description: z12.string().optional(),
    goalType: z12.enum(["attendance", "followers", "viewers", "points", "custom"]).optional(),
    goalValue: z12.number().min(1).optional(),
    goalUnit: z12.string().optional(),
    eventType: z12.enum(["solo", "group"]).optional(),
    ticketPresale: z12.number().optional(),
    ticketDoor: z12.number().optional(),
    isPublic: z12.boolean().optional()
  })).mutation(async ({ ctx, input }) => {
    const template = await getChallengeTemplateById(input.id);
    if (!template) throw new Error("Template not found");
    if (template.userId !== ctx.user.id) throw new Error("Permission denied");
    await updateChallengeTemplate(input.id, input);
    return { success: true };
  }),
  // テンプレートを削除
  delete: protectedProcedure.input(z12.object({ id: z12.number() })).mutation(async ({ ctx, input }) => {
    const template = await getChallengeTemplateById(input.id);
    if (!template) throw new Error("Template not found");
    if (template.userId !== ctx.user.id) throw new Error("Permission denied");
    await deleteChallengeTemplate(input.id);
    return { success: true };
  }),
  // テンプレートの使用回数をインクリメント
  incrementUseCount: protectedProcedure.input(z12.object({ id: z12.number() })).mutation(async ({ input }) => {
    await incrementTemplateUseCount(input.id);
    return { success: true };
  })
});

// server/routers/search.ts
import { z as z13 } from "zod";
init_db2();
var searchRouter = router({
  // チャレンジを検索
  challenges: publicProcedure.input(z13.object({ query: z13.string().min(1) })).query(async ({ input }) => {
    return searchChallenges(input.query);
  }),
  // ページネーション対応の検索
  challengesPaginated: publicProcedure.input(z13.object({
    query: z13.string().min(1),
    cursor: z13.number().optional(),
    limit: z13.number().min(1).max(50).default(20)
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
  saveHistory: protectedProcedure.input(z13.object({ query: z13.string(), resultCount: z13.number() })).mutation(async ({ ctx, input }) => {
    const result = await saveSearchHistory({
      userId: ctx.user.id,
      query: input.query,
      resultCount: input.resultCount
    });
    return { success: !!result, id: result };
  }),
  // 検索履歴を取得
  history: protectedProcedure.input(z13.object({ limit: z13.number().optional() })).query(async ({ ctx, input }) => {
    return getSearchHistoryForUser(ctx.user.id, input.limit || 10);
  }),
  // 検索履歴をクリア
  clearHistory: protectedProcedure.mutation(async ({ ctx }) => {
    await clearSearchHistoryForUser(ctx.user.id);
    return { success: true };
  })
});

// server/routers/follows.ts
import { z as z14 } from "zod";
init_db2();
var followsRouter = router({
  // フォローする
  follow: protectedProcedure.input(z14.object({
    followeeId: z14.number(),
    followeeName: z14.string().optional(),
    followeeImage: z14.string().optional()
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
  unfollow: protectedProcedure.input(z14.object({ followeeId: z14.number() })).mutation(async ({ ctx, input }) => {
    await unfollowUser(ctx.user.id, input.followeeId);
    return { success: true };
  }),
  // フォロー中のユーザー一覧
  following: protectedProcedure.query(async ({ ctx }) => {
    return getFollowingForUser(ctx.user.id);
  }),
  // フォロワー一覧（特定ユーザーまたは自分）
  followers: publicProcedure.input(z14.object({ userId: z14.number().optional() }).optional()).query(async ({ ctx, input }) => {
    const targetUserId = input?.userId || ctx.user?.id;
    if (!targetUserId) return [];
    return getFollowersForUser(targetUserId);
  }),
  // フォローしているかチェック
  isFollowing: protectedProcedure.input(z14.object({ followeeId: z14.number() })).query(async ({ ctx, input }) => {
    return isFollowing(ctx.user.id, input.followeeId);
  }),
  // フォロワー数を取得
  followerCount: publicProcedure.input(z14.object({ userId: z14.number() })).query(async ({ input }) => {
    return getFollowerCount(input.userId);
  }),
  // 特定ユーザーのフォロワーID一覧を取得（ランキング優先表示用）
  followerIds: publicProcedure.input(z14.object({ userId: z14.number() })).query(async ({ input }) => {
    return getFollowerIdsForUser(input.userId);
  }),
  // フォロー中の数を取得
  followingCount: publicProcedure.input(z14.object({ userId: z14.number() })).query(async ({ input }) => {
    return getFollowingCount(input.userId);
  }),
  // 新着チャレンジ通知設定を更新
  updateNotification: protectedProcedure.input(z14.object({ followeeId: z14.number(), notify: z14.boolean() })).mutation(async ({ ctx, input }) => {
    await updateFollowNotification(ctx.user.id, input.followeeId, input.notify);
    return { success: true };
  })
});

// server/routers/rankings.ts
import { z as z15 } from "zod";
init_db2();
var rankingsRouter = router({
  // 貢献度ランキング
  contribution: publicProcedure.input(z15.object({
    period: z15.enum(["weekly", "monthly", "all"]).optional(),
    limit: z15.number().optional()
  })).query(async ({ input }) => {
    return getGlobalContributionRanking(input.period || "all", input.limit || 50);
  }),
  // チャレンジ達成率ランキング
  challengeAchievement: publicProcedure.input(z15.object({ limit: z15.number().optional() })).query(async ({ input }) => {
    return getChallengeAchievementRanking(input.limit || 50);
  }),
  // ホストランキング
  hosts: publicProcedure.input(z15.object({ limit: z15.number().optional() })).query(async ({ input }) => {
    return getHostRanking(input.limit || 50);
  }),
  // 自分のランキング位置を取得
  myPosition: protectedProcedure.input(z15.object({ period: z15.enum(["weekly", "monthly", "all"]).optional() })).query(async ({ ctx, input }) => {
    return getUserRankingPosition(ctx.user.id, input.period || "all");
  })
});

// server/routers/categories.ts
import { z as z16 } from "zod";
init_db2();
var categoriesRouter = router({
  // カテゴリ一覧を取得
  list: publicProcedure.query(async () => {
    return getAllCategories();
  }),
  // カテゴリ詳細を取得
  get: publicProcedure.input(z16.object({ id: z16.number() })).query(async ({ input }) => {
    return getCategoryById(input.id);
  }),
  // カテゴリ別チャレンジ一覧
  challenges: publicProcedure.input(z16.object({ categoryId: z16.number() })).query(async ({ input }) => {
    return getChallengesByCategory(input.categoryId);
  }),
  // カテゴリ作成（管理者のみ）
  create: protectedProcedure.input(z16.object({
    name: z16.string().min(1).max(100),
    slug: z16.string().min(1).max(100),
    description: z16.string().optional(),
    icon: z16.string().optional(),
    sortOrder: z16.number().optional()
  })).mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    return createCategory(input);
  }),
  // カテゴリ更新（管理者のみ）
  update: protectedProcedure.input(z16.object({
    id: z16.number(),
    name: z16.string().min(1).max(100).optional(),
    slug: z16.string().min(1).max(100).optional(),
    description: z16.string().optional(),
    icon: z16.string().optional(),
    sortOrder: z16.number().optional(),
    isActive: z16.boolean().optional()
  })).mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    const { id, ...data } = input;
    return updateCategory(id, data);
  }),
  // カテゴリ削除（管理者のみ）
  delete: protectedProcedure.input(z16.object({ id: z16.number() })).mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    return deleteCategory(input.id);
  })
});

// server/routers/invitations.ts
import { z as z17 } from "zod";
init_db2();
var invitationsRouter = router({
  // 招待リンクを作成
  create: protectedProcedure.input(z17.object({
    challengeId: z17.number(),
    maxUses: z17.number().optional(),
    expiresAt: z17.string().optional(),
    customMessage: z17.string().max(500).optional(),
    customTitle: z17.string().max(100).optional()
  })).mutation(async ({ ctx, input }) => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const result = await createInvitation({
      challengeId: input.challengeId,
      inviterId: ctx.user.id,
      inviterName: ctx.user.name || void 0,
      code,
      maxUses: input.maxUses,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : void 0,
      customMessage: input.customMessage || void 0,
      customTitle: input.customTitle || void 0
    });
    return { success: !!result, id: result, code };
  }),
  // 招待コードで情報を取得
  getByCode: publicProcedure.input(z17.object({ code: z17.string() })).query(async ({ input }) => {
    return getInvitationByCode(input.code);
  }),
  // チャレンジの招待一覧
  forChallenge: protectedProcedure.input(z17.object({ challengeId: z17.number() })).query(async ({ input }) => {
    return getInvitationsForChallenge(input.challengeId);
  }),
  // 自分が作成した招待一覧
  mine: protectedProcedure.query(async ({ ctx }) => {
    return getInvitationsForUser(ctx.user.id);
  }),
  // 招待を使用
  use: protectedProcedure.input(z17.object({ code: z17.string() })).mutation(async ({ ctx, input }) => {
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
  deactivate: protectedProcedure.input(z17.object({ id: z17.number() })).mutation(async ({ input }) => {
    await deactivateInvitation(input.id);
    return { success: true };
  }),
  // 招待の統計を取得
  stats: protectedProcedure.input(z17.object({ invitationId: z17.number() })).query(async ({ input }) => {
    return getInvitationStats(input.invitationId);
  }),
  // ユーザーの招待実績を取得
  myStats: protectedProcedure.query(async ({ ctx }) => {
    return getUserInvitationStats(ctx.user.id);
  }),
  // チャレンジの招待経由参加者一覧
  invitedParticipants: protectedProcedure.input(z17.object({ challengeId: z17.number() })).query(async ({ ctx, input }) => {
    return getInvitedParticipants(input.challengeId, ctx.user.id);
  })
});

// server/routers/profiles.ts
import { z as z18 } from "zod";
init_db2();
var profilesRouter = router({
  // ユーザーの公開プロフィールを取得
  get: publicProcedure.input(z18.object({ userId: z18.number() })).query(async ({ input }) => {
    return getUserPublicProfile(input.userId);
  }),
  // twitterIdでユーザーを取得（外部共有URL用）
  getByTwitterId: publicProcedure.input(z18.object({ twitterId: z18.string() })).query(async ({ input }) => {
    return getUserByTwitterId(input.twitterId);
  }),
  // 推し活状況を取得
  getOshikatsuStats: publicProcedure.input(z18.object({
    userId: z18.number().optional(),
    twitterId: z18.string().optional()
  })).query(async ({ input }) => {
    return getOshikatsuStats(input.userId, input.twitterId);
  }),
  // おすすめホスト（同じカテゴリのチャレンジを開催しているホスト）
  recommendedHosts: publicProcedure.input(z18.object({
    categoryId: z18.number().optional(),
    limit: z18.number().min(1).max(10).default(5)
  })).query(async ({ ctx, input }) => {
    const userId = ctx.user?.id;
    return getRecommendedHosts(userId, input.categoryId, input.limit);
  }),
  // ユーザーの性別を更新
  updateGender: protectedProcedure.input(z18.object({
    gender: z18.enum(["male", "female", "other"]).nullable()
  })).mutation(async ({ ctx, input }) => {
    return updateUserGender(ctx.user.id, input.gender);
  })
});

// server/routers/companions.ts
import { z as z19 } from "zod";
init_db2();
var companionsRouter = router({
  // 参加者の友人一覧を取得
  forParticipation: publicProcedure.input(z19.object({ participationId: z19.number() })).query(async ({ input }) => {
    return getCompanionsForParticipation(input.participationId);
  }),
  // チャレンジの友人一覧を取得
  forChallenge: publicProcedure.input(z19.object({ challengeId: z19.number() })).query(async ({ input }) => {
    return getCompanionsForChallenge(input.challengeId);
  }),
  // 自分が招待した友人の統計
  myInviteStats: protectedProcedure.query(async ({ ctx }) => {
    return getCompanionInviteStats(ctx.user.id);
  }),
  // 友人を削除
  delete: protectedProcedure.input(z19.object({ id: z19.number() })).mutation(async ({ ctx, input }) => {
    const stats2 = await getCompanionInviteStats(ctx.user.id);
    const companion = stats2.companions.find((c) => c.id === input.id);
    if (!companion) {
      throw new Error("Unauthorized");
    }
    await deleteCompanion(input.id);
    return { success: true };
  })
});

// server/routers/ai.ts
import { z as z20 } from "zod";
init_db2();
var aiRouter = router({
  // AI向けチャレンジ詳細取得（JOINなし・1ホップ）
  getChallenge: publicProcedure.input(z20.object({ id: z20.number() })).query(async ({ input }) => {
    return getChallengeForAI(input.id);
  }),
  // AI向け検索（意図タグベース）
  searchByTags: publicProcedure.input(z20.object({
    tags: z20.array(z20.string()),
    limit: z20.number().optional()
  })).query(async ({ input }) => {
    return searchChallengesForAI(input.tags, input.limit || 20);
  }),
  // チャレンジサマリーを手動更新
  refreshSummary: protectedProcedure.input(z20.object({ challengeId: z20.number() })).mutation(async ({ input }) => {
    await refreshChallengeSummary(input.challengeId);
    return { success: true };
  }),
  // 全チャレンジのサマリーを一括更新（管理者向け）
  refreshAllSummaries: protectedProcedure.mutation(async () => {
    const result = await refreshAllChallengeSummaries();
    return result;
  })
});

// server/routers/dev.ts
import { z as z21 } from "zod";
init_db2();
var devRouter = router({
  // サンプルチャレンジを生成
  generateSampleChallenges: publicProcedure.input(z21.object({ count: z21.number().min(1).max(20).default(6) })).mutation(async ({ input }) => {
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
    const count2 = Math.min(input.count, sampleChallenges.length);
    for (let i = 0; i < count2; i++) {
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
});

// server/routers/ticket-transfer.ts
import { z as z22 } from "zod";
init_db2();
var ticketTransferRouter = router({
  // 譲渡投稿を作成
  create: protectedProcedure.input(z22.object({
    challengeId: z22.number(),
    ticketCount: z22.number().min(1).max(10).default(1),
    priceType: z22.enum(["face_value", "negotiable", "free"]).default("face_value"),
    comment: z22.string().max(500).optional(),
    userUsername: z22.string().optional()
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
  listByChallenge: publicProcedure.input(z22.object({ challengeId: z22.number() })).query(async ({ input }) => {
    return getTicketTransfersForChallenge(input.challengeId);
  }),
  // 自分の譲渡投稿一覧を取得
  myTransfers: protectedProcedure.query(async ({ ctx }) => {
    return getTicketTransfersForUser(ctx.user.id);
  }),
  // 譲渡投稿のステータスを更新
  updateStatus: protectedProcedure.input(z22.object({
    id: z22.number(),
    status: z22.enum(["available", "reserved", "completed", "cancelled"])
  })).mutation(async ({ ctx, input }) => {
    await updateTicketTransferStatus(input.id, input.status);
    return { success: true };
  }),
  // 譲渡投稿をキャンセル
  cancel: protectedProcedure.input(z22.object({ id: z22.number() })).mutation(async ({ ctx, input }) => {
    const result = await cancelTicketTransfer(input.id, ctx.user.id);
    return { success: result };
  })
});

// server/routers/ticket-waitlist.ts
import { z as z23 } from "zod";
init_db2();
var ticketWaitlistRouter = router({
  // 待機リストに登録
  add: protectedProcedure.input(z23.object({
    challengeId: z23.number(),
    desiredCount: z23.number().min(1).max(10).default(1),
    userUsername: z23.string().optional()
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
  remove: protectedProcedure.input(z23.object({ challengeId: z23.number() })).mutation(async ({ ctx, input }) => {
    const result = await removeFromTicketWaitlist(input.challengeId, ctx.user.id);
    return { success: result };
  }),
  // チャレンジの待機リストを取得
  listByChallenge: publicProcedure.input(z23.object({ challengeId: z23.number() })).query(async ({ input }) => {
    return getTicketWaitlistForChallenge(input.challengeId);
  }),
  // 自分の待機リストを取得
  myWaitlist: protectedProcedure.query(async ({ ctx }) => {
    return getTicketWaitlistForUser(ctx.user.id);
  }),
  // 待機リストに登録しているかチェック
  isInWaitlist: protectedProcedure.input(z23.object({ challengeId: z23.number() })).query(async ({ ctx, input }) => {
    return isUserInWaitlist(input.challengeId, ctx.user.id);
  })
});

// server/routers/admin.ts
import { z as z25 } from "zod";
init_db2();

// server/routers/admin-participations.ts
import { z as z24 } from "zod";
init_db2();
var adminParticipationsRouter = router({
  // 削除済み参加一覧取得
  listDeleted: protectedProcedure.input(z24.object({
    challengeId: z24.number().optional(),
    userId: z24.number().optional(),
    limit: z24.number().optional().default(100)
  })).query(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    return getDeletedParticipations({
      challengeId: input.challengeId,
      userId: input.userId,
      limit: input.limit
    });
  }),
  // 参加を復元
  restore: protectedProcedure.input(z24.object({ id: z24.number() })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    const before = await getParticipationById(input.id);
    if (!before) {
      throw new Error("\u53C2\u52A0\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093");
    }
    const result = await restoreParticipation(input.id);
    const requestId = ctx.requestId || "unknown";
    await logAction({
      action: "RESTORE",
      entityType: "participation",
      targetId: input.id,
      actorId: ctx.user.id,
      actorName: ctx.user.name || "Unknown",
      beforeData: {
        deletedAt: before.deletedAt?.toISOString() || null,
        deletedBy: before.deletedBy
      },
      afterData: {
        deletedAt: null,
        deletedBy: null
      },
      requestId
    });
    return { ...result, requestId };
  }),
  // 一括ソフトデリート
  bulkDelete: protectedProcedure.input(z24.object({
    challengeId: z24.number().optional(),
    userId: z24.number().optional()
  })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    if (!input.challengeId && !input.userId) {
      throw new Error("challengeId \u307E\u305F\u306F userId \u3092\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044");
    }
    const result = await bulkSoftDeleteParticipations(
      { challengeId: input.challengeId, userId: input.userId },
      ctx.user.id
    );
    const requestId = ctx.requestId || "unknown";
    await logAction({
      action: "BULK_DELETE",
      entityType: "participation",
      targetId: input.challengeId || input.userId || 0,
      actorId: ctx.user.id,
      actorName: ctx.user.name || "Unknown",
      beforeData: null,
      afterData: {
        filter: input,
        deletedCount: result.deletedCount,
        affectedChallengeIds: result.affectedChallengeIds
      },
      requestId
    });
    return { success: true, ...result, requestId };
  }),
  // 一括復元
  bulkRestore: protectedProcedure.input(z24.object({
    challengeId: z24.number().optional(),
    userId: z24.number().optional()
  })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    if (!input.challengeId && !input.userId) {
      throw new Error("challengeId \u307E\u305F\u306F userId \u3092\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044");
    }
    const result = await bulkRestoreParticipations({
      challengeId: input.challengeId,
      userId: input.userId
    });
    const requestId = ctx.requestId || "unknown";
    await logAction({
      action: "BULK_RESTORE",
      entityType: "participation",
      targetId: input.challengeId || input.userId || 0,
      actorId: ctx.user.id,
      actorName: ctx.user.name || "Unknown",
      beforeData: null,
      afterData: {
        filter: input,
        restoredCount: result.restoredCount,
        affectedChallengeIds: result.affectedChallengeIds
      },
      requestId
    });
    return { success: true, ...result, requestId };
  }),
  // 監査ログ取得（参加関連のみ）
  getAuditLogs: protectedProcedure.input(z24.object({
    entityType: z24.string().optional(),
    targetId: z24.number().optional(),
    limit: z24.number().optional().default(50)
  })).query(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    return getAuditLogs({
      entityType: input.entityType || "participation",
      targetId: input.targetId,
      limit: input.limit
    });
  })
});

// server/routers/admin.ts
var adminRouter = router({
  // ユーザー一覧取得
  users: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    return getAllUsers();
  }),
  // ユーザー権限変更
  updateUserRole: protectedProcedure.input(z25.object({
    userId: z25.number(),
    role: z25.enum(["user", "admin"])
  })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    await updateUserRole(input.userId, input.role);
    return { success: true };
  }),
  // ユーザー詳細取得
  getUser: protectedProcedure.input(z25.object({ userId: z25.number() })).query(async ({ ctx, input }) => {
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
  }),
  // DB構造確認API
  getDbSchema: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    return getDbSchema();
  }),
  // テーブル構造とコードの比較
  compareSchemas: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    return compareSchemas();
  }),
  // 参加管理（削除済み投稿の管理）
  participations: adminParticipationsRouter
});

// server/routers/index.ts
var appRouter = router({
  auth: authRouter,
  events: eventsRouter,
  participations: participationsRouter,
  notifications: notificationsRouter,
  ogp: ogpRouter,
  badges: badgesRouter,
  pickedComments: pickedCommentsRouter,
  prefectures: prefecturesRouter,
  cheers: cheersRouter,
  achievements: achievementsRouter,
  reminders: remindersRouter,
  dm: dmRouter,
  templates: templatesRouter,
  search: searchRouter,
  follows: followsRouter,
  rankings: rankingsRouter,
  categories: categoriesRouter,
  invitations: invitationsRouter,
  profiles: profilesRouter,
  companions: companionsRouter,
  ai: aiRouter,
  dev: devRouter,
  ticketTransfer: ticketTransferRouter,
  ticketWaitlist: ticketWaitlistRouter,
  admin: adminRouter
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
function getRecentUsageHistory(count2 = 100) {
  return usageHistory.slice(-count2);
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
  const count2 = errorLogs.filter((l) => !l.resolved).length;
  errorLogs.forEach((log) => log.resolved = true);
  return count2;
}
function clearErrorLogs() {
  const count2 = errorLogs.length;
  errorLogs = [];
  return count2;
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

// server/schema-check.ts
init_db2();
var EXPECTED_SCHEMA = {
  version: "0023",
  // 最新のマイグレーション番号
  tables: {
    // participationsテーブル: 参加登録
    participations: {
      requiredColumns: [
        "id",
        "challengeId",
        "userId",
        "twitterId",
        "displayName",
        "username",
        "profileImage",
        "followersCount",
        "message",
        "companionCount",
        "prefecture",
        "gender",
        "contribution",
        "isAnonymous",
        "createdAt",
        "updatedAt",
        // v6.40で追加されたソフトデリート用カラム
        "deletedAt",
        "deletedBy"
      ]
    },
    // challengesテーブル: チャレンジ（イベント）
    // 実際のスキーマはgoalValue/currentValue/hostUserIdを使用
    challenges: {
      requiredColumns: [
        "id",
        "title",
        "slug",
        "description",
        "goalValue",
        // targetCountではなくgoalValue
        "currentValue",
        // currentCountではなくcurrentValue
        "eventDate",
        "venue",
        "prefecture",
        "hostUserId",
        // organizerIdではなくhostUserId
        "status",
        "createdAt",
        "updatedAt"
      ]
    },
    // usersテーブル: ユーザー
    // 実際のスキーマはopenId/nameを使用（twitterId/username/displayName/profileImageはない）
    users: {
      requiredColumns: [
        "id",
        "openId",
        // 認証用ID
        "name",
        // 表示名
        "email",
        "role",
        "createdAt",
        "updatedAt"
      ]
    }
  }
};
async function checkSchemaIntegrity() {
  const result = {
    status: "ok",
    expectedVersion: EXPECTED_SCHEMA.version,
    missingColumns: [],
    errors: [],
    checkedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    const db = await getDb();
    if (!db) {
      result.status = "error";
      result.errors.push("Database connection not available");
      return result;
    }
    for (const [tableName, tableSpec] of Object.entries(EXPECTED_SCHEMA.tables)) {
      try {
        const columnsResult = await db.execute(
          sql`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ${tableName}`
        );
        const rows = Array.isArray(columnsResult) ? columnsResult[0] : columnsResult;
        const existingColumns = new Set(
          rows.map((c) => c.COLUMN_NAME)
        );
        for (const requiredColumn of tableSpec.requiredColumns) {
          if (!existingColumns.has(requiredColumn)) {
            result.missingColumns.push({
              table: tableName,
              column: requiredColumn
            });
          }
        }
      } catch (tableError) {
        result.errors.push(
          `Failed to check table ${tableName}: ${tableError instanceof Error ? tableError.message : String(tableError)}`
        );
      }
    }
    try {
      const [migrations] = await db.execute(
        `SELECT hash FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 1`
      );
      if (Array.isArray(migrations) && migrations.length > 0) {
        result.actualVersion = migrations[0].hash?.slice(0, 8) || "unknown";
      }
    } catch {
      result.actualVersion = "unknown";
    }
    if (result.missingColumns.length > 0) {
      result.status = "mismatch";
    } else if (result.errors.length > 0) {
      result.status = "error";
    }
    return result;
  } catch (error) {
    result.status = "error";
    result.errors.push(
      `Schema check failed: ${error instanceof Error ? error.message : String(error)}`
    );
    return result;
  }
}
async function notifySchemaIssue(result) {
  const webhookUrl = process.env.DEPLOY_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("[schema-check] Webhook URL not configured, skipping notification");
    return;
  }
  const isDiscord = webhookUrl.includes("discord.com");
  const appName = process.env.APP_NAME || "Birthday Celebration";
  const environment = process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV || "unknown";
  const missingColumnsText = result.missingColumns.map((mc) => `${mc.table}.${mc.column}`).join(", ");
  const payload = isDiscord ? {
    embeds: [
      {
        title: "\u26A0\uFE0F Schema Mismatch Detected",
        description: `Database schema does not match expected schema.`,
        color: 16096779,
        // warning yellow
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        fields: [
          { name: "App", value: appName, inline: true },
          { name: "Environment", value: environment, inline: true },
          { name: "Expected Version", value: result.expectedVersion, inline: true },
          { name: "Missing Columns", value: missingColumnsText || "None" },
          ...result.errors.length > 0 ? [{ name: "Errors", value: result.errors.join("\n") }] : []
        ]
      }
    ]
  } : {
    attachments: [
      {
        color: "warning",
        title: "\u26A0\uFE0F Schema Mismatch Detected",
        text: `Database schema does not match expected schema.`,
        ts: Math.floor(Date.now() / 1e3),
        fields: [
          { title: "App", value: appName, short: true },
          { title: "Environment", value: environment, short: true },
          { title: "Expected Version", value: result.expectedVersion, short: true },
          { title: "Missing Columns", value: missingColumnsText || "None" },
          ...result.errors.length > 0 ? [{ title: "Errors", value: result.errors.join("\n") }] : []
        ]
      }
    ]
  };
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      console.error(`[schema-check] Failed to send notification: ${response.status}`);
    } else {
      console.log("[schema-check] Schema issue notification sent");
    }
  } catch (error) {
    console.error("[schema-check] Failed to send notification:", error);
  }
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
init_websocket();
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
  app.get("/api/health", async (_req, res) => {
    const baseInfo = {
      ok: true,
      timestamp: Date.now(),
      version: process.env.APP_VERSION || "unknown",
      gitSha: process.env.GIT_SHA || "unknown",
      builtAt: process.env.BUILT_AT || "unknown",
      nodeEnv: process.env.NODE_ENV || "development"
    };
    let dbStatus = { connected: false, latency: 0, error: "" };
    try {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db2(), db_exports));
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
    const checkCritical = _req.query.critical === "true";
    let criticalApis = {};
    if (checkCritical && dbStatus.connected) {
      try {
        const caller = appRouter.createCaller(await createContext({ req: _req, res, info: {} }));
        try {
          await caller.events.list();
          criticalApis.homeEvents = { ok: true };
        } catch (err) {
          criticalApis.homeEvents = { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
        try {
          await caller.rankings.hosts({ limit: 1 });
          criticalApis.rankings = { ok: true };
        } catch (err) {
          criticalApis.rankings = { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
      } catch (err) {
        criticalApis.error = err instanceof Error ? err.message : String(err);
      }
    }
    const checkSchema = _req.query.schema === "true";
    let schemaCheck;
    if (checkSchema) {
      try {
        schemaCheck = await checkSchemaIntegrity();
        if (schemaCheck.status === "mismatch") {
          await notifySchemaIssue(schemaCheck);
        }
      } catch (error) {
        console.error("[health] Schema check failed:", error);
        schemaCheck = {
          status: "error",
          expectedVersion: "unknown",
          missingColumns: [],
          errors: [error instanceof Error ? error.message : String(error)],
          checkedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
    }
    const overallOk = dbStatus.connected && (!checkCritical || Object.values(criticalApis).every((api) => typeof api === "object" && "ok" in api && api.ok));
    res.json({
      ...baseInfo,
      ok: overallOk,
      db: dbStatus,
      ...checkCritical && { critical: criticalApis },
      ...schemaCheck && { schema: schemaCheck }
    });
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
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db2(), db_exports));
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
    const count2 = resolveAllErrors();
    res.json({ success: true, count: count2 });
  });
  app.delete("/api/admin/errors", (_req, res) => {
    const count2 = clearErrorLogs();
    res.json({ success: true, count: count2 });
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
  initWebSocketServer(server);
  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
  });
}
startServer().catch(console.error);
