var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc6) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc6 = __getOwnPropDesc(from, key)) || desc6.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// drizzle/schema/users.ts
import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, boolean } from "drizzle-orm/mysql-core";
var users, twitterFollowStatus, oauthPkceData, twitterUserCache, userTwitterTokens;
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
      gender: mysqlEnum("gender", ["male", "female", "unspecified"]).default("unspecified").notNull(),
      prefecture: varchar("prefecture", { length: 32 }),
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
    userTwitterTokens = mysqlTable("user_twitter_tokens", {
      id: int("id").autoincrement().primaryKey(),
      /** users.openId と紐付け（例: "twitter:12345"） */
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      /** AES-256-GCM 暗号化済みアクセストークン (hex: iv + authTag + ciphertext) */
      encryptedAccessToken: text("encryptedAccessToken").notNull(),
      /** AES-256-GCM 暗号化済みリフレッシュトークン */
      encryptedRefreshToken: text("encryptedRefreshToken"),
      /** アクセストークン有効期限 */
      tokenExpiresAt: timestamp("tokenExpiresAt").notNull(),
      /** 付与されたスコープ */
      scope: varchar("scope", { length: 255 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
  }
});

// drizzle/schema/challenges.ts
import { mysqlTable as mysqlTable2, int as int2, varchar as varchar2, text as text2, timestamp as timestamp2, mysqlEnum as mysqlEnum2, boolean as boolean2, json } from "drizzle-orm/mysql-core";
var challenges, events, categories, challengeTemplates, challengeStats, challengeMembers;
var init_challenges = __esm({
  "drizzle/schema/challenges.ts"() {
    "use strict";
    challenges = mysqlTable2("challenges", {
      id: int2("id").autoincrement().primaryKey(),
      hostUserId: int2("hostUserId"),
      hostTwitterId: varchar2("hostTwitterId", { length: 64 }),
      hostName: varchar2("hostName", { length: 255 }).notNull(),
      hostUsername: varchar2("hostUsername", { length: 255 }),
      hostProfileImage: text2("hostProfileImage"),
      hostFollowersCount: int2("hostFollowersCount").default(0),
      hostDescription: text2("hostDescription"),
      title: varchar2("title", { length: 255 }).notNull(),
      slug: varchar2("slug", { length: 255 }),
      description: text2("description"),
      goalType: mysqlEnum2("goalType", ["attendance", "followers", "viewers", "points", "custom"]).default("attendance").notNull(),
      goalValue: int2("goalValue").default(100).notNull(),
      goalUnit: varchar2("goalUnit", { length: 32 }).default("\u4EBA").notNull(),
      currentValue: int2("currentValue").default(0).notNull(),
      eventType: mysqlEnum2("eventType", ["solo", "group"]).default("solo").notNull(),
      categoryId: int2("categoryId"),
      eventDate: timestamp2("eventDate").notNull(),
      venue: varchar2("venue", { length: 255 }),
      prefecture: varchar2("prefecture", { length: 32 }),
      ticketPresale: int2("ticketPresale"),
      ticketDoor: int2("ticketDoor"),
      ticketSaleStart: timestamp2("ticketSaleStart"),
      ticketUrl: text2("ticketUrl"),
      externalUrl: text2("externalUrl"),
      status: mysqlEnum2("status", ["upcoming", "active", "ended"]).default("active").notNull(),
      isPublic: boolean2("isPublic").default(true).notNull(),
      createdAt: timestamp2("createdAt").defaultNow().notNull(),
      updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull(),
      aiSummary: text2("aiSummary"),
      intentTags: json("intentTags").$type(),
      regionSummary: json("regionSummary").$type(),
      participantSummary: json("participantSummary").$type(),
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
      // Keeps JSON string or text content
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
      attendanceType: mysqlEnum3("attendanceType", ["venue", "streaming", "both"]).default("venue").notNull(),
      createdAt: timestamp3("createdAt").defaultNow().notNull(),
      updatedAt: timestamp3("updatedAt").defaultNow().onUpdateNow().notNull(),
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
      conditionType: mysqlEnum5("conditionType", [
        "first_participation",
        "goal_reached",
        "milestone_25",
        "milestone_50",
        "milestone_75",
        "contribution_5",
        "contribution_10",
        "contribution_20",
        "host_challenge",
        "special",
        "follower_badge"
      ]).notNull(),
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
import { mysqlTable as mysqlTable9, int as int9, varchar as varchar9, text as text9, timestamp as timestamp9, mysqlEnum as mysqlEnum8, json as json2 } from "drizzle-orm/mysql-core";
var auditLogs, AUDIT_ACTIONS, ENTITY_TYPES;
var init_audit = __esm({
  "drizzle/schema/audit.ts"() {
    "use strict";
    auditLogs = mysqlTable9("audit_logs", {
      id: int9("id").autoincrement().primaryKey(),
      requestId: varchar9("requestId", { length: 36 }).notNull(),
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
      entityType: varchar9("entityType", { length: 64 }).notNull(),
      targetId: int9("targetId"),
      actorId: int9("actorId"),
      actorName: varchar9("actorName", { length: 255 }),
      actorRole: varchar9("actorRole", { length: 32 }),
      beforeData: json2("beforeData").$type(),
      afterData: json2("afterData").$type(),
      reason: text9("reason"),
      ipAddress: varchar9("ipAddress", { length: 45 }),
      userAgent: text9("userAgent"),
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

// drizzle/schema/release-notes.ts
import { mysqlTable as mysqlTable10, int as int10, varchar as varchar10, text as text10, timestamp as timestamp10, json as json3 } from "drizzle-orm/mysql-core";
var releaseNotes;
var init_release_notes = __esm({
  "drizzle/schema/release-notes.ts"() {
    "use strict";
    releaseNotes = mysqlTable10("release_notes", {
      id: int10("id").autoincrement().primaryKey(),
      version: varchar10("version", { length: 32 }).notNull(),
      date: varchar10("date", { length: 32 }).notNull(),
      title: text10("title").notNull(),
      changes: json3("changes").notNull(),
      createdAt: timestamp10("createdAt").defaultNow().notNull(),
      updatedAt: timestamp10("updatedAt").defaultNow().onUpdateNow().notNull()
    });
  }
});

// drizzle/schema/api-usage.ts
import { mysqlTable as mysqlTable11, int as int11, varchar as varchar11, timestamp as timestamp11, decimal, json as json4, index } from "drizzle-orm/mysql-core";
var apiUsage, apiCostSettings;
var init_api_usage = __esm({
  "drizzle/schema/api-usage.ts"() {
    "use strict";
    apiUsage = mysqlTable11(
      "api_usage",
      {
        id: int11("id").autoincrement().primaryKey(),
        endpoint: varchar11("endpoint", { length: 255 }).notNull(),
        method: varchar11("method", { length: 10 }).default("GET").notNull(),
        success: int11("success").default(1).notNull(),
        cost: decimal("cost", { precision: 10, scale: 4 }).default("0").notNull(),
        rateLimitInfo: json4("rateLimitInfo"),
        month: varchar11("month", { length: 7 }).notNull(),
        createdAt: timestamp11("createdAt").defaultNow().notNull()
      },
      (table) => ({
        monthIdx: index("month_idx").on(table.month),
        endpointIdx: index("endpoint_idx").on(table.endpoint),
        createdAtIdx: index("created_at_idx").on(table.createdAt)
      })
    );
    apiCostSettings = mysqlTable11("api_cost_settings", {
      id: int11("id").autoincrement().primaryKey(),
      monthlyLimit: decimal("monthlyLimit", { precision: 10, scale: 2 }).default("10.00").notNull(),
      alertThreshold: decimal("alertThreshold", { precision: 10, scale: 2 }).default("8.00").notNull(),
      alertEmail: varchar11("alertEmail", { length: 320 }),
      autoStop: int11("autoStop").default(0).notNull(),
      createdAt: timestamp11("createdAt").defaultNow().notNull(),
      updatedAt: timestamp11("updatedAt").defaultNow().onUpdateNow().notNull()
    });
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
    init_release_notes();
    init_api_usage();
  }
});

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  AUDIT_ACTIONS: () => AUDIT_ACTIONS,
  ENTITY_TYPES: () => ENTITY_TYPES,
  achievementPages: () => achievementPages,
  achievements: () => achievements,
  apiCostSettings: () => apiCostSettings,
  apiUsage: () => apiUsage,
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
  releaseNotes: () => releaseNotes,
  reminders: () => reminders,
  searchHistory: () => searchHistory,
  ticketTransfers: () => ticketTransfers,
  ticketWaitlist: () => ticketWaitlist,
  twitterFollowStatus: () => twitterFollowStatus,
  twitterUserCache: () => twitterUserCache,
  userAchievements: () => userAchievements,
  userBadges: () => userBadges,
  userTwitterTokens: () => userTwitterTokens,
  users: () => users
});
var init_schema2 = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    init_schema();
  }
});

// server/db/connection.ts
import { eq, desc, and, sql, isNull, or, gte, lte, lt, inArray, asc, ne, like, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const dbUrl = new URL(process.env.DATABASE_URL);
      const poolConnection = mysql.createPool({
        host: dbUrl.hostname,
        port: Number(dbUrl.port) || 3306,
        user: decodeURIComponent(dbUrl.username),
        password: decodeURIComponent(dbUrl.password),
        database: dbUrl.pathname.slice(1),
        ssl: dbUrl.searchParams.get("ssl") === "true" ? {} : void 0,
        connectTimeout: 1e4,
        // 接続タイムアウト 10秒
        waitForConnections: true,
        connectionLimit: 5,
        // プールサイズ
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 1e4
        // 10秒ごとにKeepAlive
      });
      _db = drizzle(poolConnection, { schema: schema_exports, mode: "default" });
      try {
        const testPromise = poolConnection.query("SELECT 1");
        const timeoutPromise = new Promise(
          (_, reject) => setTimeout(() => reject(new Error("Connection test timeout")), 5e3)
        );
        await Promise.race([testPromise, timeoutPromise]);
        console.log("[Database] Connection pool initialized successfully");
      } catch (testError) {
        console.error("[Database] Connection test failed:", testError);
      }
    } catch (error46) {
      console.error("[Database] Failed to create connection pool:", error46);
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
    init_schema2();
    _db = null;
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
    const textFields = ["name", "email", "loginMethod", "prefecture"];
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
    if (user.gender !== void 0) {
      values.gender = user.gender;
      updateSet.gender = user.gender;
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
  } catch (error46) {
    console.error("[Database] Failed to upsert user:", error46);
    throw error46;
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
    twitterUsername: followStatus.length > 0 ? followStatus[0].twitterUsername : null,
    gender: user.gender
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
import { sql as sql2, eq as eq2, desc as desc2 } from "drizzle-orm";
async function getAllEvents() {
  const now = Date.now();
  if (eventsCache.data && now - eventsCache.timestamp < EVENTS_CACHE_TTL) {
    return eventsCache.data;
  }
  const db = await getDb();
  if (!db) return eventsCache.data ?? [];
  try {
    const result = await db.select({
      id: events2.id,
      hostUserId: events2.hostUserId,
      hostTwitterId: events2.hostTwitterId,
      hostName: events2.hostName,
      hostUsername: events2.hostUsername,
      hostProfileImage: events2.hostProfileImage,
      hostFollowersCount: events2.hostFollowersCount,
      hostDescription: events2.hostDescription,
      hostGender: users.gender,
      // 主催者の性別
      title: events2.title,
      slug: events2.slug,
      description: events2.description,
      goalType: events2.goalType,
      goalValue: events2.goalValue,
      goalUnit: events2.goalUnit,
      currentValue: events2.currentValue,
      eventType: events2.eventType,
      categoryId: events2.categoryId,
      eventDate: events2.eventDate,
      venue: events2.venue,
      prefecture: events2.prefecture,
      status: events2.status,
      isPublic: events2.isPublic,
      createdAt: events2.createdAt,
      updatedAt: events2.updatedAt
    }).from(events2).leftJoin(users, eq2(events2.hostUserId, users.id)).where(eq2(events2.isPublic, true)).orderBy(desc2(events2.eventDate));
    eventsCache = { data: result, timestamp: now };
    return result;
  } catch (err) {
    console.warn("[getAllEvents] JOIN query failed, falling back to challenges only:", err?.message);
    const fallback = await db.select().from(events2).where(eq2(events2.isPublic, true)).orderBy(desc2(events2.eventDate));
    eventsCache = { data: fallback, timestamp: now };
    return fallback;
  }
}
function invalidateEventsCache() {
  eventsCache = { data: null, timestamp: 0 };
}
async function getEventById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(events2).where(eq2(events2.id, id));
  return result[0] || null;
}
async function getEventsByHostUserId(hostUserId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events2).where(eq2(events2.hostUserId, hostUserId)).orderBy(desc2(events2.eventDate));
}
async function getEventsByHostTwitterId(hostTwitterId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events2).where(eq2(events2.hostTwitterId, hostTwitterId)).orderBy(desc2(events2.eventDate));
}
async function createEvent(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
  const eventDate = data.eventDate ? new Date(data.eventDate).toISOString().slice(0, 19).replace("T", " ") : now;
  const slug = data.slug || generateSlug(data.title);
  const ticketSaleStart = data.ticketSaleStart ? new Date(data.ticketSaleStart).toISOString().slice(0, 19).replace("T", " ") : null;
  const result = await db.execute(sql2`
    INSERT INTO challenges (
      "hostUserId", "hostTwitterId", "hostName", "hostUsername", "hostProfileImage", "hostFollowersCount", "hostDescription",
      title, description, "goalType", "goalValue", "goalUnit", "currentValue",
      "eventType", "categoryId", "eventDate", venue, prefecture,
      "ticketPresale", "ticketDoor", "ticketSaleStart", "ticketUrl", "externalUrl",
      status, "isPublic", "createdAt", "updatedAt"
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
    RETURNING id
  `);
  const raw = result;
  const rows = Array.isArray(raw) ? raw : raw?.rows;
  const id = rows?.[0]?.id;
  invalidateEventsCache();
  if (id == null) throw new Error("Failed to create challenge");
  return id;
}
async function updateEvent(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(events2).set(data).where(eq2(events2.id, id));
  invalidateEventsCache();
}
async function deleteEvent(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(events2).where(eq2(events2.id, id));
  invalidateEventsCache();
}
async function searchChallenges(query) {
  const db = await getDb();
  if (!db) return [];
  const normalizedQuery = query.toLowerCase().trim();
  const allChallenges = await db.select().from(challenges).where(eq2(challenges.isPublic, true)).orderBy(desc2(challenges.eventDate));
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
  const [result] = await db.insert(participations).values(data);
  const participationId = result.insertId;
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
  return result.slice(0, limit).map((p, index2) => ({
    rank: index2 + 1,
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
    const url2 = new URL(req.url || "", `http://${req.headers.host}`);
    const token = url2.searchParams.get("token");
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
        } catch (error46) {
          console.error("[WebSocket] Failed to parse message:", error46);
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
      ws.on("error", (error46) => {
        console.error("[WebSocket] Error:", error46);
      });
    } catch (error46) {
      console.error("[WebSocket] Authentication failed:", error46);
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
  const [result] = await db.insert(notifications).values(data);
  const notificationId = result.insertId ?? null;
  try {
    const { sendNotificationToUser: sendNotificationToUser2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
    sendNotificationToUser2(data.userId.toString(), {
      id: notificationId,
      ...data
    });
  } catch (error46) {
    console.error("[WebSocket] Failed to send notification:", error46);
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
  const [result] = await db.insert(badges).values(data);
  return result.insertId ?? null;
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
  const [result] = await db.insert(userBadges).values({
    userId,
    badgeId,
    challengeId
  });
  return result.insertId ?? null;
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
  const [result] = await db.insert(pickedComments).values({
    participationId,
    challengeId,
    pickedBy,
    reason
  });
  return result.insertId ?? null;
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
  const [result] = await db.insert(cheers).values(cheer);
  return result.insertId ?? null;
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
  const [result] = await db.insert(achievementPages).values(page);
  return result.insertId ?? null;
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
  const [result] = await db.insert(reminders).values(reminder);
  return result.insertId ?? null;
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
  const [result] = await db.insert(directMessages).values(dm);
  const messageId = result.insertId ?? null;
  try {
    const { sendMessageToUser: sendMessageToUser2 } = await Promise.resolve().then(() => (init_websocket(), websocket_exports));
    sendMessageToUser2(dm.toUserId.toString(), {
      id: messageId,
      ...dm
    });
  } catch (error46) {
    console.error("[WebSocket] Failed to send message:", error46);
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
  const [result] = await db.insert(challengeTemplates).values(template);
  return result.insertId ?? null;
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
  const [result] = await db.insert(searchHistory).values(history);
  return result.insertId ?? null;
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
  const [result] = await db.insert(follows).values(follow);
  await awardFollowerBadge(follow.followerId);
  return result.insertId ?? null;
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
  const [result] = await db.insert(categories).values(category);
  return result.insertId ?? null;
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
  const [result] = await db.insert(invitations).values(invitation);
  return result.insertId ?? null;
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
  const [result] = await db.insert(invitationUses).values(use);
  return result.insertId ?? null;
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
  let twitterData = null;
  if (latestParticipation?.username) {
    const twitterCache = await db.select().from(twitterUserCache).where(eq(twitterUserCache.twitterUsername, latestParticipation.username));
    if (twitterCache.length > 0) {
      twitterData = twitterCache[0];
    }
  }
  return {
    user: {
      id: user.id,
      name: user.name || latestParticipation?.displayName || "\u30E6\u30FC\u30B6\u30FC",
      username: latestParticipation?.username || null,
      profileImage: latestParticipation?.profileImage || null,
      gender: user.gender,
      createdAt: user.createdAt,
      // TwitterUserCardに必要なフィールド
      twitterId: twitterData?.twitterId || null,
      followersCount: twitterData?.followersCount || 0,
      description: twitterData?.description || null
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
  const [result] = await db.insert(participationCompanions).values(companion);
  return result.insertId ?? null;
}
async function createCompanions(companions) {
  const db = await getDb();
  if (!db) return [];
  if (companions.length === 0) return [];
  const [result] = await db.insert(participationCompanions).values(companions);
  return result.insertId;
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
    Object.entries(regionSummary).forEach(([region, count3]) => {
      if (count3 > maxCount) {
        maxCount = count3;
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
  } catch (error46) {
    console.error("[AI Summary] Failed to refresh challenge summary:", error46);
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
    } catch (error46) {
      console.error(`[AI Summary] Failed to update challenge ${c.id}:`, error46);
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
  const [result] = await db.insert(ticketTransfers).values(transfer);
  return result.insertId ?? null;
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
  const [result] = await db.insert(ticketWaitlist).values(waitlist);
  return result.insertId ?? null;
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
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);
    const raw = result;
    const rows = Array.isArray(raw) ? raw[0] : raw?.rows;
    return { tables: (Array.isArray(rows) ? rows : []) ?? [] };
  } catch (error46) {
    return { tables: [], error: String(error46) };
  }
}
async function compareSchemas() {
  const db = await getDb();
  if (!db) return { match: false, error: "Database not available" };
  try {
    const result = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    const raw = result;
    const rows = Array.isArray(raw) ? raw[0] : raw?.rows;
    const dbTables = (Array.isArray(rows) ? rows : []).map((r) => r.table_name);
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
  } catch (error46) {
    return { match: false, error: String(error46) };
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
    const [result] = await db.insert(auditLogs).values(data);
    return result.insertId ?? null;
  } catch (error46) {
    console.error("[AuditLog] Failed to create audit log:", error46);
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

// server/db/api-usage-db.ts
var api_usage_db_exports = {};
__export(api_usage_db_exports, {
  checkCostLimit: () => checkCostLimit,
  getCostSettings: () => getCostSettings,
  getCurrentMonthStats: () => getCurrentMonthStats,
  getMonthlyCost: () => getMonthlyCost,
  getMonthlyUsage: () => getMonthlyUsage,
  getUsageByEndpoint: () => getUsageByEndpoint,
  isApiCallAllowed: () => isApiCallAllowed,
  recordApiUsage: () => recordApiUsage,
  upsertCostSettings: () => upsertCostSettings
});
import { eq as eq4, sql as sql3, desc as desc4 } from "drizzle-orm";
async function recordApiUsage(usage) {
  const db = await getDb();
  if (!db) {
    console.warn("[API Usage] Database not available, skipping record");
    return null;
  }
  try {
    const now = /* @__PURE__ */ new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthlyUsage = await getMonthlyUsage(month);
    const isFreeTier = monthlyUsage < FREE_TIER_LIMIT;
    const cost = isFreeTier ? 0 : COST_PER_REQUEST;
    const insertData = {
      endpoint: usage.endpoint,
      method: usage.method || "GET",
      success: usage.success ? 1 : 0,
      cost: cost.toString(),
      rateLimitInfo: usage.rateLimitInfo ?? null,
      month
    };
    const [result] = await db.insert(apiUsage).values(insertData);
    return result.insertId ?? null;
  } catch (error46) {
    console.error("[API Usage] Failed to record usage:", error46);
    return null;
  }
}
async function getMonthlyUsage(month) {
  const db = await getDb();
  if (!db) return 0;
  try {
    const result = await db.select({ count: sql3`count(*)` }).from(apiUsage).where(eq4(apiUsage.month, month));
    return result[0]?.count || 0;
  } catch (error46) {
    console.error("[API Usage] Failed to get monthly usage:", error46);
    return 0;
  }
}
async function getMonthlyCost(month) {
  const db = await getDb();
  if (!db) return 0;
  try {
    const result = await db.select({ totalCost: sql3`sum(${apiUsage.cost})` }).from(apiUsage).where(eq4(apiUsage.month, month));
    return Number(result[0]?.totalCost || 0);
  } catch (error46) {
    console.error("[API Usage] Failed to get monthly cost:", error46);
    return 0;
  }
}
async function getCurrentMonthStats() {
  const now = /* @__PURE__ */ new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const usage = await getMonthlyUsage(month);
  const cost = await getMonthlyCost(month);
  const freeTierRemaining = Math.max(0, FREE_TIER_LIMIT - usage);
  return {
    usage,
    cost,
    freeTierRemaining
  };
}
async function getUsageByEndpoint(month, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.select({
      endpoint: apiUsage.endpoint,
      count: sql3`count(*)`,
      cost: sql3`sum(${apiUsage.cost})`
    }).from(apiUsage).where(eq4(apiUsage.month, month)).groupBy(apiUsage.endpoint).orderBy(desc4(sql3`count(*)`)).limit(limit);
    return result.map((r) => ({
      endpoint: r.endpoint,
      count: r.count,
      cost: Number(r.cost || 0)
    }));
  } catch (error46) {
    console.error("[API Usage] Failed to get usage by endpoint:", error46);
    return [];
  }
}
async function getCostSettings() {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(apiCostSettings).limit(1);
    return result[0] || null;
  } catch (error46) {
    console.error("[API Usage] Failed to get cost settings:", error46);
    return null;
  }
}
async function upsertCostSettings(settings) {
  const db = await getDb();
  if (!db) {
    console.warn("[API Usage] Database not available, skipping upsert");
    return;
  }
  try {
    const existing = await getCostSettings();
    if (existing) {
      await db.update(apiCostSettings).set({
        ...settings,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq4(apiCostSettings.id, existing.id));
    } else {
      await db.insert(apiCostSettings).values({
        monthlyLimit: settings.monthlyLimit || "10.00",
        alertThreshold: settings.alertThreshold || "8.00",
        alertEmail: settings.alertEmail || null,
        autoStop: settings.autoStop || 0
      });
    }
  } catch (error46) {
    console.error("[API Usage] Failed to upsert cost settings:", error46);
    throw error46;
  }
}
async function checkCostLimit() {
  const settings = await getCostSettings();
  const currentMonth = await getCurrentMonthStats();
  const limit = settings ? Number(settings.monthlyLimit) : 10;
  const alertThreshold = settings ? Number(settings.alertThreshold) : 8;
  const autoStop = settings ? settings.autoStop === 1 : false;
  const exceeded = currentMonth.cost >= limit;
  const shouldAlert = currentMonth.cost >= alertThreshold;
  const shouldStop = exceeded && autoStop;
  return {
    exceeded,
    currentCost: currentMonth.cost,
    limit,
    shouldAlert,
    shouldStop
  };
}
async function isApiCallAllowed() {
  const costLimit = await checkCostLimit();
  return !costLimit.shouldStop;
}
var FREE_TIER_LIMIT, COST_PER_REQUEST;
var init_api_usage_db = __esm({
  "server/db/api-usage-db.ts"() {
    "use strict";
    init_db();
    init_schema2();
    FREE_TIER_LIMIT = 100;
    COST_PER_REQUEST = 0.01;
  }
});

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
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
  } catch (error46) {
    console.warn("[Notification] Error calling notification service:", error46);
    return false;
  }
}
var TITLE_MAX_LENGTH, CONTENT_MAX_LENGTH, trimValue, isNonEmptyString2, buildEndpointUrl, validatePayload;
var init_notification = __esm({
  "server/_core/notification.ts"() {
    "use strict";
    init_env();
    TITLE_MAX_LENGTH = 1200;
    CONTENT_MAX_LENGTH = 2e4;
    trimValue = (value) => value.trim();
    isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
    buildEndpointUrl = (baseUrl) => {
      const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
      return new URL("webdevtoken.v1.WebDevService/SendNotification", normalizedBase).toString();
    };
    validatePayload = (input) => {
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
  }
});

// server/api-cost-alert.ts
var api_cost_alert_exports = {};
__export(api_cost_alert_exports, {
  checkAndSendCostAlert: () => checkAndSendCostAlert,
  resetAlertFlags: () => resetAlertFlags
});
async function sendCostAlertWebhook(payload) {
  if (!COST_ALERT_WEBHOOK_URL) return;
  try {
    const res = await fetch(COST_ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      console.warn("[Cost Alert] Webhook failed:", res.status, await res.text().catch(() => ""));
    }
  } catch (e) {
    console.warn("[Cost Alert] Webhook error:", e);
  }
}
async function checkAndSendCostAlert() {
  try {
    const costLimit = await checkCostLimit();
    const settings = await getCostSettings();
    if (!costLimit.shouldAlert) {
      return;
    }
    const alertKey = `cost_alert_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 7)}`;
    if (alertSentFlags.get(alertKey)) {
      return;
    }
    const currentMonth = await getCurrentMonthStats();
    const message = costLimit.exceeded ? `\u26A0\uFE0F X API\u30B3\u30B9\u30C8\u4E0A\u9650\u3092\u8D85\u904E\u3057\u307E\u3057\u305F

\u73FE\u5728\u306E\u30B3\u30B9\u30C8: $${costLimit.currentCost.toFixed(2)}
\u8A2D\u5B9A\u4E0A\u9650: $${costLimit.limit.toFixed(2)}
\u4ECA\u6708\u306E\u4F7F\u7528\u91CF: ${currentMonth.usage} \u4EF6
\u7121\u6599\u67A0\u6B8B\u308A: ${currentMonth.freeTierRemaining} \u4EF6

${costLimit.shouldStop ? "API\u547C\u3073\u51FA\u3057\u306F\u81EA\u52D5\u505C\u6B62\u3055\u308C\u3066\u3044\u307E\u3059\u3002" : "API\u547C\u3073\u51FA\u3057\u306F\u7D99\u7D9A\u4E2D\u3067\u3059\u3002"}

\u7BA1\u7406\u753B\u9762\u3067\u8A2D\u5B9A\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044: /admin/api-usage` : `\u26A0\uFE0F X API\u30B3\u30B9\u30C8\u4E0A\u9650\u306B\u8FD1\u3065\u3044\u3066\u3044\u307E\u3059

\u73FE\u5728\u306E\u30B3\u30B9\u30C8: $${costLimit.currentCost.toFixed(2)}
\u30A2\u30E9\u30FC\u30C8\u95BE\u5024: $${costLimit.limit.toFixed(2)}
\u4ECA\u6708\u306E\u4F7F\u7528\u91CF: ${currentMonth.usage} \u4EF6
\u7121\u6599\u67A0\u6B8B\u308A: ${currentMonth.freeTierRemaining} \u4EF6

\u7BA1\u7406\u753B\u9762\u3067\u8A2D\u5B9A\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044: /admin/api-usage`;
    const title = costLimit.exceeded ? "X API\u30B3\u30B9\u30C8\u4E0A\u9650\u8D85\u904E\u30A2\u30E9\u30FC\u30C8" : "X API\u30B3\u30B9\u30C8\u4E0A\u9650\u8B66\u544A";
    try {
      await notifyOwner({ title, content: message });
    } catch (e) {
      console.warn("[Cost Alert] notifyOwner failed:", e);
    }
    await sendCostAlertWebhook({
      title,
      content: message,
      alertEmail: settings?.alertEmail ?? null,
      exceeded: costLimit.exceeded,
      currentCost: costLimit.currentCost,
      limit: costLimit.limit
    });
    alertSentFlags.set(alertKey, true);
    console.log("[Cost Alert] Alert sent:", {
      exceeded: costLimit.exceeded,
      currentCost: costLimit.currentCost,
      limit: costLimit.limit,
      alertEmail: settings?.alertEmail ?? void 0
    });
  } catch (error46) {
    console.error("[Cost Alert] Failed to check and send alert:", error46);
  }
}
function resetAlertFlags() {
  alertSentFlags.clear();
}
var alertSentFlags, COST_ALERT_WEBHOOK_URL;
var init_api_cost_alert = __esm({
  "server/api-cost-alert.ts"() {
    "use strict";
    init_api_usage_db();
    init_notification();
    alertSentFlags = /* @__PURE__ */ new Map();
    COST_ALERT_WEBHOOK_URL = process.env.COST_ALERT_WEBHOOK_URL ?? "";
  }
});

// server/api-usage-tracker.ts
var api_usage_tracker_exports = {};
__export(api_usage_tracker_exports, {
  getApiUsageStats: () => getApiUsageStats,
  getDashboardSummary: () => getDashboardSummary,
  getEndpointStats: () => getEndpointStats,
  getRateLimitWarningLevel: () => getRateLimitWarningLevel,
  getRecentUsageHistory: () => getRecentUsageHistory,
  getWarningsSummary: () => getWarningsSummary,
  recordApiUsage: () => recordApiUsage2,
  recordRateLimitError: () => recordRateLimitError,
  resetApiUsageStats: () => resetApiUsageStats
});
async function recordApiUsage2(endpoint, rateLimitInfo, success2 = true, method = "GET") {
  const now = Date.now();
  stats.totalRequests++;
  if (success2) {
    stats.successfulRequests++;
  } else {
    stats.rateLimitedRequests++;
  }
  stats.lastUpdated = now;
  recordApiUsage({
    endpoint,
    method,
    success: success2,
    rateLimitInfo
  }).catch((error46) => {
    console.error("[API Usage] Failed to record to database:", error46);
  });
  if (rateLimitInfo) {
    const entry = {
      endpoint,
      limit: rateLimitInfo.limit,
      remaining: rateLimitInfo.remaining,
      reset: rateLimitInfo.reset,
      timestamp: now
    };
    usageHistory.push(entry);
    if (usageHistory.length > MAX_HISTORY_SIZE) {
      usageHistory = usageHistory.slice(-MAX_HISTORY_SIZE);
    }
    const usagePercent = (rateLimitInfo.limit - rateLimitInfo.remaining) / rateLimitInfo.limit * 100;
    stats.endpoints[endpoint] = {
      requests: (stats.endpoints[endpoint]?.requests || 0) + 1,
      limit: rateLimitInfo.limit,
      remaining: rateLimitInfo.remaining,
      resetAt: new Date(rateLimitInfo.reset * 1e3).toISOString(),
      usagePercent: Math.round(usagePercent * 10) / 10
    };
  }
}
async function recordRateLimitError(endpoint, method = "GET") {
  await recordApiUsage2(endpoint, null, false, method);
}
function getApiUsageStats() {
  return { ...stats };
}
function getEndpointStats(endpoint) {
  return stats.endpoints[endpoint] || null;
}
function getRecentUsageHistory(count3 = 100) {
  return usageHistory.slice(-count3);
}
function resetApiUsageStats() {
  usageHistory = [];
  stats = {
    totalRequests: 0,
    successfulRequests: 0,
    rateLimitedRequests: 0,
    endpoints: {},
    lastUpdated: Date.now()
  };
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
async function getDashboardSummary() {
  const monthlyStats = await getCurrentMonthStats();
  const costLimit = await checkCostLimit();
  const now = /* @__PURE__ */ new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const endpointCosts = await getUsageByEndpoint(month, 20);
  return {
    stats: getApiUsageStats(),
    warnings: getWarningsSummary(),
    recentHistory: getRecentUsageHistory(20),
    monthlyStats,
    costLimit,
    endpointCosts
  };
}
var usageHistory, stats, MAX_HISTORY_SIZE;
var init_api_usage_tracker = __esm({
  "server/api-usage-tracker.ts"() {
    "use strict";
    init_api_usage_db();
    usageHistory = [];
    stats = {
      totalRequests: 0,
      successfulRequests: 0,
      rateLimitedRequests: 0,
      endpoints: {},
      lastUpdated: Date.now()
    };
    MAX_HISTORY_SIZE = 1e3;
  }
});

// server/rate-limit-handler.ts
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
    } catch (error46) {
      lastError = error46 instanceof Error ? error46 : new Error(String(error46));
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
async function twitterApiFetch(url2, options = {}, retryOptions = {}) {
  try {
    const { isApiCallAllowed: isApiCallAllowed2 } = await Promise.resolve().then(() => (init_api_usage_db(), api_usage_db_exports));
    const isAllowed = await isApiCallAllowed2();
    if (!isAllowed) {
      console.warn("[RateLimit] API call blocked due to cost limit exceeded");
      throw new Error("API\u547C\u3073\u51FA\u3057\u306F\u30B3\u30B9\u30C8\u4E0A\u9650\u306B\u3088\u308A\u505C\u6B62\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u7BA1\u7406\u753B\u9762\u3067\u8A2D\u5B9A\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    }
    Promise.resolve().then(() => (init_api_cost_alert(), api_cost_alert_exports)).then((alert) => {
      alert.checkAndSendCostAlert().catch(() => {
      });
    }).catch(() => {
    });
  } catch (error46) {
    if (error46 instanceof Error && error46.message.includes("\u30B3\u30B9\u30C8\u4E0A\u9650")) {
      throw error46;
    }
    console.warn("[RateLimit] Cost limit check failed, continuing:", error46);
  }
  const result = await withExponentialBackoff(
    () => fetch(url2, options),
    retryOptions
  );
  const success2 = result.response.ok || result.response.status === 429;
  const method = options.method || "GET";
  const urlObj = new URL(url2);
  const endpoint = urlObj.pathname;
  Promise.resolve().then(() => (init_api_usage_tracker(), api_usage_tracker_exports)).then((tracker) => {
    tracker.recordApiUsage(
      endpoint,
      result.rateLimitInfo,
      success2,
      method
    ).catch((error46) => {
      console.error("[RateLimit] Failed to record API usage:", error46);
    });
  }).catch(() => {
  });
  if (!result.response.ok && result.response.status !== 429) {
    const errorText = JSON.stringify(result.data);
    throw new Error(`Twitter API error (${result.response.status}): ${errorText}`);
  }
  return {
    data: result.data,
    rateLimitInfo: result.rateLimitInfo
  };
}
var DEFAULT_OPTIONS;
var init_rate_limit_handler = __esm({
  "server/rate-limit-handler.ts"() {
    "use strict";
    DEFAULT_OPTIONS = {
      maxRetries: 5,
      initialDelayMs: 1e3,
      maxDelayMs: 6e4
    };
  }
});

// server/twitter-oauth2.ts
var twitter_oauth2_exports = {};
__export(twitter_oauth2_exports, {
  buildAuthorizationUrl: () => buildAuthorizationUrl,
  checkFollowStatus: () => checkFollowStatus,
  deletePKCEData: () => deletePKCEData,
  exchangeCodeForTokens: () => exchangeCodeForTokens,
  generatePKCE: () => generatePKCE,
  generateState: () => generateState,
  getPKCEData: () => getPKCEData,
  getTargetAccountInfo: () => getTargetAccountInfo,
  getUserProfile: () => getUserProfile,
  getUserProfileByUsername: () => getUserProfileByUsername,
  refreshAccessToken: () => refreshAccessToken,
  revokeAccessToken: () => revokeAccessToken,
  storePKCEData: () => storePKCEData
});
import crypto from "crypto";
import { eq as eq5, lt as lt3 } from "drizzle-orm";
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
async function fetchWithRetry(url2, options, config2 = {}) {
  const { maxRetries = 2, initialDelayMs = 500, timeoutMs = 15e3, label = "API" } = config2;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(url2, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (response.status === 429 && attempt < maxRetries) {
        const retryAfter = response.headers.get("retry-after");
        const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1e3 : initialDelayMs * Math.pow(2, attempt);
        console.warn(`[${label}] Rate limited (429), retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      if (response.status >= 500 && attempt < maxRetries) {
        const waitMs = initialDelayMs * Math.pow(2, attempt);
        console.warn(`[${label}] Server error (${response.status}), retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      return response;
    } catch (error46) {
      const isAbort = error46 instanceof Error && error46.name === "AbortError";
      const isNetwork = error46 instanceof TypeError && error46.message.includes("fetch");
      if ((isAbort || isNetwork) && attempt < maxRetries) {
        const waitMs = initialDelayMs * Math.pow(2, attempt);
        console.warn(`[${label}] ${isAbort ? "Timeout" : "Network error"}, retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      if (isAbort) {
        throw new Error(`[${label}] Request timed out after ${timeoutMs}ms`);
      }
      throw error46;
    }
  }
  throw new Error(`[${label}] All retry attempts exhausted`);
}
async function exchangeCodeForTokens(code, callbackUrl, codeVerifier) {
  const url2 = "https://api.twitter.com/2/oauth2/token";
  const params = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    client_id: TWITTER_CLIENT_ID,
    redirect_uri: callbackUrl,
    code_verifier: codeVerifier
  });
  const credentials = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString("base64");
  const response = await fetchWithRetry(url2, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`
    },
    body: params.toString()
  }, { maxRetries: 2, timeoutMs: 15e3, label: "TokenExchange" });
  if (!response.ok) {
    const text11 = await response.text();
    console.error("[TokenExchange] Error:", response.status);
    if (response.status === 400) {
      throw new Error("\u8A8D\u8A3C\u30B3\u30FC\u30C9\u304C\u7121\u52B9\u307E\u305F\u306F\u671F\u9650\u5207\u308C\u3067\u3059\u3002\u3082\u3046\u4E00\u5EA6\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    }
    if (response.status === 401) {
      throw new Error("Twitter API\u8A8D\u8A3C\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u30B5\u30FC\u30D0\u30FC\u8A2D\u5B9A\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    }
    throw new Error(`Twitter\u8A8D\u8A3C\u30C8\u30FC\u30AF\u30F3\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F (${response.status})`);
  }
  return response.json();
}
async function getUserProfile(accessToken) {
  const url2 = "https://api.twitter.com/2/users/me";
  const params = "user.fields=profile_image_url,public_metrics,description";
  const fullUrl = `${url2}?${params}`;
  const response = await fetchWithRetry(fullUrl, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  }, { maxRetries: 2, timeoutMs: 1e4, label: "UserProfile" });
  if (!response.ok) {
    await response.text();
    console.error("[UserProfile] Error:", response.status);
    if (response.status === 401) {
      throw new Error("\u30A2\u30AF\u30BB\u30B9\u30C8\u30FC\u30AF\u30F3\u304C\u7121\u52B9\u3067\u3059\u3002\u3082\u3046\u4E00\u5EA6\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    }
    if (response.status === 429) {
      throw new Error("Twitter API\u306E\u30EC\u30FC\u30C8\u5236\u9650\u306B\u9054\u3057\u307E\u3057\u305F\u3002\u3057\u3070\u3089\u304F\u5F85\u3063\u3066\u304B\u3089\u518D\u8A66\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    }
    throw new Error(`\u30E6\u30FC\u30B6\u30FC\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F (${response.status})`);
  }
  const json6 = await response.json();
  if (!json6.data) {
    throw new Error("\u30E6\u30FC\u30B6\u30FC\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u30C7\u30FC\u30BF\u304C\u7A7A\u3067\u3059\u3002Twitter\u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u72B6\u614B\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
  }
  return json6.data;
}
async function refreshAccessToken(refreshToken) {
  const url2 = "https://api.twitter.com/2/oauth2/token";
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    client_id: TWITTER_CLIENT_ID
  });
  const credentials = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString("base64");
  const response = await fetchWithRetry(url2, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`
    },
    body: params.toString()
  }, { maxRetries: 1, timeoutMs: 1e4, label: "TokenRefresh" });
  if (!response.ok) {
    await response.text();
    console.error("[TokenRefresh] Error:", response.status);
    if (response.status === 400 || response.status === 401) {
      throw new Error(`INVALID_REFRESH_TOKEN: \u30EA\u30D5\u30EC\u30C3\u30B7\u30E5\u30C8\u30FC\u30AF\u30F3\u304C\u7121\u52B9\u3067\u3059\u3002\u518D\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044\u3002`);
    }
    throw new Error(`\u30C8\u30FC\u30AF\u30F3\u306E\u66F4\u65B0\u306B\u5931\u6557\u3057\u307E\u3057\u305F (${response.status})`);
  }
  return response.json();
}
async function storePKCEData(state, codeVerifier, callbackUrl) {
  pkceMemoryStore.set(state, { codeVerifier, callbackUrl });
  setTimeout(() => pkceMemoryStore.delete(state), 30 * 60 * 1e3);
  console.log("[PKCE] Stored PKCE data in memory for state:", state.substring(0, 8) + "...");
  setImmediate(async () => {
    try {
      const db = await getDb();
      if (!db) {
        console.log("[PKCE] Database not available, memory-only mode");
        return;
      }
      const expiresAt = new Date(Date.now() + 30 * 60 * 1e3);
      await db.delete(oauthPkceData).where(lt3(oauthPkceData.expiresAt, /* @__PURE__ */ new Date())).catch(() => {
      });
      await db.insert(oauthPkceData).values({
        state,
        codeVerifier,
        callbackUrl,
        expiresAt
      });
      console.log("[PKCE] Also stored PKCE data in database for state:", state.substring(0, 8) + "...");
    } catch (error46) {
      console.log("[PKCE] Database storage failed (memory fallback active):", error46 instanceof Error ? error46.message : error46);
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
    const result = await db.select().from(oauthPkceData).where(eq5(oauthPkceData.state, state)).limit(1);
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
  } catch (error46) {
    console.error("[PKCE] Failed to get from database:", error46);
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
    await db.delete(oauthPkceData).where(eq5(oauthPkceData.state, state));
    console.log("[PKCE] Deleted PKCE data for state:", state.substring(0, 8) + "...");
  } catch (error46) {
    console.error("[PKCE] Failed to delete from database:", error46);
  }
}
function getFollowStatusCacheKey(sourceUserId, targetUsername) {
  return `${sourceUserId}:${targetUsername}`;
}
async function checkFollowStatus(accessToken, sourceUserId, targetUsername = TARGET_TWITTER_USERNAME) {
  const cacheKey = getFollowStatusCacheKey(sourceUserId, targetUsername);
  const cached2 = followStatusCache.get(cacheKey);
  const now = Date.now();
  if (cached2 && now - cached2.lastCheckedAt < FOLLOW_STATUS_CACHE_TTL_MS) {
    console.log("[Twitter API] Follow status cache hit for", sourceUserId);
    return {
      isFollowing: cached2.isFollowing,
      targetUser: cached2.targetUser
    };
  }
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
    const targetUserInfo = {
      id: targetUser.id,
      name: targetUser.name,
      username: targetUser.username
    };
    followStatusCache.set(cacheKey, {
      isFollowing: isFollowing2,
      targetUser: targetUserInfo,
      lastCheckedAt: now
    });
    return {
      isFollowing: isFollowing2,
      targetUser: targetUserInfo
    };
  } catch (error46) {
    const errorMessage = error46 instanceof Error ? error46.message : String(error46);
    if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
      console.log("[Twitter API] Rate limit error, skipping follow check");
      return { isFollowing: false, targetUser: null, skipped: true };
    }
    console.error("Follow status check error:", error46);
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
    const url2 = `https://api.twitter.com/2/users/by/username/${cleanUsername}`;
    const params = "user.fields=profile_image_url,public_metrics,description";
    const fullUrl = `${url2}?${params}`;
    const { data, rateLimitInfo } = await twitterApiFetch(
      fullUrl,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${bearerToken}`
        }
      }
    );
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
  } catch (error46) {
    console.error("Error fetching Twitter user profile:", error46);
    return null;
  }
}
async function revokeAccessToken(accessToken) {
  if (!accessToken) return false;
  const url2 = "https://api.twitter.com/2/oauth2/revoke";
  const credentials = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString("base64");
  try {
    const params = new URLSearchParams({
      token: accessToken,
      token_type_hint: "access_token"
    });
    const response = await fetch(url2, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${credentials}`
      },
      body: params.toString()
    });
    if (response.ok) {
      console.log("[Twitter OAuth 2.0] Access token revoked successfully");
      return true;
    }
    console.warn(`[Twitter OAuth 2.0] Token revoke returned ${response.status}`);
    return false;
  } catch (error46) {
    console.warn("[Twitter OAuth 2.0] Token revoke failed:", error46 instanceof Error ? error46.message : String(error46));
    return false;
  }
}
var TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, pkceMemoryStore, TARGET_TWITTER_USERNAME, FOLLOW_STATUS_CACHE_TTL_HOURS, FOLLOW_STATUS_CACHE_TTL_MS, followStatusCache;
var init_twitter_oauth2 = __esm({
  "server/twitter-oauth2.ts"() {
    "use strict";
    init_db2();
    init_schema2();
    init_rate_limit_handler();
    TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || "";
    TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || "";
    pkceMemoryStore = /* @__PURE__ */ new Map();
    TARGET_TWITTER_USERNAME = "idolfunch";
    FOLLOW_STATUS_CACHE_TTL_HOURS = parseInt(
      process.env.FOLLOW_STATUS_CACHE_TTL_HOURS || "24",
      10
    );
    FOLLOW_STATUS_CACHE_TTL_MS = FOLLOW_STATUS_CACHE_TTL_HOURS * 60 * 60 * 1e3;
    followStatusCache = /* @__PURE__ */ new Map();
  }
});

// node_modules/superjson/dist/double-indexed-kv.js
var require_double_indexed_kv = __commonJS({
  "node_modules/superjson/dist/double-indexed-kv.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.DoubleIndexedKV = void 0;
    var DoubleIndexedKV = (
      /** @class */
      (function() {
        function DoubleIndexedKV2() {
          this.keyToValue = /* @__PURE__ */ new Map();
          this.valueToKey = /* @__PURE__ */ new Map();
        }
        DoubleIndexedKV2.prototype.set = function(key, value) {
          this.keyToValue.set(key, value);
          this.valueToKey.set(value, key);
        };
        DoubleIndexedKV2.prototype.getByKey = function(key) {
          return this.keyToValue.get(key);
        };
        DoubleIndexedKV2.prototype.getByValue = function(value) {
          return this.valueToKey.get(value);
        };
        DoubleIndexedKV2.prototype.clear = function() {
          this.keyToValue.clear();
          this.valueToKey.clear();
        };
        return DoubleIndexedKV2;
      })()
    );
    exports.DoubleIndexedKV = DoubleIndexedKV;
  }
});

// node_modules/superjson/dist/registry.js
var require_registry = __commonJS({
  "node_modules/superjson/dist/registry.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.Registry = void 0;
    var double_indexed_kv_1 = require_double_indexed_kv();
    var Registry = (
      /** @class */
      (function() {
        function Registry2(generateIdentifier) {
          this.generateIdentifier = generateIdentifier;
          this.kv = new double_indexed_kv_1.DoubleIndexedKV();
        }
        Registry2.prototype.register = function(value, identifier) {
          if (this.kv.getByValue(value)) {
            return;
          }
          if (!identifier) {
            identifier = this.generateIdentifier(value);
          }
          this.kv.set(identifier, value);
        };
        Registry2.prototype.clear = function() {
          this.kv.clear();
        };
        Registry2.prototype.getIdentifier = function(value) {
          return this.kv.getByValue(value);
        };
        Registry2.prototype.getValue = function(identifier) {
          return this.kv.getByKey(identifier);
        };
        return Registry2;
      })()
    );
    exports.Registry = Registry;
  }
});

// node_modules/superjson/dist/class-registry.js
var require_class_registry = __commonJS({
  "node_modules/superjson/dist/class-registry.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    })();
    exports.__esModule = true;
    exports.ClassRegistry = void 0;
    var registry_1 = require_registry();
    var ClassRegistry = (
      /** @class */
      (function(_super) {
        __extends(ClassRegistry2, _super);
        function ClassRegistry2() {
          var _this = _super.call(this, function(c) {
            return c.name;
          }) || this;
          _this.classToAllowedProps = /* @__PURE__ */ new Map();
          return _this;
        }
        ClassRegistry2.prototype.register = function(value, options) {
          if (typeof options === "object") {
            if (options.allowProps) {
              this.classToAllowedProps.set(value, options.allowProps);
            }
            _super.prototype.register.call(this, value, options.identifier);
          } else {
            _super.prototype.register.call(this, value, options);
          }
        };
        ClassRegistry2.prototype.getAllowedProps = function(value) {
          return this.classToAllowedProps.get(value);
        };
        return ClassRegistry2;
      })(registry_1.Registry)
    );
    exports.ClassRegistry = ClassRegistry;
  }
});

// node_modules/superjson/dist/util.js
var require_util = __commonJS({
  "node_modules/superjson/dist/util.js"(exports) {
    "use strict";
    var __read = exports && exports.__read || function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error46) {
        e = { error: error46 };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    exports.__esModule = true;
    exports.findArr = exports.includes = exports.forEach = exports.find = void 0;
    function valuesOfObj(record2) {
      if ("values" in Object) {
        return Object.values(record2);
      }
      var values = [];
      for (var key in record2) {
        if (record2.hasOwnProperty(key)) {
          values.push(record2[key]);
        }
      }
      return values;
    }
    function find(record2, predicate) {
      var values = valuesOfObj(record2);
      if ("find" in values) {
        return values.find(predicate);
      }
      var valuesNotNever = values;
      for (var i = 0; i < valuesNotNever.length; i++) {
        var value = valuesNotNever[i];
        if (predicate(value)) {
          return value;
        }
      }
      return void 0;
    }
    exports.find = find;
    function forEach(record2, run) {
      Object.entries(record2).forEach(function(_a2) {
        var _b = __read(_a2, 2), key = _b[0], value = _b[1];
        return run(value, key);
      });
    }
    exports.forEach = forEach;
    function includes(arr, value) {
      return arr.indexOf(value) !== -1;
    }
    exports.includes = includes;
    function findArr(record2, predicate) {
      for (var i = 0; i < record2.length; i++) {
        var value = record2[i];
        if (predicate(value)) {
          return value;
        }
      }
      return void 0;
    }
    exports.findArr = findArr;
  }
});

// node_modules/superjson/dist/custom-transformer-registry.js
var require_custom_transformer_registry = __commonJS({
  "node_modules/superjson/dist/custom-transformer-registry.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.CustomTransformerRegistry = void 0;
    var util_1 = require_util();
    var CustomTransformerRegistry = (
      /** @class */
      (function() {
        function CustomTransformerRegistry2() {
          this.transfomers = {};
        }
        CustomTransformerRegistry2.prototype.register = function(transformer) {
          this.transfomers[transformer.name] = transformer;
        };
        CustomTransformerRegistry2.prototype.findApplicable = function(v) {
          return util_1.find(this.transfomers, function(transformer) {
            return transformer.isApplicable(v);
          });
        };
        CustomTransformerRegistry2.prototype.findByName = function(name) {
          return this.transfomers[name];
        };
        return CustomTransformerRegistry2;
      })()
    );
    exports.CustomTransformerRegistry = CustomTransformerRegistry;
  }
});

// node_modules/superjson/dist/is.js
var require_is = __commonJS({
  "node_modules/superjson/dist/is.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.isURL = exports.isTypedArray = exports.isInfinite = exports.isBigint = exports.isPrimitive = exports.isNaNValue = exports.isError = exports.isDate = exports.isSymbol = exports.isSet = exports.isMap = exports.isRegExp = exports.isBoolean = exports.isNumber = exports.isString = exports.isArray = exports.isEmptyObject = exports.isPlainObject = exports.isNull = exports.isUndefined = void 0;
    var getType = function(payload) {
      return Object.prototype.toString.call(payload).slice(8, -1);
    };
    var isUndefined = function(payload) {
      return typeof payload === "undefined";
    };
    exports.isUndefined = isUndefined;
    var isNull2 = function(payload) {
      return payload === null;
    };
    exports.isNull = isNull2;
    var isPlainObject2 = function(payload) {
      if (typeof payload !== "object" || payload === null)
        return false;
      if (payload === Object.prototype)
        return false;
      if (Object.getPrototypeOf(payload) === null)
        return true;
      return Object.getPrototypeOf(payload) === Object.prototype;
    };
    exports.isPlainObject = isPlainObject2;
    var isEmptyObject = function(payload) {
      return exports.isPlainObject(payload) && Object.keys(payload).length === 0;
    };
    exports.isEmptyObject = isEmptyObject;
    var isArray = function(payload) {
      return Array.isArray(payload);
    };
    exports.isArray = isArray;
    var isString = function(payload) {
      return typeof payload === "string";
    };
    exports.isString = isString;
    var isNumber = function(payload) {
      return typeof payload === "number" && !isNaN(payload);
    };
    exports.isNumber = isNumber;
    var isBoolean = function(payload) {
      return typeof payload === "boolean";
    };
    exports.isBoolean = isBoolean;
    var isRegExp = function(payload) {
      return payload instanceof RegExp;
    };
    exports.isRegExp = isRegExp;
    var isMap = function(payload) {
      return payload instanceof Map;
    };
    exports.isMap = isMap;
    var isSet = function(payload) {
      return payload instanceof Set;
    };
    exports.isSet = isSet;
    var isSymbol = function(payload) {
      return getType(payload) === "Symbol";
    };
    exports.isSymbol = isSymbol;
    var isDate = function(payload) {
      return payload instanceof Date && !isNaN(payload.valueOf());
    };
    exports.isDate = isDate;
    var isError = function(payload) {
      return payload instanceof Error;
    };
    exports.isError = isError;
    var isNaNValue = function(payload) {
      return typeof payload === "number" && isNaN(payload);
    };
    exports.isNaNValue = isNaNValue;
    var isPrimitive = function(payload) {
      return exports.isBoolean(payload) || exports.isNull(payload) || exports.isUndefined(payload) || exports.isNumber(payload) || exports.isString(payload) || exports.isSymbol(payload);
    };
    exports.isPrimitive = isPrimitive;
    var isBigint = function(payload) {
      return typeof payload === "bigint";
    };
    exports.isBigint = isBigint;
    var isInfinite = function(payload) {
      return payload === Infinity || payload === -Infinity;
    };
    exports.isInfinite = isInfinite;
    var isTypedArray = function(payload) {
      return ArrayBuffer.isView(payload) && !(payload instanceof DataView);
    };
    exports.isTypedArray = isTypedArray;
    var isURL = function(payload) {
      return payload instanceof URL;
    };
    exports.isURL = isURL;
  }
});

// node_modules/superjson/dist/pathstringifier.js
var require_pathstringifier = __commonJS({
  "node_modules/superjson/dist/pathstringifier.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.parsePath = exports.stringifyPath = exports.escapeKey = void 0;
    var escapeKey = function(key) {
      return key.replace(/\./g, "\\.");
    };
    exports.escapeKey = escapeKey;
    var stringifyPath = function(path3) {
      return path3.map(String).map(exports.escapeKey).join(".");
    };
    exports.stringifyPath = stringifyPath;
    var parsePath = function(string4) {
      var result = [];
      var segment = "";
      for (var i = 0; i < string4.length; i++) {
        var char = string4.charAt(i);
        var isEscapedDot = char === "\\" && string4.charAt(i + 1) === ".";
        if (isEscapedDot) {
          segment += ".";
          i++;
          continue;
        }
        var isEndOfSegment = char === ".";
        if (isEndOfSegment) {
          result.push(segment);
          segment = "";
          continue;
        }
        segment += char;
      }
      var lastSegment = segment;
      result.push(lastSegment);
      return result;
    };
    exports.parsePath = parsePath;
  }
});

// node_modules/superjson/dist/transformer.js
var require_transformer = __commonJS({
  "node_modules/superjson/dist/transformer.js"(exports) {
    "use strict";
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t2) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t2[p] = s[p];
        }
        return t2;
      };
      return __assign.apply(this, arguments);
    };
    var __read = exports && exports.__read || function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error46) {
        e = { error: error46 };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    var __spreadArray = exports && exports.__spreadArray || function(to, from) {
      for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
      return to;
    };
    exports.__esModule = true;
    exports.untransformValue = exports.transformValue = exports.isInstanceOfRegisteredClass = void 0;
    var is_1 = require_is();
    var util_1 = require_util();
    function simpleTransformation(isApplicable, annotation, transform2, untransform) {
      return {
        isApplicable,
        annotation,
        transform: transform2,
        untransform
      };
    }
    var simpleRules = [
      simpleTransformation(is_1.isUndefined, "undefined", function() {
        return null;
      }, function() {
        return void 0;
      }),
      simpleTransformation(is_1.isBigint, "bigint", function(v) {
        return v.toString();
      }, function(v) {
        if (typeof BigInt !== "undefined") {
          return BigInt(v);
        }
        console.error("Please add a BigInt polyfill.");
        return v;
      }),
      simpleTransformation(is_1.isDate, "Date", function(v) {
        return v.toISOString();
      }, function(v) {
        return new Date(v);
      }),
      simpleTransformation(is_1.isError, "Error", function(v, superJson) {
        var baseError = {
          name: v.name,
          message: v.message
        };
        superJson.allowedErrorProps.forEach(function(prop) {
          baseError[prop] = v[prop];
        });
        return baseError;
      }, function(v, superJson) {
        var e = new Error(v.message);
        e.name = v.name;
        e.stack = v.stack;
        superJson.allowedErrorProps.forEach(function(prop) {
          e[prop] = v[prop];
        });
        return e;
      }),
      simpleTransformation(is_1.isRegExp, "regexp", function(v) {
        return "" + v;
      }, function(regex) {
        var body = regex.slice(1, regex.lastIndexOf("/"));
        var flags = regex.slice(regex.lastIndexOf("/") + 1);
        return new RegExp(body, flags);
      }),
      simpleTransformation(
        is_1.isSet,
        "set",
        // (sets only exist in es6+)
        // eslint-disable-next-line es5/no-es6-methods
        function(v) {
          return __spreadArray([], __read(v.values()));
        },
        function(v) {
          return new Set(v);
        }
      ),
      simpleTransformation(is_1.isMap, "map", function(v) {
        return __spreadArray([], __read(v.entries()));
      }, function(v) {
        return new Map(v);
      }),
      simpleTransformation(function(v) {
        return is_1.isNaNValue(v) || is_1.isInfinite(v);
      }, "number", function(v) {
        if (is_1.isNaNValue(v)) {
          return "NaN";
        }
        if (v > 0) {
          return "Infinity";
        } else {
          return "-Infinity";
        }
      }, Number),
      simpleTransformation(function(v) {
        return v === 0 && 1 / v === -Infinity;
      }, "number", function() {
        return "-0";
      }, Number),
      simpleTransformation(is_1.isURL, "URL", function(v) {
        return v.toString();
      }, function(v) {
        return new URL(v);
      })
    ];
    function compositeTransformation(isApplicable, annotation, transform2, untransform) {
      return {
        isApplicable,
        annotation,
        transform: transform2,
        untransform
      };
    }
    var symbolRule = compositeTransformation(function(s, superJson) {
      if (is_1.isSymbol(s)) {
        var isRegistered = !!superJson.symbolRegistry.getIdentifier(s);
        return isRegistered;
      }
      return false;
    }, function(s, superJson) {
      var identifier = superJson.symbolRegistry.getIdentifier(s);
      return ["symbol", identifier];
    }, function(v) {
      return v.description;
    }, function(_, a, superJson) {
      var value = superJson.symbolRegistry.getValue(a[1]);
      if (!value) {
        throw new Error("Trying to deserialize unknown symbol");
      }
      return value;
    });
    var constructorToName = [
      Int8Array,
      Uint8Array,
      Int16Array,
      Uint16Array,
      Int32Array,
      Uint32Array,
      Float32Array,
      Float64Array,
      Uint8ClampedArray
    ].reduce(function(obj, ctor) {
      obj[ctor.name] = ctor;
      return obj;
    }, {});
    var typedArrayRule = compositeTransformation(is_1.isTypedArray, function(v) {
      return ["typed-array", v.constructor.name];
    }, function(v) {
      return __spreadArray([], __read(v));
    }, function(v, a) {
      var ctor = constructorToName[a[1]];
      if (!ctor) {
        throw new Error("Trying to deserialize unknown typed array");
      }
      return new ctor(v);
    });
    function isInstanceOfRegisteredClass(potentialClass, superJson) {
      if (potentialClass === null || potentialClass === void 0 ? void 0 : potentialClass.constructor) {
        var isRegistered = !!superJson.classRegistry.getIdentifier(potentialClass.constructor);
        return isRegistered;
      }
      return false;
    }
    exports.isInstanceOfRegisteredClass = isInstanceOfRegisteredClass;
    var classRule = compositeTransformation(isInstanceOfRegisteredClass, function(clazz, superJson) {
      var identifier = superJson.classRegistry.getIdentifier(clazz.constructor);
      return ["class", identifier];
    }, function(clazz, superJson) {
      var allowedProps = superJson.classRegistry.getAllowedProps(clazz.constructor);
      if (!allowedProps) {
        return __assign({}, clazz);
      }
      var result = {};
      allowedProps.forEach(function(prop) {
        result[prop] = clazz[prop];
      });
      return result;
    }, function(v, a, superJson) {
      var clazz = superJson.classRegistry.getValue(a[1]);
      if (!clazz) {
        throw new Error("Trying to deserialize unknown class - check https://github.com/blitz-js/superjson/issues/116#issuecomment-773996564");
      }
      return Object.assign(Object.create(clazz.prototype), v);
    });
    var customRule = compositeTransformation(function(value, superJson) {
      return !!superJson.customTransformerRegistry.findApplicable(value);
    }, function(value, superJson) {
      var transformer = superJson.customTransformerRegistry.findApplicable(value);
      return ["custom", transformer.name];
    }, function(value, superJson) {
      var transformer = superJson.customTransformerRegistry.findApplicable(value);
      return transformer.serialize(value);
    }, function(v, a, superJson) {
      var transformer = superJson.customTransformerRegistry.findByName(a[1]);
      if (!transformer) {
        throw new Error("Trying to deserialize unknown custom value");
      }
      return transformer.deserialize(v);
    });
    var compositeRules = [classRule, symbolRule, customRule, typedArrayRule];
    var transformValue = function(value, superJson) {
      var applicableCompositeRule = util_1.findArr(compositeRules, function(rule) {
        return rule.isApplicable(value, superJson);
      });
      if (applicableCompositeRule) {
        return {
          value: applicableCompositeRule.transform(value, superJson),
          type: applicableCompositeRule.annotation(value, superJson)
        };
      }
      var applicableSimpleRule = util_1.findArr(simpleRules, function(rule) {
        return rule.isApplicable(value, superJson);
      });
      if (applicableSimpleRule) {
        return {
          value: applicableSimpleRule.transform(value, superJson),
          type: applicableSimpleRule.annotation
        };
      }
      return void 0;
    };
    exports.transformValue = transformValue;
    var simpleRulesByAnnotation = {};
    simpleRules.forEach(function(rule) {
      simpleRulesByAnnotation[rule.annotation] = rule;
    });
    var untransformValue = function(json6, type, superJson) {
      if (is_1.isArray(type)) {
        switch (type[0]) {
          case "symbol":
            return symbolRule.untransform(json6, type, superJson);
          case "class":
            return classRule.untransform(json6, type, superJson);
          case "custom":
            return customRule.untransform(json6, type, superJson);
          case "typed-array":
            return typedArrayRule.untransform(json6, type, superJson);
          default:
            throw new Error("Unknown transformation: " + type);
        }
      } else {
        var transformation = simpleRulesByAnnotation[type];
        if (!transformation) {
          throw new Error("Unknown transformation: " + type);
        }
        return transformation.untransform(json6, superJson);
      }
    };
    exports.untransformValue = untransformValue;
  }
});

// node_modules/superjson/dist/accessDeep.js
var require_accessDeep = __commonJS({
  "node_modules/superjson/dist/accessDeep.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.setDeep = exports.getDeep = void 0;
    var is_1 = require_is();
    var util_1 = require_util();
    var getNthKey = function(value, n) {
      var keys = value.keys();
      while (n > 0) {
        keys.next();
        n--;
      }
      return keys.next().value;
    };
    function validatePath(path3) {
      if (util_1.includes(path3, "__proto__")) {
        throw new Error("__proto__ is not allowed as a property");
      }
      if (util_1.includes(path3, "prototype")) {
        throw new Error("prototype is not allowed as a property");
      }
      if (util_1.includes(path3, "constructor")) {
        throw new Error("constructor is not allowed as a property");
      }
    }
    var getDeep = function(object2, path3) {
      validatePath(path3);
      for (var i = 0; i < path3.length; i++) {
        var key = path3[i];
        if (is_1.isSet(object2)) {
          object2 = getNthKey(object2, +key);
        } else if (is_1.isMap(object2)) {
          var row = +key;
          var type = +path3[++i] === 0 ? "key" : "value";
          var keyOfRow = getNthKey(object2, row);
          switch (type) {
            case "key":
              object2 = keyOfRow;
              break;
            case "value":
              object2 = object2.get(keyOfRow);
              break;
          }
        } else {
          object2 = object2[key];
        }
      }
      return object2;
    };
    exports.getDeep = getDeep;
    var setDeep = function(object2, path3, mapper) {
      validatePath(path3);
      if (path3.length === 0) {
        return mapper(object2);
      }
      var parent = object2;
      for (var i = 0; i < path3.length - 1; i++) {
        var key = path3[i];
        if (is_1.isArray(parent)) {
          var index2 = +key;
          parent = parent[index2];
        } else if (is_1.isPlainObject(parent)) {
          parent = parent[key];
        } else if (is_1.isSet(parent)) {
          var row = +key;
          parent = getNthKey(parent, row);
        } else if (is_1.isMap(parent)) {
          var isEnd = i === path3.length - 2;
          if (isEnd) {
            break;
          }
          var row = +key;
          var type = +path3[++i] === 0 ? "key" : "value";
          var keyOfRow = getNthKey(parent, row);
          switch (type) {
            case "key":
              parent = keyOfRow;
              break;
            case "value":
              parent = parent.get(keyOfRow);
              break;
          }
        }
      }
      var lastKey = path3[path3.length - 1];
      if (is_1.isArray(parent)) {
        parent[+lastKey] = mapper(parent[+lastKey]);
      } else if (is_1.isPlainObject(parent)) {
        parent[lastKey] = mapper(parent[lastKey]);
      }
      if (is_1.isSet(parent)) {
        var oldValue = getNthKey(parent, +lastKey);
        var newValue = mapper(oldValue);
        if (oldValue !== newValue) {
          parent["delete"](oldValue);
          parent.add(newValue);
        }
      }
      if (is_1.isMap(parent)) {
        var row = +path3[path3.length - 2];
        var keyToRow = getNthKey(parent, row);
        var type = +lastKey === 0 ? "key" : "value";
        switch (type) {
          case "key": {
            var newKey = mapper(keyToRow);
            parent.set(newKey, parent.get(keyToRow));
            if (newKey !== keyToRow) {
              parent["delete"](keyToRow);
            }
            break;
          }
          case "value": {
            parent.set(keyToRow, mapper(parent.get(keyToRow)));
            break;
          }
        }
      }
      return object2;
    };
    exports.setDeep = setDeep;
  }
});

// node_modules/superjson/dist/plainer.js
var require_plainer = __commonJS({
  "node_modules/superjson/dist/plainer.js"(exports) {
    "use strict";
    var __read = exports && exports.__read || function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error46) {
        e = { error: error46 };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    var __spreadArray = exports && exports.__spreadArray || function(to, from) {
      for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
      return to;
    };
    exports.__esModule = true;
    exports.walker = exports.generateReferentialEqualityAnnotations = exports.applyReferentialEqualityAnnotations = exports.applyValueAnnotations = void 0;
    var is_1 = require_is();
    var pathstringifier_1 = require_pathstringifier();
    var transformer_1 = require_transformer();
    var util_1 = require_util();
    var pathstringifier_2 = require_pathstringifier();
    var accessDeep_1 = require_accessDeep();
    function traverse(tree, walker2, origin) {
      if (origin === void 0) {
        origin = [];
      }
      if (!tree) {
        return;
      }
      if (!is_1.isArray(tree)) {
        util_1.forEach(tree, function(subtree, key) {
          return traverse(subtree, walker2, __spreadArray(__spreadArray([], __read(origin)), __read(pathstringifier_2.parsePath(key))));
        });
        return;
      }
      var _a2 = __read(tree, 2), nodeValue = _a2[0], children = _a2[1];
      if (children) {
        util_1.forEach(children, function(child, key) {
          traverse(child, walker2, __spreadArray(__spreadArray([], __read(origin)), __read(pathstringifier_2.parsePath(key))));
        });
      }
      walker2(nodeValue, origin);
    }
    function applyValueAnnotations(plain, annotations, superJson) {
      traverse(annotations, function(type, path3) {
        plain = accessDeep_1.setDeep(plain, path3, function(v) {
          return transformer_1.untransformValue(v, type, superJson);
        });
      });
      return plain;
    }
    exports.applyValueAnnotations = applyValueAnnotations;
    function applyReferentialEqualityAnnotations(plain, annotations) {
      function apply(identicalPaths, path3) {
        var object2 = accessDeep_1.getDeep(plain, pathstringifier_2.parsePath(path3));
        identicalPaths.map(pathstringifier_2.parsePath).forEach(function(identicalObjectPath) {
          plain = accessDeep_1.setDeep(plain, identicalObjectPath, function() {
            return object2;
          });
        });
      }
      if (is_1.isArray(annotations)) {
        var _a2 = __read(annotations, 2), root = _a2[0], other = _a2[1];
        root.forEach(function(identicalPath) {
          plain = accessDeep_1.setDeep(plain, pathstringifier_2.parsePath(identicalPath), function() {
            return plain;
          });
        });
        if (other) {
          util_1.forEach(other, apply);
        }
      } else {
        util_1.forEach(annotations, apply);
      }
      return plain;
    }
    exports.applyReferentialEqualityAnnotations = applyReferentialEqualityAnnotations;
    var isDeep = function(object2, superJson) {
      return is_1.isPlainObject(object2) || is_1.isArray(object2) || is_1.isMap(object2) || is_1.isSet(object2) || transformer_1.isInstanceOfRegisteredClass(object2, superJson);
    };
    function addIdentity(object2, path3, identities) {
      var existingSet = identities.get(object2);
      if (existingSet) {
        existingSet.push(path3);
      } else {
        identities.set(object2, [path3]);
      }
    }
    function generateReferentialEqualityAnnotations(identitites, dedupe) {
      var result = {};
      var rootEqualityPaths = void 0;
      identitites.forEach(function(paths) {
        if (paths.length <= 1) {
          return;
        }
        if (!dedupe) {
          paths = paths.map(function(path3) {
            return path3.map(String);
          }).sort(function(a, b) {
            return a.length - b.length;
          });
        }
        var _a2 = __read(paths), representativePath = _a2[0], identicalPaths = _a2.slice(1);
        if (representativePath.length === 0) {
          rootEqualityPaths = identicalPaths.map(pathstringifier_1.stringifyPath);
        } else {
          result[pathstringifier_1.stringifyPath(representativePath)] = identicalPaths.map(pathstringifier_1.stringifyPath);
        }
      });
      if (rootEqualityPaths) {
        if (is_1.isEmptyObject(result)) {
          return [rootEqualityPaths];
        } else {
          return [rootEqualityPaths, result];
        }
      } else {
        return is_1.isEmptyObject(result) ? void 0 : result;
      }
    }
    exports.generateReferentialEqualityAnnotations = generateReferentialEqualityAnnotations;
    var walker = function(object2, identities, superJson, dedupe, path3, objectsInThisPath, seenObjects) {
      var _a2;
      if (path3 === void 0) {
        path3 = [];
      }
      if (objectsInThisPath === void 0) {
        objectsInThisPath = [];
      }
      if (seenObjects === void 0) {
        seenObjects = /* @__PURE__ */ new Map();
      }
      var primitive = is_1.isPrimitive(object2);
      if (!primitive) {
        addIdentity(object2, path3, identities);
        var seen = seenObjects.get(object2);
        if (seen) {
          return dedupe ? {
            transformedValue: null
          } : seen;
        }
      }
      if (!isDeep(object2, superJson)) {
        var transformed_1 = transformer_1.transformValue(object2, superJson);
        var result_1 = transformed_1 ? {
          transformedValue: transformed_1.value,
          annotations: [transformed_1.type]
        } : {
          transformedValue: object2
        };
        if (!primitive) {
          seenObjects.set(object2, result_1);
        }
        return result_1;
      }
      if (util_1.includes(objectsInThisPath, object2)) {
        return {
          transformedValue: null
        };
      }
      var transformationResult = transformer_1.transformValue(object2, superJson);
      var transformed = (_a2 = transformationResult === null || transformationResult === void 0 ? void 0 : transformationResult.value) !== null && _a2 !== void 0 ? _a2 : object2;
      var transformedValue = is_1.isArray(transformed) ? [] : {};
      var innerAnnotations = {};
      util_1.forEach(transformed, function(value, index2) {
        var recursiveResult = exports.walker(value, identities, superJson, dedupe, __spreadArray(__spreadArray([], __read(path3)), [index2]), __spreadArray(__spreadArray([], __read(objectsInThisPath)), [object2]), seenObjects);
        transformedValue[index2] = recursiveResult.transformedValue;
        if (is_1.isArray(recursiveResult.annotations)) {
          innerAnnotations[index2] = recursiveResult.annotations;
        } else if (is_1.isPlainObject(recursiveResult.annotations)) {
          util_1.forEach(recursiveResult.annotations, function(tree, key) {
            innerAnnotations[pathstringifier_1.escapeKey(index2) + "." + key] = tree;
          });
        }
      });
      var result = is_1.isEmptyObject(innerAnnotations) ? {
        transformedValue,
        annotations: !!transformationResult ? [transformationResult.type] : void 0
      } : {
        transformedValue,
        annotations: !!transformationResult ? [transformationResult.type, innerAnnotations] : innerAnnotations
      };
      if (!primitive) {
        seenObjects.set(object2, result);
      }
      return result;
    };
    exports.walker = walker;
  }
});

// node_modules/is-what/dist/cjs/index.cjs
var require_cjs = __commonJS({
  "node_modules/is-what/dist/cjs/index.cjs"(exports) {
    "use strict";
    function getType(payload) {
      return Object.prototype.toString.call(payload).slice(8, -1);
    }
    function isAnyObject(payload) {
      return getType(payload) === "Object";
    }
    function isArray(payload) {
      return getType(payload) === "Array";
    }
    function isBlob(payload) {
      return getType(payload) === "Blob";
    }
    function isBoolean(payload) {
      return getType(payload) === "Boolean";
    }
    function isDate(payload) {
      return getType(payload) === "Date" && !isNaN(payload);
    }
    function isEmptyArray(payload) {
      return isArray(payload) && payload.length === 0;
    }
    function isPlainObject2(payload) {
      if (getType(payload) !== "Object")
        return false;
      const prototype = Object.getPrototypeOf(payload);
      return !!prototype && prototype.constructor === Object && prototype === Object.prototype;
    }
    function isEmptyObject(payload) {
      return isPlainObject2(payload) && Object.keys(payload).length === 0;
    }
    function isEmptyString(payload) {
      return payload === "";
    }
    function isError(payload) {
      return getType(payload) === "Error" || payload instanceof Error;
    }
    function isFile(payload) {
      return getType(payload) === "File";
    }
    function isFullArray(payload) {
      return isArray(payload) && payload.length > 0;
    }
    function isFullObject(payload) {
      return isPlainObject2(payload) && Object.keys(payload).length > 0;
    }
    function isString(payload) {
      return getType(payload) === "String";
    }
    function isFullString(payload) {
      return isString(payload) && payload !== "";
    }
    function isFunction(payload) {
      return typeof payload === "function";
    }
    function isType(payload, type) {
      if (!(type instanceof Function)) {
        throw new TypeError("Type must be a function");
      }
      if (!Object.prototype.hasOwnProperty.call(type, "prototype")) {
        throw new TypeError("Type is not a class");
      }
      const name = type.name;
      return getType(payload) === name || Boolean(payload && payload.constructor === type);
    }
    function isInstanceOf(value, classOrClassName) {
      if (typeof classOrClassName === "function") {
        for (let p = value; p; p = Object.getPrototypeOf(p)) {
          if (isType(p, classOrClassName)) {
            return true;
          }
        }
        return false;
      } else {
        for (let p = value; p; p = Object.getPrototypeOf(p)) {
          if (getType(p) === classOrClassName) {
            return true;
          }
        }
        return false;
      }
    }
    function isMap(payload) {
      return getType(payload) === "Map";
    }
    function isNaNValue(payload) {
      return getType(payload) === "Number" && isNaN(payload);
    }
    function isNumber(payload) {
      return getType(payload) === "Number" && !isNaN(payload);
    }
    function isNegativeNumber(payload) {
      return isNumber(payload) && payload < 0;
    }
    function isNull2(payload) {
      return getType(payload) === "Null";
    }
    function isOneOf(a, b, c, d, e) {
      return (value) => a(value) || b(value) || !!c && c(value) || !!d && d(value) || !!e && e(value);
    }
    function isUndefined(payload) {
      return getType(payload) === "Undefined";
    }
    var isNullOrUndefined = isOneOf(isNull2, isUndefined);
    function isObject2(payload) {
      return isPlainObject2(payload);
    }
    function isObjectLike(payload) {
      return isAnyObject(payload);
    }
    function isPositiveNumber(payload) {
      return isNumber(payload) && payload > 0;
    }
    function isSymbol(payload) {
      return getType(payload) === "Symbol";
    }
    function isPrimitive(payload) {
      return isBoolean(payload) || isNull2(payload) || isUndefined(payload) || isNumber(payload) || isString(payload) || isSymbol(payload);
    }
    function isPromise(payload) {
      return getType(payload) === "Promise";
    }
    function isRegExp(payload) {
      return getType(payload) === "RegExp";
    }
    function isSet(payload) {
      return getType(payload) === "Set";
    }
    function isWeakMap(payload) {
      return getType(payload) === "WeakMap";
    }
    function isWeakSet(payload) {
      return getType(payload) === "WeakSet";
    }
    exports.getType = getType;
    exports.isAnyObject = isAnyObject;
    exports.isArray = isArray;
    exports.isBlob = isBlob;
    exports.isBoolean = isBoolean;
    exports.isDate = isDate;
    exports.isEmptyArray = isEmptyArray;
    exports.isEmptyObject = isEmptyObject;
    exports.isEmptyString = isEmptyString;
    exports.isError = isError;
    exports.isFile = isFile;
    exports.isFullArray = isFullArray;
    exports.isFullObject = isFullObject;
    exports.isFullString = isFullString;
    exports.isFunction = isFunction;
    exports.isInstanceOf = isInstanceOf;
    exports.isMap = isMap;
    exports.isNaNValue = isNaNValue;
    exports.isNegativeNumber = isNegativeNumber;
    exports.isNull = isNull2;
    exports.isNullOrUndefined = isNullOrUndefined;
    exports.isNumber = isNumber;
    exports.isObject = isObject2;
    exports.isObjectLike = isObjectLike;
    exports.isOneOf = isOneOf;
    exports.isPlainObject = isPlainObject2;
    exports.isPositiveNumber = isPositiveNumber;
    exports.isPrimitive = isPrimitive;
    exports.isPromise = isPromise;
    exports.isRegExp = isRegExp;
    exports.isSet = isSet;
    exports.isString = isString;
    exports.isSymbol = isSymbol;
    exports.isType = isType;
    exports.isUndefined = isUndefined;
    exports.isWeakMap = isWeakMap;
    exports.isWeakSet = isWeakSet;
  }
});

// node_modules/copy-anything/dist/cjs/index.cjs
var require_cjs2 = __commonJS({
  "node_modules/copy-anything/dist/cjs/index.cjs"(exports) {
    "use strict";
    var isWhat = require_cjs();
    function assignProp2(carry, key, newVal, originalObject, includeNonenumerable) {
      const propType = {}.propertyIsEnumerable.call(originalObject, key) ? "enumerable" : "nonenumerable";
      if (propType === "enumerable")
        carry[key] = newVal;
      if (includeNonenumerable && propType === "nonenumerable") {
        Object.defineProperty(carry, key, {
          value: newVal,
          enumerable: false,
          writable: true,
          configurable: true
        });
      }
    }
    function copy(target, options = {}) {
      if (isWhat.isArray(target)) {
        return target.map((item) => copy(item, options));
      }
      if (!isWhat.isPlainObject(target)) {
        return target;
      }
      const props = Object.getOwnPropertyNames(target);
      const symbols = Object.getOwnPropertySymbols(target);
      return [...props, ...symbols].reduce((carry, key) => {
        if (isWhat.isArray(options.props) && !options.props.includes(key)) {
          return carry;
        }
        const val = target[key];
        const newVal = copy(val, options);
        assignProp2(carry, key, newVal, target, options.nonenumerable);
        return carry;
      }, {});
    }
    exports.copy = copy;
  }
});

// node_modules/superjson/dist/index.js
var require_dist = __commonJS({
  "node_modules/superjson/dist/index.js"(exports) {
    "use strict";
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t2) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t2[p] = s[p];
        }
        return t2;
      };
      return __assign.apply(this, arguments);
    };
    var __read = exports && exports.__read || function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error46) {
        e = { error: error46 };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    var __spreadArray = exports && exports.__spreadArray || function(to, from) {
      for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
      return to;
    };
    exports.__esModule = true;
    exports.allowErrorProps = exports.registerSymbol = exports.registerCustom = exports.registerClass = exports.parse = exports.stringify = exports.deserialize = exports.serialize = exports.SuperJSON = void 0;
    var class_registry_1 = require_class_registry();
    var registry_1 = require_registry();
    var custom_transformer_registry_1 = require_custom_transformer_registry();
    var plainer_1 = require_plainer();
    var copy_anything_1 = require_cjs2();
    var SuperJSON = (
      /** @class */
      (function() {
        function SuperJSON2(_a2) {
          var _b = _a2 === void 0 ? {} : _a2, _c = _b.dedupe, dedupe = _c === void 0 ? false : _c;
          this.classRegistry = new class_registry_1.ClassRegistry();
          this.symbolRegistry = new registry_1.Registry(function(s) {
            var _a3;
            return (_a3 = s.description) !== null && _a3 !== void 0 ? _a3 : "";
          });
          this.customTransformerRegistry = new custom_transformer_registry_1.CustomTransformerRegistry();
          this.allowedErrorProps = [];
          this.dedupe = dedupe;
        }
        SuperJSON2.prototype.serialize = function(object2) {
          var identities = /* @__PURE__ */ new Map();
          var output = plainer_1.walker(object2, identities, this, this.dedupe);
          var res = {
            json: output.transformedValue
          };
          if (output.annotations) {
            res.meta = __assign(__assign({}, res.meta), { values: output.annotations });
          }
          var equalityAnnotations = plainer_1.generateReferentialEqualityAnnotations(identities, this.dedupe);
          if (equalityAnnotations) {
            res.meta = __assign(__assign({}, res.meta), { referentialEqualities: equalityAnnotations });
          }
          return res;
        };
        SuperJSON2.prototype.deserialize = function(payload) {
          var json6 = payload.json, meta3 = payload.meta;
          var result = copy_anything_1.copy(json6);
          if (meta3 === null || meta3 === void 0 ? void 0 : meta3.values) {
            result = plainer_1.applyValueAnnotations(result, meta3.values, this);
          }
          if (meta3 === null || meta3 === void 0 ? void 0 : meta3.referentialEqualities) {
            result = plainer_1.applyReferentialEqualityAnnotations(result, meta3.referentialEqualities);
          }
          return result;
        };
        SuperJSON2.prototype.stringify = function(object2) {
          return JSON.stringify(this.serialize(object2));
        };
        SuperJSON2.prototype.parse = function(string4) {
          return this.deserialize(JSON.parse(string4));
        };
        SuperJSON2.prototype.registerClass = function(v, options) {
          this.classRegistry.register(v, options);
        };
        SuperJSON2.prototype.registerSymbol = function(v, identifier) {
          this.symbolRegistry.register(v, identifier);
        };
        SuperJSON2.prototype.registerCustom = function(transformer, name) {
          this.customTransformerRegistry.register(__assign({ name }, transformer));
        };
        SuperJSON2.prototype.allowErrorProps = function() {
          var _a2;
          var props = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            props[_i] = arguments[_i];
          }
          (_a2 = this.allowedErrorProps).push.apply(_a2, __spreadArray([], __read(props)));
        };
        SuperJSON2.defaultInstance = new SuperJSON2();
        SuperJSON2.serialize = SuperJSON2.defaultInstance.serialize.bind(SuperJSON2.defaultInstance);
        SuperJSON2.deserialize = SuperJSON2.defaultInstance.deserialize.bind(SuperJSON2.defaultInstance);
        SuperJSON2.stringify = SuperJSON2.defaultInstance.stringify.bind(SuperJSON2.defaultInstance);
        SuperJSON2.parse = SuperJSON2.defaultInstance.parse.bind(SuperJSON2.defaultInstance);
        SuperJSON2.registerClass = SuperJSON2.defaultInstance.registerClass.bind(SuperJSON2.defaultInstance);
        SuperJSON2.registerSymbol = SuperJSON2.defaultInstance.registerSymbol.bind(SuperJSON2.defaultInstance);
        SuperJSON2.registerCustom = SuperJSON2.defaultInstance.registerCustom.bind(SuperJSON2.defaultInstance);
        SuperJSON2.allowErrorProps = SuperJSON2.defaultInstance.allowErrorProps.bind(SuperJSON2.defaultInstance);
        return SuperJSON2;
      })()
    );
    exports.SuperJSON = SuperJSON;
    exports["default"] = SuperJSON;
    exports.serialize = SuperJSON.serialize;
    exports.deserialize = SuperJSON.deserialize;
    exports.stringify = SuperJSON.stringify;
    exports.parse = SuperJSON.parse;
    exports.registerClass = SuperJSON.registerClass;
    exports.registerCustom = SuperJSON.registerCustom;
    exports.registerSymbol = SuperJSON.registerSymbol;
    exports.allowErrorProps = SuperJSON.allowErrorProps;
  }
});

// server/_core/index.ts
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/_core/health.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
function readBuildInfo() {
  const candidates = [
    path.join(process.cwd(), "dist", "build-info.json"),
    path.join(__dirname, "build-info.json")
  ];
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue;
      const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
      const commitSha = raw.commitSha ?? raw.version ?? "unknown";
      const version2 = raw.version ?? raw.commitSha ?? "unknown";
      const builtAt = raw.builtAt ?? raw.buildTime ?? (/* @__PURE__ */ new Date()).toISOString();
      if (!commitSha || commitSha === "unknown") {
        throw new Error("invalid build-info");
      }
      const railwaySha = process.env.RAILWAY_GIT_COMMIT_SHA;
      const resolvedSha = railwaySha && /^[0-9a-f]{40}$/i.test(railwaySha) ? railwaySha : commitSha;
      return {
        ok: true,
        commitSha: resolvedSha,
        version: resolvedSha,
        builtAt
      };
    } catch {
      continue;
    }
  }
  return {
    ok: false,
    commitSha: "unknown",
    version: "unknown",
    builtAt: "unknown"
  };
}

// shared/version.ts
var APP_VERSION = "6.182";
var GIT_SHA = process.env.EXPO_PUBLIC_GIT_SHA || "unknown";
var BUILT_AT = process.env.EXPO_PUBLIC_BUILT_AT || "unknown";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var SESSION_MAX_AGE_MS = 1e3 * 60 * 60 * 72;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

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
function getParentDomain(hostname3) {
  if (LOCAL_HOSTS.has(hostname3) || isIpAddress(hostname3)) {
    return void 0;
  }
  const parts = hostname3.split(".");
  if (parts.length < 3) {
    return void 0;
  }
  return "." + parts.slice(-2).join(".");
}
function getEffectiveHostname(req) {
  const forwarded = req.headers["x-forwarded-host"];
  if (forwarded) {
    const host = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
    if (host && host.trim()) return host.trim();
  }
  const origin = req.headers.origin;
  if (origin) {
    try {
      const u = new URL(origin);
      if (u.hostname) return u.hostname;
    } catch {
    }
  }
  return req.hostname;
}
function getCookieDomain(req, hostname3) {
  const forwarded = req.headers["x-forwarded-host"] ?? req.headers.origin;
  if (forwarded) {
    return void 0;
  }
  return getParentDomain(hostname3);
}
function getSessionCookieOptions(req, options) {
  const hostname3 = getEffectiveHostname(req);
  const domain2 = getCookieDomain(req, hostname3);
  const isSecure = isSecureRequest(req);
  if (options?.crossSite) {
    if (!isSecure) {
      console.warn(
        "[Cookies] crossSite=true requires HTTPS. Falling back to sameSite=lax"
      );
      return {
        domain: domain2,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: false
      };
    }
    return {
      domain: domain2,
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true
    };
  }
  return {
    domain: domain2,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isSecure
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
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify as jwtVerify2 } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var SDKServer = class {
  constructor() {
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = process.env.JWT_SECRET ?? ENV.cookieSecret;
    if (!secret || secret.trim() === "") {
      throw new Error(
        "JWT_SECRET environment variable is not set or empty. This is required for session token generation."
      );
    }
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a user openId
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
    const expiresInMs = options.expiresInMs ?? SESSION_MAX_AGE_MS;
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
    } catch (error46) {
      console.warn("[Auth] Session verification failed", String(error46));
      return null;
    }
  }
  /**
   * リクエストからユーザーを認証する。
   * Bearer トークン or セッション Cookie の JWT を検証し、DB からユーザーを取得する。
   */
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
    const user = await getUserByOpenId(sessionUserId);
    if (!user) {
      console.error("[Auth] User not found in DB:", sessionUserId);
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
init_twitter_oauth2();

// server/token-store.ts
init_db2();
init_schema2();
import crypto2 from "crypto";
import { eq as eq6 } from "drizzle-orm";
var ALGORITHM = "aes-256-gcm";
var IV_LENGTH = 12;
var AUTH_TAG_LENGTH = 16;
function getEncryptionKey() {
  const rawKey = process.env.TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET || "";
  if (!rawKey) {
    throw new Error("TOKEN_ENCRYPTION_KEY or JWT_SECRET must be set for token encryption");
  }
  return crypto2.createHash("sha256").update(rawKey).digest();
}
function encryptToken(plaintext) {
  const key = getEncryptionKey();
  const iv = crypto2.randomBytes(IV_LENGTH);
  const cipher = crypto2.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("hex");
}
function decryptToken(encryptedHex) {
  const key = getEncryptionKey();
  const data = Buffer.from(encryptedHex, "hex");
  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto2.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(ciphertext) + decipher.final("utf8");
}
var tokenCache = /* @__PURE__ */ new Map();
async function storeTokens(openId, tokens) {
  const expiresAt = new Date(Date.now() + tokens.expiresIn * 1e3);
  tokenCache.set(openId, {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken || null,
    expiresAt,
    scope: tokens.scope || null
  });
  try {
    const db = await getDb();
    if (!db) return;
    const encryptedAccess = encryptToken(tokens.accessToken);
    const encryptedRefresh = tokens.refreshToken ? encryptToken(tokens.refreshToken) : null;
    await db.insert(userTwitterTokens).values({
      openId,
      encryptedAccessToken: encryptedAccess,
      encryptedRefreshToken: encryptedRefresh,
      tokenExpiresAt: expiresAt,
      scope: tokens.scope || null
    }).onDuplicateKeyUpdate({
      set: {
        encryptedAccessToken: encryptedAccess,
        encryptedRefreshToken: encryptedRefresh,
        tokenExpiresAt: expiresAt,
        scope: tokens.scope || null
      }
    });
  } catch (error46) {
    console.error("[TokenStore] DB save failed:", error46 instanceof Error ? error46.message : "unknown");
  }
}
async function getTokens(openId) {
  const cached2 = tokenCache.get(openId);
  if (cached2) return cached2;
  try {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(userTwitterTokens).where(eq6(userTwitterTokens.openId, openId)).limit(1);
    if (result.length === 0) return null;
    const row = result[0];
    const entry = {
      accessToken: decryptToken(row.encryptedAccessToken),
      refreshToken: row.encryptedRefreshToken ? decryptToken(row.encryptedRefreshToken) : null,
      expiresAt: new Date(row.tokenExpiresAt),
      scope: row.scope
    };
    tokenCache.set(openId, entry);
    return entry;
  } catch (error46) {
    console.error("[TokenStore] DB read failed:", error46 instanceof Error ? error46.message : "unknown");
    return null;
  }
}
async function getValidAccessToken(openId) {
  const entry = await getTokens(openId);
  if (!entry) return null;
  const bufferMs = 5 * 60 * 1e3;
  if (entry.expiresAt.getTime() - bufferMs > Date.now()) {
    return entry.accessToken;
  }
  if (!entry.refreshToken) return entry.accessToken;
  try {
    const { refreshAccessToken: refreshAccessToken3 } = await Promise.resolve().then(() => (init_twitter_oauth2(), twitter_oauth2_exports));
    const newTokens = await refreshAccessToken3(entry.refreshToken);
    await storeTokens(openId, {
      accessToken: newTokens.access_token,
      refreshToken: newTokens.refresh_token,
      expiresIn: newTokens.expires_in,
      scope: newTokens.scope
    });
    return newTokens.access_token;
  } catch (error46) {
    console.error("[TokenStore] Auto-refresh failed:", error46 instanceof Error ? error46.message : "unknown");
    return entry.accessToken;
  }
}
async function deleteTokens(openId) {
  tokenCache.delete(openId);
  try {
    const db = await getDb();
    if (!db) return;
    await db.delete(userTwitterTokens).where(eq6(userTwitterTokens.openId, openId));
  } catch (error46) {
    console.error("[TokenStore] DB delete failed:", error46 instanceof Error ? error46.message : "unknown");
  }
}

// server/_core/oauth.ts
function buildUserResponse(user) {
  const u = user;
  return {
    id: u?.id ?? null,
    openId: user?.openId ?? null,
    name: user?.name ?? null,
    email: user?.email ?? null,
    loginMethod: user?.loginMethod ?? null,
    lastSignedIn: (user?.lastSignedIn ?? /* @__PURE__ */ new Date()).toISOString(),
    prefecture: u?.prefecture ?? null,
    gender: u?.gender ?? null,
    role: u?.role ?? null
  };
}
function registerOAuthRoutes(app) {
  app.post("/api/auth/logout", async (req, res) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.clearCookie("admin_session", { ...cookieOptions, maxAge: -1 });
    try {
      const user = await sdk.authenticateRequest(req).catch(() => null);
      if (user) {
        const storedTokens = await getTokens(user.openId);
        if (storedTokens?.accessToken) {
          revokeAccessToken(storedTokens.accessToken).catch(() => {
          });
        }
        await deleteTokens(user.openId).catch(() => {
        });
      }
    } catch {
    }
    res.json({ success: true });
  });
  app.get("/api/auth/me", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({ user: buildUserResponse(user) });
    } catch (error46) {
      console.error("[Auth] /api/auth/me failed:", error46 instanceof Error ? error46.message : "unknown");
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
      const cookieOptions = getSessionCookieOptions(req, { crossSite: true });
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: SESSION_MAX_AGE_MS });
      res.json({ success: true, user: buildUserResponse(user) });
    } catch (error46) {
      console.error("[Auth] /api/auth/session failed:", error46 instanceof Error ? error46.message : "unknown");
      res.status(401).json({ error: "Invalid token" });
    }
  });
}

// server/twitter-routes.ts
init_twitter_oauth2();
init_db2();

// server/login-security.ts
init_db2();
init_schema2();
import crypto3 from "crypto";
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const firstIp = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
    return firstIp?.trim() || "unknown";
  }
  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}
function getClientUserAgent(req) {
  return (req.headers["user-agent"] || "unknown").substring(0, 500);
}
async function writeLoginAuditLog(entry) {
  try {
    const db = await getDb();
    if (!db) return;
    await db.insert(auditLogs).values({
      requestId: crypto3.randomUUID(),
      action: "LOGIN",
      entityType: "user",
      actorName: entry.twitterUsername || entry.openId,
      reason: entry.success ? "Login successful" : `Login failed: ${entry.failureReason || "unknown"}`,
      ipAddress: entry.ip.substring(0, 45),
      userAgent: entry.userAgent.substring(0, 500),
      afterData: {
        openId: entry.openId,
        twitterId: entry.twitterId,
        success: entry.success
      }
    });
  } catch (error46) {
    console.error("[LoginSecurity] Audit log write failed:", error46 instanceof Error ? error46.message : "unknown");
  }
}
var MAX_FAILED_ATTEMPTS = 5;
var LOCK_DURATION_MS = 10 * 60 * 1e3;
var FAILED_WINDOW_MS = 15 * 60 * 1e3;
var failedLoginStore = /* @__PURE__ */ new Map();
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of failedLoginStore.entries()) {
    if (now - entry.firstFailedAt > FAILED_WINDOW_MS * 2) {
      failedLoginStore.delete(key);
    }
  }
}, 60 * 60 * 1e3);
function isLoginLocked(ip) {
  const entry = failedLoginStore.get(ip);
  if (!entry || !entry.lockedUntil) {
    return { locked: false, remainingSeconds: 0 };
  }
  const now = Date.now();
  if (now >= entry.lockedUntil) {
    failedLoginStore.delete(ip);
    return { locked: false, remainingSeconds: 0 };
  }
  return {
    locked: true,
    remainingSeconds: Math.ceil((entry.lockedUntil - now) / 1e3)
  };
}
function recordLoginFailure(ip) {
  const now = Date.now();
  const entry = failedLoginStore.get(ip);
  if (!entry || now - entry.firstFailedAt > FAILED_WINDOW_MS) {
    failedLoginStore.set(ip, {
      count: 1,
      firstFailedAt: now,
      lockedUntil: null
    });
    return;
  }
  entry.count++;
  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    entry.lockedUntil = now + LOCK_DURATION_MS;
    console.warn(`[LoginSecurity] IP ${ip.substring(0, 10)}... locked for ${LOCK_DURATION_MS / 1e3}s after ${entry.count} failures`);
  }
}
function resetLoginFailures(ip) {
  failedLoginStore.delete(ip);
}
var loginCooldownStore = /* @__PURE__ */ new Map();
function setLoginCooldown(openId) {
  loginCooldownStore.set(openId, Date.now() + 30 * 1e3);
}
function isInLoginCooldown(openId) {
  const until = loginCooldownStore.get(openId);
  if (!until) return false;
  if (Date.now() >= until) {
    loginCooldownStore.delete(openId);
    return false;
  }
  return true;
}
setInterval(() => {
  const now = Date.now();
  for (const [key, until] of loginCooldownStore.entries()) {
    if (now >= until) {
      loginCooldownStore.delete(key);
    }
  }
}, 5 * 60 * 1e3);

// server/twitter-routes.ts
function createErrorResponse(error46, includeDetails = false) {
  const isProduction = process.env.NODE_ENV === "production";
  let errorMessage = "Failed to complete Twitter authentication";
  let errorDetails = "";
  if (error46 instanceof Error) {
    errorMessage = error46.message;
    errorDetails = includeDetails && !isProduction ? error46.stack || "" : "";
  } else if (typeof error46 === "string") {
    errorMessage = error46;
  }
  return {
    error: true,
    message: errorMessage,
    ...errorDetails && { details: errorDetails.substring(0, 200) }
  };
}
function registerTwitterRoutes(app) {
  app.get("/api/twitter/auth", async (req, res) => {
    try {
      const clientIp = getClientIp(req);
      const lockStatus = isLoginLocked(clientIp);
      if (lockStatus.locked) {
        res.status(429).json({
          error: `\u30ED\u30B0\u30A4\u30F3\u8A66\u884C\u56DE\u6570\u304C\u4E0A\u9650\u306B\u9054\u3057\u307E\u3057\u305F\u3002${lockStatus.remainingSeconds}\u79D2\u5F8C\u306B\u518D\u8A66\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002`
        });
        return;
      }
      const forceLogin = req.query.force === "true" || req.query.switch === "true";
      const protocol = req.get("x-forwarded-proto") || req.protocol;
      const forceHttps = protocol === "https" || req.get("host")?.includes("manus.computer");
      const callbackUrl = `${forceHttps ? "https" : protocol}://${req.get("host")}/api/twitter/callback`;
      const { codeVerifier, codeChallenge } = generatePKCE();
      const state = generateState();
      await storePKCEData(state, codeVerifier, callbackUrl);
      const authUrl = buildAuthorizationUrl(callbackUrl, state, codeChallenge, forceLogin);
      res.redirect(authUrl);
    } catch (error46) {
      console.error("[Twitter Auth] Init error:", error46 instanceof Error ? error46.message : "unknown");
      res.status(500).json({ error: "\u30ED\u30B0\u30A4\u30F3\u306E\u958B\u59CB\u306B\u5931\u6557\u3057\u307E\u3057\u305F" });
    }
  });
  app.get("/api/twitter/callback", async (req, res) => {
    const callbackIp = getClientIp(req);
    const callbackUa = getClientUserAgent(req);
    try {
      const { code, state, error: oauthError, error_description } = req.query;
      if (oauthError) {
        writeLoginAuditLog({
          openId: "unknown",
          success: false,
          ip: callbackIp,
          userAgent: callbackUa,
          failureReason: `OAuth error: ${oauthError}`
        }).catch(() => {
        });
        if (oauthError !== "access_denied") recordLoginFailure(callbackIp);
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
        const errorResponse = createErrorResponse(
          {
            message: oauthError === "access_denied" ? "\u8A8D\u8A3C\u304C\u30AD\u30E3\u30F3\u30BB\u30EB\u3055\u308C\u307E\u3057\u305F" : error_description || "Twitter\u8A8D\u8A3C\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F",
            code: oauthError
          },
          false
          // 本番環境では詳細情報を含めない
        );
        const errorData = encodeURIComponent(JSON.stringify({
          ...errorResponse,
          code: oauthError
        }));
        res.redirect(`${baseUrl2}/oauth/twitter-callback?error=${errorData}`);
        return;
      }
      if (!code || !state) {
        recordLoginFailure(callbackIp);
        writeLoginAuditLog({ openId: "unknown", success: false, ip: callbackIp, userAgent: callbackUa, failureReason: "Missing code/state" }).catch(() => {
        });
        res.status(400).json({ error: "Missing code or state parameter" });
        return;
      }
      const pkceData = await getPKCEData(state);
      if (!pkceData) {
        recordLoginFailure(callbackIp);
        writeLoginAuditLog({ openId: "unknown", success: false, ip: callbackIp, userAgent: callbackUa, failureReason: "Invalid/expired state" }).catch(() => {
        });
        res.status(400).json({ error: "Invalid or expired state parameter" });
        return;
      }
      const { codeVerifier, callbackUrl } = pkceData;
      const tokens = await exchangeCodeForTokens(code, callbackUrl, codeVerifier);
      setImmediate(() => deletePKCEData(state).catch(() => {
      }));
      const userProfile = await getUserProfile(tokens.access_token);
      const isFollowingTarget = false;
      const targetAccount = null;
      const userData = {
        twitterId: userProfile.id,
        name: userProfile.name,
        username: userProfile.username,
        profileImage: userProfile.profile_image_url?.replace("_normal", "_400x400"),
        followersCount: userProfile.public_metrics?.followers_count || 0,
        followingCount: userProfile.public_metrics?.following_count || 0,
        description: userProfile.description || "",
        // 注意: accessToken, refreshToken はセキュリティ上クライアントに送らない
        isFollowingTarget,
        targetAccount
      };
      const openId = `twitter:${userProfile.id}`;
      await storeTokens(openId, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
        scope: tokens.scope
      });
      let dbSaveSuccess = false;
      for (let dbRetry = 0; dbRetry < 2; dbRetry++) {
        try {
          await upsertUser({
            openId,
            name: userProfile.name,
            email: null,
            loginMethod: "twitter",
            lastSignedIn: /* @__PURE__ */ new Date()
          });
          dbSaveSuccess = true;
          break;
        } catch (error46) {
          console.error(`[Twitter Auth] DB save failed (attempt ${dbRetry + 1}/2):`, error46 instanceof Error ? error46.message : "unknown");
          if (dbRetry === 0) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      }
      if (!dbSaveSuccess) {
        console.warn("[Twitter Auth] DB save failed after retries, continuing");
      }
      resetLoginFailures(callbackIp);
      setLoginCooldown(openId);
      writeLoginAuditLog({
        openId,
        twitterId: userProfile.id,
        twitterUsername: userProfile.username,
        success: true,
        ip: callbackIp,
        userAgent: callbackUa
      }).catch(() => {
      });
      let sessionToken;
      let sessionError;
      for (let sessionRetry = 0; sessionRetry < 2; sessionRetry++) {
        try {
          sessionToken = await sdk.createSessionToken(openId, {
            name: userProfile.name || "",
            expiresInMs: SESSION_MAX_AGE_MS
          });
          const cookieOptions = getSessionCookieOptions(req, { crossSite: true });
          res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: SESSION_MAX_AGE_MS });
          break;
        } catch (error46) {
          const msg = error46 instanceof Error ? error46.message : String(error46);
          console.error(`[Twitter Auth] Session creation failed (attempt ${sessionRetry + 1}/2):`, msg);
          sessionError = msg;
          if (sessionRetry === 0) {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }
      }
      if (!sessionToken) {
        console.error("[Twitter Auth] Session creation failed after retries");
      }
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
      const redirectParams = new URLSearchParams({
        data: encodedData
      });
      if (sessionToken) {
        redirectParams.set("sessionToken", sessionToken);
      }
      const redirectUrl = `${baseUrl}/oauth/twitter-callback?${redirectParams.toString()}`;
      res.redirect(redirectUrl);
    } catch (error46) {
      console.error("[Twitter Auth] Callback error:", error46 instanceof Error ? error46.message : "unknown");
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
      const errorResponse = createErrorResponse(error46, process.env.NODE_ENV !== "production");
      const errorData = encodeURIComponent(JSON.stringify(errorResponse));
      res.redirect(`${baseUrl}/oauth/twitter-callback?error=${errorData}`);
    }
  });
  app.get("/api/twitter/me", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      const openId = user.openId;
      const accessToken = await getValidAccessToken(openId);
      if (!accessToken) {
        res.status(401).json({ error: "Twitter token not found. Please re-login." });
        return;
      }
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
    } catch (error46) {
      console.error("Twitter profile error:", error46 instanceof Error ? error46.message : "unknown");
      res.status(500).json({ error: "Failed to get Twitter profile" });
    }
  });
  app.get("/api/twitter/follow-status", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      const openId = user.openId;
      const userId = req.query.userId;
      if (!userId) {
        res.status(400).json({ error: "Missing userId parameter" });
        return;
      }
      if (isInLoginCooldown(openId)) {
        res.status(429).json({ error: "\u30ED\u30B0\u30A4\u30F3\u76F4\u5F8C\u306F\u3057\u3070\u3089\u304F\u304A\u5F85\u3061\u304F\u3060\u3055\u3044" });
        return;
      }
      const accessToken = await getValidAccessToken(openId);
      if (!accessToken) {
        res.status(401).json({ error: "Twitter token not found. Please re-login." });
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
    } catch (error46) {
      console.error("Follow status error:", error46 instanceof Error ? error46.message : "unknown");
      res.status(500).json({ error: "Failed to check follow status" });
    }
  });
  app.get("/api/twitter/target-account", async (req, res) => {
    try {
      const targetInfo = getTargetAccountInfo();
      res.json(targetInfo);
    } catch (error46) {
      console.error("Target account error:", error46);
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
    } catch (error46) {
      console.error("[Twitter] User lookup error:", error46 instanceof Error ? error46.message : "unknown");
      res.status(500).json({ error: "\u30E6\u30FC\u30B6\u30FC\u691C\u7D22\u306B\u5931\u6557\u3057\u307E\u3057\u305F" });
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
      res.redirect(authUrl);
    } catch (error46) {
      console.error("[Twitter Auth] Refresh follow status error:", error46 instanceof Error ? error46.message : "unknown");
      res.status(500).json({ error: "\u30D5\u30A9\u30ED\u30FC\u72B6\u614B\u306E\u66F4\u65B0\u306B\u5931\u6557\u3057\u307E\u3057\u305F" });
    }
  });
  app.post("/api/twitter/refresh", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      const openId = user.openId;
      const accessToken = await getValidAccessToken(openId);
      if (!accessToken) {
        res.status(401).json({ error: "Token not found. Please re-login." });
        return;
      }
      res.json({
        success: true,
        message: "Token refreshed server-side"
      });
    } catch (error46) {
      console.error("Twitter token refresh error:", error46 instanceof Error ? error46.message : "unknown");
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
    } catch (error46) {
      console.error("[Twitter] Lookup error:", error46 instanceof Error ? error46.message : "unknown");
      res.status(500).json({ error: "\u30E6\u30FC\u30B6\u30FC\u691C\u7D22\u306B\u5931\u6557\u3057\u307E\u3057\u305F" });
    }
  });
}

// server/_core/trpc.ts
var import_superjson = __toESM(require_dist(), 1);
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";

// server/_core/request-id.ts
import { randomUUID } from "crypto";
function generateRequestId() {
  return randomUUID();
}
var RESPONSE_REQUEST_ID_HEADER = "x-request-id";

// server/_core/trpc.ts
var t = initTRPC.context().create({
  transformer: import_superjson.default
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
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
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

// server/routers/auth.ts
var authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  })
});

// node_modules/zod/v4/classic/external.js
var external_exports = {};
__export(external_exports, {
  $brand: () => $brand,
  $input: () => $input,
  $output: () => $output,
  NEVER: () => NEVER,
  TimePrecision: () => TimePrecision,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBase64: () => ZodBase64,
  ZodBase64URL: () => ZodBase64URL,
  ZodBigInt: () => ZodBigInt,
  ZodBigIntFormat: () => ZodBigIntFormat,
  ZodBoolean: () => ZodBoolean,
  ZodCIDRv4: () => ZodCIDRv4,
  ZodCIDRv6: () => ZodCIDRv6,
  ZodCUID: () => ZodCUID,
  ZodCUID2: () => ZodCUID2,
  ZodCatch: () => ZodCatch,
  ZodCodec: () => ZodCodec,
  ZodCustom: () => ZodCustom,
  ZodCustomStringFormat: () => ZodCustomStringFormat,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodE164: () => ZodE164,
  ZodEmail: () => ZodEmail,
  ZodEmoji: () => ZodEmoji,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFile: () => ZodFile,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodGUID: () => ZodGUID,
  ZodIPv4: () => ZodIPv4,
  ZodIPv6: () => ZodIPv6,
  ZodISODate: () => ZodISODate,
  ZodISODateTime: () => ZodISODateTime,
  ZodISODuration: () => ZodISODuration,
  ZodISOTime: () => ZodISOTime,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodJWT: () => ZodJWT,
  ZodKSUID: () => ZodKSUID,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMAC: () => ZodMAC,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNanoID: () => ZodNanoID,
  ZodNever: () => ZodNever,
  ZodNonOptional: () => ZodNonOptional,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodNumberFormat: () => ZodNumberFormat,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodPipe: () => ZodPipe,
  ZodPrefault: () => ZodPrefault,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRealError: () => ZodRealError,
  ZodRecord: () => ZodRecord,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodStringFormat: () => ZodStringFormat,
  ZodSuccess: () => ZodSuccess,
  ZodSymbol: () => ZodSymbol,
  ZodTemplateLiteral: () => ZodTemplateLiteral,
  ZodTransform: () => ZodTransform,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodULID: () => ZodULID,
  ZodURL: () => ZodURL,
  ZodUUID: () => ZodUUID,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  ZodXID: () => ZodXID,
  ZodXor: () => ZodXor,
  _ZodString: () => _ZodString,
  _default: () => _default2,
  _function: () => _function,
  any: () => any,
  array: () => array,
  base64: () => base642,
  base64url: () => base64url2,
  bigint: () => bigint2,
  boolean: () => boolean10,
  catch: () => _catch2,
  check: () => check,
  cidrv4: () => cidrv42,
  cidrv6: () => cidrv62,
  clone: () => clone,
  codec: () => codec,
  coerce: () => coerce_exports,
  config: () => config,
  core: () => core_exports2,
  cuid: () => cuid3,
  cuid2: () => cuid22,
  custom: () => custom,
  date: () => date3,
  decode: () => decode2,
  decodeAsync: () => decodeAsync2,
  describe: () => describe2,
  discriminatedUnion: () => discriminatedUnion,
  e164: () => e1642,
  email: () => email2,
  emoji: () => emoji2,
  encode: () => encode2,
  encodeAsync: () => encodeAsync2,
  endsWith: () => _endsWith,
  enum: () => _enum2,
  file: () => file,
  flattenError: () => flattenError,
  float32: () => float32,
  float64: () => float64,
  formatError: () => formatError,
  fromJSONSchema: () => fromJSONSchema,
  function: () => _function,
  getErrorMap: () => getErrorMap,
  globalRegistry: () => globalRegistry,
  gt: () => _gt,
  gte: () => _gte,
  guid: () => guid2,
  hash: () => hash,
  hex: () => hex2,
  hostname: () => hostname2,
  httpUrl: () => httpUrl,
  includes: () => _includes,
  instanceof: () => _instanceof,
  int: () => int12,
  int32: () => int32,
  int64: () => int64,
  intersection: () => intersection,
  ipv4: () => ipv42,
  ipv6: () => ipv62,
  iso: () => iso_exports,
  json: () => json5,
  jwt: () => jwt,
  keyof: () => keyof,
  ksuid: () => ksuid2,
  lazy: () => lazy,
  length: () => _length,
  literal: () => literal,
  locales: () => locales_exports,
  looseObject: () => looseObject,
  looseRecord: () => looseRecord,
  lowercase: () => _lowercase,
  lt: () => _lt,
  lte: () => _lte,
  mac: () => mac2,
  map: () => map,
  maxLength: () => _maxLength,
  maxSize: () => _maxSize,
  meta: () => meta2,
  mime: () => _mime,
  minLength: () => _minLength,
  minSize: () => _minSize,
  multipleOf: () => _multipleOf,
  nan: () => nan,
  nanoid: () => nanoid2,
  nativeEnum: () => nativeEnum,
  negative: () => _negative,
  never: () => never,
  nonnegative: () => _nonnegative,
  nonoptional: () => nonoptional,
  nonpositive: () => _nonpositive,
  normalize: () => _normalize,
  null: () => _null3,
  nullable: () => nullable,
  nullish: () => nullish2,
  number: () => number2,
  object: () => object,
  optional: () => optional,
  overwrite: () => _overwrite,
  parse: () => parse2,
  parseAsync: () => parseAsync2,
  partialRecord: () => partialRecord,
  pipe: () => pipe,
  positive: () => _positive,
  prefault: () => prefault,
  preprocess: () => preprocess,
  prettifyError: () => prettifyError,
  promise: () => promise,
  property: () => _property,
  readonly: () => readonly,
  record: () => record,
  refine: () => refine,
  regex: () => _regex,
  regexes: () => regexes_exports,
  registry: () => registry,
  safeDecode: () => safeDecode2,
  safeDecodeAsync: () => safeDecodeAsync2,
  safeEncode: () => safeEncode2,
  safeEncodeAsync: () => safeEncodeAsync2,
  safeParse: () => safeParse2,
  safeParseAsync: () => safeParseAsync2,
  set: () => set,
  setErrorMap: () => setErrorMap,
  size: () => _size,
  slugify: () => _slugify,
  startsWith: () => _startsWith,
  strictObject: () => strictObject,
  string: () => string2,
  stringFormat: () => stringFormat,
  stringbool: () => stringbool,
  success: () => success,
  superRefine: () => superRefine,
  symbol: () => symbol,
  templateLiteral: () => templateLiteral,
  toJSONSchema: () => toJSONSchema,
  toLowerCase: () => _toLowerCase,
  toUpperCase: () => _toUpperCase,
  transform: () => transform,
  treeifyError: () => treeifyError,
  trim: () => _trim,
  tuple: () => tuple,
  uint32: () => uint32,
  uint64: () => uint64,
  ulid: () => ulid2,
  undefined: () => _undefined3,
  union: () => union,
  unknown: () => unknown,
  uppercase: () => _uppercase,
  url: () => url,
  util: () => util_exports,
  uuid: () => uuid2,
  uuidv4: () => uuidv4,
  uuidv6: () => uuidv6,
  uuidv7: () => uuidv7,
  void: () => _void2,
  xid: () => xid2,
  xor: () => xor
});

// node_modules/zod/v4/core/index.js
var core_exports2 = {};
__export(core_exports2, {
  $ZodAny: () => $ZodAny,
  $ZodArray: () => $ZodArray,
  $ZodAsyncError: () => $ZodAsyncError,
  $ZodBase64: () => $ZodBase64,
  $ZodBase64URL: () => $ZodBase64URL,
  $ZodBigInt: () => $ZodBigInt,
  $ZodBigIntFormat: () => $ZodBigIntFormat,
  $ZodBoolean: () => $ZodBoolean,
  $ZodCIDRv4: () => $ZodCIDRv4,
  $ZodCIDRv6: () => $ZodCIDRv6,
  $ZodCUID: () => $ZodCUID,
  $ZodCUID2: () => $ZodCUID2,
  $ZodCatch: () => $ZodCatch,
  $ZodCheck: () => $ZodCheck,
  $ZodCheckBigIntFormat: () => $ZodCheckBigIntFormat,
  $ZodCheckEndsWith: () => $ZodCheckEndsWith,
  $ZodCheckGreaterThan: () => $ZodCheckGreaterThan,
  $ZodCheckIncludes: () => $ZodCheckIncludes,
  $ZodCheckLengthEquals: () => $ZodCheckLengthEquals,
  $ZodCheckLessThan: () => $ZodCheckLessThan,
  $ZodCheckLowerCase: () => $ZodCheckLowerCase,
  $ZodCheckMaxLength: () => $ZodCheckMaxLength,
  $ZodCheckMaxSize: () => $ZodCheckMaxSize,
  $ZodCheckMimeType: () => $ZodCheckMimeType,
  $ZodCheckMinLength: () => $ZodCheckMinLength,
  $ZodCheckMinSize: () => $ZodCheckMinSize,
  $ZodCheckMultipleOf: () => $ZodCheckMultipleOf,
  $ZodCheckNumberFormat: () => $ZodCheckNumberFormat,
  $ZodCheckOverwrite: () => $ZodCheckOverwrite,
  $ZodCheckProperty: () => $ZodCheckProperty,
  $ZodCheckRegex: () => $ZodCheckRegex,
  $ZodCheckSizeEquals: () => $ZodCheckSizeEquals,
  $ZodCheckStartsWith: () => $ZodCheckStartsWith,
  $ZodCheckStringFormat: () => $ZodCheckStringFormat,
  $ZodCheckUpperCase: () => $ZodCheckUpperCase,
  $ZodCodec: () => $ZodCodec,
  $ZodCustom: () => $ZodCustom,
  $ZodCustomStringFormat: () => $ZodCustomStringFormat,
  $ZodDate: () => $ZodDate,
  $ZodDefault: () => $ZodDefault,
  $ZodDiscriminatedUnion: () => $ZodDiscriminatedUnion,
  $ZodE164: () => $ZodE164,
  $ZodEmail: () => $ZodEmail,
  $ZodEmoji: () => $ZodEmoji,
  $ZodEncodeError: () => $ZodEncodeError,
  $ZodEnum: () => $ZodEnum,
  $ZodError: () => $ZodError,
  $ZodFile: () => $ZodFile,
  $ZodFunction: () => $ZodFunction,
  $ZodGUID: () => $ZodGUID,
  $ZodIPv4: () => $ZodIPv4,
  $ZodIPv6: () => $ZodIPv6,
  $ZodISODate: () => $ZodISODate,
  $ZodISODateTime: () => $ZodISODateTime,
  $ZodISODuration: () => $ZodISODuration,
  $ZodISOTime: () => $ZodISOTime,
  $ZodIntersection: () => $ZodIntersection,
  $ZodJWT: () => $ZodJWT,
  $ZodKSUID: () => $ZodKSUID,
  $ZodLazy: () => $ZodLazy,
  $ZodLiteral: () => $ZodLiteral,
  $ZodMAC: () => $ZodMAC,
  $ZodMap: () => $ZodMap,
  $ZodNaN: () => $ZodNaN,
  $ZodNanoID: () => $ZodNanoID,
  $ZodNever: () => $ZodNever,
  $ZodNonOptional: () => $ZodNonOptional,
  $ZodNull: () => $ZodNull,
  $ZodNullable: () => $ZodNullable,
  $ZodNumber: () => $ZodNumber,
  $ZodNumberFormat: () => $ZodNumberFormat,
  $ZodObject: () => $ZodObject,
  $ZodObjectJIT: () => $ZodObjectJIT,
  $ZodOptional: () => $ZodOptional,
  $ZodPipe: () => $ZodPipe,
  $ZodPrefault: () => $ZodPrefault,
  $ZodPromise: () => $ZodPromise,
  $ZodReadonly: () => $ZodReadonly,
  $ZodRealError: () => $ZodRealError,
  $ZodRecord: () => $ZodRecord,
  $ZodRegistry: () => $ZodRegistry,
  $ZodSet: () => $ZodSet,
  $ZodString: () => $ZodString,
  $ZodStringFormat: () => $ZodStringFormat,
  $ZodSuccess: () => $ZodSuccess,
  $ZodSymbol: () => $ZodSymbol,
  $ZodTemplateLiteral: () => $ZodTemplateLiteral,
  $ZodTransform: () => $ZodTransform,
  $ZodTuple: () => $ZodTuple,
  $ZodType: () => $ZodType,
  $ZodULID: () => $ZodULID,
  $ZodURL: () => $ZodURL,
  $ZodUUID: () => $ZodUUID,
  $ZodUndefined: () => $ZodUndefined,
  $ZodUnion: () => $ZodUnion,
  $ZodUnknown: () => $ZodUnknown,
  $ZodVoid: () => $ZodVoid,
  $ZodXID: () => $ZodXID,
  $ZodXor: () => $ZodXor,
  $brand: () => $brand,
  $constructor: () => $constructor,
  $input: () => $input,
  $output: () => $output,
  Doc: () => Doc,
  JSONSchema: () => json_schema_exports,
  JSONSchemaGenerator: () => JSONSchemaGenerator,
  NEVER: () => NEVER,
  TimePrecision: () => TimePrecision,
  _any: () => _any,
  _array: () => _array,
  _base64: () => _base64,
  _base64url: () => _base64url,
  _bigint: () => _bigint,
  _boolean: () => _boolean,
  _catch: () => _catch,
  _check: () => _check,
  _cidrv4: () => _cidrv4,
  _cidrv6: () => _cidrv6,
  _coercedBigint: () => _coercedBigint,
  _coercedBoolean: () => _coercedBoolean,
  _coercedDate: () => _coercedDate,
  _coercedNumber: () => _coercedNumber,
  _coercedString: () => _coercedString,
  _cuid: () => _cuid,
  _cuid2: () => _cuid2,
  _custom: () => _custom,
  _date: () => _date,
  _decode: () => _decode,
  _decodeAsync: () => _decodeAsync,
  _default: () => _default,
  _discriminatedUnion: () => _discriminatedUnion,
  _e164: () => _e164,
  _email: () => _email,
  _emoji: () => _emoji2,
  _encode: () => _encode,
  _encodeAsync: () => _encodeAsync,
  _endsWith: () => _endsWith,
  _enum: () => _enum,
  _file: () => _file,
  _float32: () => _float32,
  _float64: () => _float64,
  _gt: () => _gt,
  _gte: () => _gte,
  _guid: () => _guid,
  _includes: () => _includes,
  _int: () => _int,
  _int32: () => _int32,
  _int64: () => _int64,
  _intersection: () => _intersection,
  _ipv4: () => _ipv4,
  _ipv6: () => _ipv6,
  _isoDate: () => _isoDate,
  _isoDateTime: () => _isoDateTime,
  _isoDuration: () => _isoDuration,
  _isoTime: () => _isoTime,
  _jwt: () => _jwt,
  _ksuid: () => _ksuid,
  _lazy: () => _lazy,
  _length: () => _length,
  _literal: () => _literal,
  _lowercase: () => _lowercase,
  _lt: () => _lt,
  _lte: () => _lte,
  _mac: () => _mac,
  _map: () => _map,
  _max: () => _lte,
  _maxLength: () => _maxLength,
  _maxSize: () => _maxSize,
  _mime: () => _mime,
  _min: () => _gte,
  _minLength: () => _minLength,
  _minSize: () => _minSize,
  _multipleOf: () => _multipleOf,
  _nan: () => _nan,
  _nanoid: () => _nanoid,
  _nativeEnum: () => _nativeEnum,
  _negative: () => _negative,
  _never: () => _never,
  _nonnegative: () => _nonnegative,
  _nonoptional: () => _nonoptional,
  _nonpositive: () => _nonpositive,
  _normalize: () => _normalize,
  _null: () => _null2,
  _nullable: () => _nullable,
  _number: () => _number,
  _optional: () => _optional,
  _overwrite: () => _overwrite,
  _parse: () => _parse,
  _parseAsync: () => _parseAsync,
  _pipe: () => _pipe,
  _positive: () => _positive,
  _promise: () => _promise,
  _property: () => _property,
  _readonly: () => _readonly,
  _record: () => _record,
  _refine: () => _refine,
  _regex: () => _regex,
  _safeDecode: () => _safeDecode,
  _safeDecodeAsync: () => _safeDecodeAsync,
  _safeEncode: () => _safeEncode,
  _safeEncodeAsync: () => _safeEncodeAsync,
  _safeParse: () => _safeParse,
  _safeParseAsync: () => _safeParseAsync,
  _set: () => _set,
  _size: () => _size,
  _slugify: () => _slugify,
  _startsWith: () => _startsWith,
  _string: () => _string,
  _stringFormat: () => _stringFormat,
  _stringbool: () => _stringbool,
  _success: () => _success,
  _superRefine: () => _superRefine,
  _symbol: () => _symbol,
  _templateLiteral: () => _templateLiteral,
  _toLowerCase: () => _toLowerCase,
  _toUpperCase: () => _toUpperCase,
  _transform: () => _transform,
  _trim: () => _trim,
  _tuple: () => _tuple,
  _uint32: () => _uint32,
  _uint64: () => _uint64,
  _ulid: () => _ulid,
  _undefined: () => _undefined2,
  _union: () => _union,
  _unknown: () => _unknown,
  _uppercase: () => _uppercase,
  _url: () => _url,
  _uuid: () => _uuid,
  _uuidv4: () => _uuidv4,
  _uuidv6: () => _uuidv6,
  _uuidv7: () => _uuidv7,
  _void: () => _void,
  _xid: () => _xid,
  _xor: () => _xor,
  clone: () => clone,
  config: () => config,
  createStandardJSONSchemaMethod: () => createStandardJSONSchemaMethod,
  createToJSONSchemaMethod: () => createToJSONSchemaMethod,
  decode: () => decode,
  decodeAsync: () => decodeAsync,
  describe: () => describe,
  encode: () => encode,
  encodeAsync: () => encodeAsync,
  extractDefs: () => extractDefs,
  finalize: () => finalize,
  flattenError: () => flattenError,
  formatError: () => formatError,
  globalConfig: () => globalConfig,
  globalRegistry: () => globalRegistry,
  initializeContext: () => initializeContext,
  isValidBase64: () => isValidBase64,
  isValidBase64URL: () => isValidBase64URL,
  isValidJWT: () => isValidJWT,
  locales: () => locales_exports,
  meta: () => meta,
  parse: () => parse,
  parseAsync: () => parseAsync,
  prettifyError: () => prettifyError,
  process: () => process2,
  regexes: () => regexes_exports,
  registry: () => registry,
  safeDecode: () => safeDecode,
  safeDecodeAsync: () => safeDecodeAsync,
  safeEncode: () => safeEncode,
  safeEncodeAsync: () => safeEncodeAsync,
  safeParse: () => safeParse,
  safeParseAsync: () => safeParseAsync,
  toDotPath: () => toDotPath,
  toJSONSchema: () => toJSONSchema,
  treeifyError: () => treeifyError,
  util: () => util_exports,
  version: () => version
});

// node_modules/zod/v4/core/core.js
var NEVER = Object.freeze({
  status: "aborted"
});
// @__NO_SIDE_EFFECTS__
function $constructor(name, initializer3, params) {
  function init2(inst, def) {
    if (!inst._zod) {
      Object.defineProperty(inst, "_zod", {
        value: {
          def,
          constr: _,
          traits: /* @__PURE__ */ new Set()
        },
        enumerable: false
      });
    }
    if (inst._zod.traits.has(name)) {
      return;
    }
    inst._zod.traits.add(name);
    initializer3(inst, def);
    const proto = _.prototype;
    const keys = Object.keys(proto);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (!(k in inst)) {
        inst[k] = proto[k].bind(inst);
      }
    }
  }
  const Parent = params?.Parent ?? Object;
  class Definition extends Parent {
  }
  Object.defineProperty(Definition, "name", { value: name });
  function _(def) {
    var _a2;
    const inst = params?.Parent ? new Definition() : this;
    init2(inst, def);
    (_a2 = inst._zod).deferred ?? (_a2.deferred = []);
    for (const fn of inst._zod.deferred) {
      fn();
    }
    return inst;
  }
  Object.defineProperty(_, "init", { value: init2 });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst) => {
      if (params?.Parent && inst instanceof params.Parent)
        return true;
      return inst?._zod?.traits?.has(name);
    }
  });
  Object.defineProperty(_, "name", { value: name });
  return _;
}
var $brand = Symbol("zod_brand");
var $ZodAsyncError = class extends Error {
  constructor() {
    super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
  }
};
var $ZodEncodeError = class extends Error {
  constructor(name) {
    super(`Encountered unidirectional transform during encode: ${name}`);
    this.name = "ZodEncodeError";
  }
};
var globalConfig = {};
function config(newConfig) {
  if (newConfig)
    Object.assign(globalConfig, newConfig);
  return globalConfig;
}

// node_modules/zod/v4/core/util.js
var util_exports = {};
__export(util_exports, {
  BIGINT_FORMAT_RANGES: () => BIGINT_FORMAT_RANGES,
  Class: () => Class,
  NUMBER_FORMAT_RANGES: () => NUMBER_FORMAT_RANGES,
  aborted: () => aborted,
  allowsEval: () => allowsEval,
  assert: () => assert,
  assertEqual: () => assertEqual,
  assertIs: () => assertIs,
  assertNever: () => assertNever,
  assertNotEqual: () => assertNotEqual,
  assignProp: () => assignProp,
  base64ToUint8Array: () => base64ToUint8Array,
  base64urlToUint8Array: () => base64urlToUint8Array,
  cached: () => cached,
  captureStackTrace: () => captureStackTrace,
  cleanEnum: () => cleanEnum,
  cleanRegex: () => cleanRegex,
  clone: () => clone,
  cloneDef: () => cloneDef,
  createTransparentProxy: () => createTransparentProxy,
  defineLazy: () => defineLazy,
  esc: () => esc,
  escapeRegex: () => escapeRegex,
  extend: () => extend,
  finalizeIssue: () => finalizeIssue,
  floatSafeRemainder: () => floatSafeRemainder,
  getElementAtPath: () => getElementAtPath,
  getEnumValues: () => getEnumValues,
  getLengthableOrigin: () => getLengthableOrigin,
  getParsedType: () => getParsedType,
  getSizableOrigin: () => getSizableOrigin,
  hexToUint8Array: () => hexToUint8Array,
  isObject: () => isObject,
  isPlainObject: () => isPlainObject,
  issue: () => issue,
  joinValues: () => joinValues,
  jsonStringifyReplacer: () => jsonStringifyReplacer,
  merge: () => merge,
  mergeDefs: () => mergeDefs,
  normalizeParams: () => normalizeParams,
  nullish: () => nullish,
  numKeys: () => numKeys,
  objectClone: () => objectClone,
  omit: () => omit,
  optionalKeys: () => optionalKeys,
  partial: () => partial,
  pick: () => pick,
  prefixIssues: () => prefixIssues,
  primitiveTypes: () => primitiveTypes,
  promiseAllObject: () => promiseAllObject,
  propertyKeyTypes: () => propertyKeyTypes,
  randomString: () => randomString,
  required: () => required,
  safeExtend: () => safeExtend,
  shallowClone: () => shallowClone,
  slugify: () => slugify,
  stringifyPrimitive: () => stringifyPrimitive,
  uint8ArrayToBase64: () => uint8ArrayToBase64,
  uint8ArrayToBase64url: () => uint8ArrayToBase64url,
  uint8ArrayToHex: () => uint8ArrayToHex,
  unwrapMessage: () => unwrapMessage
});
function assertEqual(val) {
  return val;
}
function assertNotEqual(val) {
  return val;
}
function assertIs(_arg) {
}
function assertNever(_x) {
  throw new Error("Unexpected value in exhaustive check");
}
function assert(_) {
}
function getEnumValues(entries) {
  const numericValues = Object.values(entries).filter((v) => typeof v === "number");
  const values = Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
  return values;
}
function joinValues(array2, separator = "|") {
  return array2.map((val) => stringifyPrimitive(val)).join(separator);
}
function jsonStringifyReplacer(_, value) {
  if (typeof value === "bigint")
    return value.toString();
  return value;
}
function cached(getter) {
  const set2 = false;
  return {
    get value() {
      if (!set2) {
        const value = getter();
        Object.defineProperty(this, "value", { value });
        return value;
      }
      throw new Error("cached value already set");
    }
  };
}
function nullish(input) {
  return input === null || input === void 0;
}
function cleanRegex(source) {
  const start = source.startsWith("^") ? 1 : 0;
  const end = source.endsWith("$") ? source.length - 1 : source.length;
  return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepString = step.toString();
  let stepDecCount = (stepString.split(".")[1] || "").length;
  if (stepDecCount === 0 && /\d?e-\d?/.test(stepString)) {
    const match = stepString.match(/\d?e-(\d?)/);
    if (match?.[1]) {
      stepDecCount = Number.parseInt(match[1]);
    }
  }
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var EVALUATING = Symbol("evaluating");
function defineLazy(object2, key, getter) {
  let value = void 0;
  Object.defineProperty(object2, key, {
    get() {
      if (value === EVALUATING) {
        return void 0;
      }
      if (value === void 0) {
        value = EVALUATING;
        value = getter();
      }
      return value;
    },
    set(v) {
      Object.defineProperty(object2, key, {
        value: v
        // configurable: true,
      });
    },
    configurable: true
  });
}
function objectClone(obj) {
  return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
}
function assignProp(target, prop, value) {
  Object.defineProperty(target, prop, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });
}
function mergeDefs(...defs) {
  const mergedDescriptors = {};
  for (const def of defs) {
    const descriptors = Object.getOwnPropertyDescriptors(def);
    Object.assign(mergedDescriptors, descriptors);
  }
  return Object.defineProperties({}, mergedDescriptors);
}
function cloneDef(schema) {
  return mergeDefs(schema._zod.def);
}
function getElementAtPath(obj, path3) {
  if (!path3)
    return obj;
  return path3.reduce((acc, key) => acc?.[key], obj);
}
function promiseAllObject(promisesObj) {
  const keys = Object.keys(promisesObj);
  const promises = keys.map((key) => promisesObj[key]);
  return Promise.all(promises).then((results) => {
    const resolvedObj = {};
    for (let i = 0; i < keys.length; i++) {
      resolvedObj[keys[i]] = results[i];
    }
    return resolvedObj;
  });
}
function randomString(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}
function esc(str) {
  return JSON.stringify(str);
}
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {
};
function isObject(data) {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}
var allowsEval = cached(() => {
  if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
    return false;
  }
  try {
    const F = Function;
    new F("");
    return true;
  } catch (_) {
    return false;
  }
});
function isPlainObject(o) {
  if (isObject(o) === false)
    return false;
  const ctor = o.constructor;
  if (ctor === void 0)
    return true;
  if (typeof ctor !== "function")
    return true;
  const prot = ctor.prototype;
  if (isObject(prot) === false)
    return false;
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
    return false;
  }
  return true;
}
function shallowClone(o) {
  if (isPlainObject(o))
    return { ...o };
  if (Array.isArray(o))
    return [...o];
  return o;
}
function numKeys(data) {
  let keyCount = 0;
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      keyCount++;
    }
  }
  return keyCount;
}
var getParsedType = (data) => {
  const t2 = typeof data;
  switch (t2) {
    case "undefined":
      return "undefined";
    case "string":
      return "string";
    case "number":
      return Number.isNaN(data) ? "nan" : "number";
    case "boolean":
      return "boolean";
    case "function":
      return "function";
    case "bigint":
      return "bigint";
    case "symbol":
      return "symbol";
    case "object":
      if (Array.isArray(data)) {
        return "array";
      }
      if (data === null) {
        return "null";
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return "promise";
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return "map";
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return "set";
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return "date";
      }
      if (typeof File !== "undefined" && data instanceof File) {
        return "file";
      }
      return "object";
    default:
      throw new Error(`Unknown data type: ${t2}`);
  }
};
var propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
var primitiveTypes = /* @__PURE__ */ new Set(["string", "number", "bigint", "boolean", "symbol", "undefined"]);
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
  const cl = new inst._zod.constr(def ?? inst._zod.def);
  if (!def || params?.parent)
    cl._zod.parent = inst;
  return cl;
}
function normalizeParams(_params) {
  const params = _params;
  if (!params)
    return {};
  if (typeof params === "string")
    return { error: () => params };
  if (params?.message !== void 0) {
    if (params?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    params.error = params.message;
  }
  delete params.message;
  if (typeof params.error === "string")
    return { ...params, error: () => params.error };
  return params;
}
function createTransparentProxy(getter) {
  let target;
  return new Proxy({}, {
    get(_, prop, receiver) {
      target ?? (target = getter());
      return Reflect.get(target, prop, receiver);
    },
    set(_, prop, value, receiver) {
      target ?? (target = getter());
      return Reflect.set(target, prop, value, receiver);
    },
    has(_, prop) {
      target ?? (target = getter());
      return Reflect.has(target, prop);
    },
    deleteProperty(_, prop) {
      target ?? (target = getter());
      return Reflect.deleteProperty(target, prop);
    },
    ownKeys(_) {
      target ?? (target = getter());
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(_, prop) {
      target ?? (target = getter());
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
    defineProperty(_, prop, descriptor) {
      target ?? (target = getter());
      return Reflect.defineProperty(target, prop, descriptor);
    }
  });
}
function stringifyPrimitive(value) {
  if (typeof value === "bigint")
    return value.toString() + "n";
  if (typeof value === "string")
    return `"${value}"`;
  return `${value}`;
}
function optionalKeys(shape) {
  return Object.keys(shape).filter((k) => {
    return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
  });
}
var NUMBER_FORMAT_RANGES = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
var BIGINT_FORMAT_RANGES = {
  int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
  uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
};
function pick(schema, mask) {
  const currDef = schema._zod.def;
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = {};
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        newShape[key] = currDef.shape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function omit(schema, mask) {
  const currDef = schema._zod.def;
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = { ...schema._zod.def.shape };
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        delete newShape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function extend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to extend: expected a plain object");
  }
  const checks = schema._zod.def.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error("Object schemas containing refinements cannot be extended. Use `.safeExtend()` instead.");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    },
    checks: []
  });
  return clone(schema, def);
}
function safeExtend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to safeExtend: expected a plain object");
  }
  const def = {
    ...schema._zod.def,
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    },
    checks: schema._zod.def.checks
  };
  return clone(schema, def);
}
function merge(a, b) {
  const def = mergeDefs(a._zod.def, {
    get shape() {
      const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
      assignProp(this, "shape", _shape);
      return _shape;
    },
    get catchall() {
      return b._zod.def.catchall;
    },
    checks: []
    // delete existing checks
  });
  return clone(a, def);
}
function partial(Class2, schema, mask) {
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in oldShape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = Class2 ? new Class2({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      } else {
        for (const key in oldShape) {
          shape[key] = Class2 ? new Class2({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    },
    checks: []
  });
  return clone(schema, def);
}
function required(Class2, schema, mask) {
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in shape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = new Class2({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      } else {
        for (const key in oldShape) {
          shape[key] = new Class2({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    },
    checks: []
  });
  return clone(schema, def);
}
function aborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex; i < x.issues.length; i++) {
    if (x.issues[i]?.continue !== true) {
      return true;
    }
  }
  return false;
}
function prefixIssues(path3, issues) {
  return issues.map((iss) => {
    var _a2;
    (_a2 = iss).path ?? (_a2.path = []);
    iss.path.unshift(path3);
    return iss;
  });
}
function unwrapMessage(message) {
  return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config2) {
  const full = { ...iss, path: iss.path ?? [] };
  if (!iss.message) {
    const message = unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config2.customError?.(iss)) ?? unwrapMessage(config2.localeError?.(iss)) ?? "Invalid input";
    full.message = message;
  }
  delete full.inst;
  delete full.continue;
  if (!ctx?.reportInput) {
    delete full.input;
  }
  return full;
}
function getSizableOrigin(input) {
  if (input instanceof Set)
    return "set";
  if (input instanceof Map)
    return "map";
  if (input instanceof File)
    return "file";
  return "unknown";
}
function getLengthableOrigin(input) {
  if (Array.isArray(input))
    return "array";
  if (typeof input === "string")
    return "string";
  return "unknown";
}
function issue(...args) {
  const [iss, input, inst] = args;
  if (typeof iss === "string") {
    return {
      message: iss,
      code: "custom",
      input,
      inst
    };
  }
  return { ...iss };
}
function cleanEnum(obj) {
  return Object.entries(obj).filter(([k, _]) => {
    return Number.isNaN(Number.parseInt(k, 10));
  }).map((el) => el[1]);
}
function base64ToUint8Array(base643) {
  const binaryString = atob(base643);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
function uint8ArrayToBase64(bytes) {
  let binaryString = "";
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
}
function base64urlToUint8Array(base64url3) {
  const base643 = base64url3.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - base643.length % 4) % 4);
  return base64ToUint8Array(base643 + padding);
}
function uint8ArrayToBase64url(bytes) {
  return uint8ArrayToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function hexToUint8Array(hex3) {
  const cleanHex = hex3.replace(/^0x/, "");
  if (cleanHex.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16);
  }
  return bytes;
}
function uint8ArrayToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
var Class = class {
  constructor(..._args) {
  }
};

// node_modules/zod/v4/core/errors.js
var initializer = (inst, def) => {
  inst.name = "$ZodError";
  Object.defineProperty(inst, "_zod", {
    value: inst._zod,
    enumerable: false
  });
  Object.defineProperty(inst, "issues", {
    value: def,
    enumerable: false
  });
  inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
  Object.defineProperty(inst, "toString", {
    value: () => inst.message,
    enumerable: false
  });
};
var $ZodError = $constructor("$ZodError", initializer);
var $ZodRealError = $constructor("$ZodError", initializer, { Parent: Error });
function flattenError(error46, mapper = (issue2) => issue2.message) {
  const fieldErrors = {};
  const formErrors = [];
  for (const sub of error46.issues) {
    if (sub.path.length > 0) {
      fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
      fieldErrors[sub.path[0]].push(mapper(sub));
    } else {
      formErrors.push(mapper(sub));
    }
  }
  return { formErrors, fieldErrors };
}
function formatError(error46, mapper = (issue2) => issue2.message) {
  const fieldErrors = { _errors: [] };
  const processError = (error47) => {
    for (const issue2 of error47.issues) {
      if (issue2.code === "invalid_union" && issue2.errors.length) {
        issue2.errors.map((issues) => processError({ issues }));
      } else if (issue2.code === "invalid_key") {
        processError({ issues: issue2.issues });
      } else if (issue2.code === "invalid_element") {
        processError({ issues: issue2.issues });
      } else if (issue2.path.length === 0) {
        fieldErrors._errors.push(mapper(issue2));
      } else {
        let curr = fieldErrors;
        let i = 0;
        while (i < issue2.path.length) {
          const el = issue2.path[i];
          const terminal = i === issue2.path.length - 1;
          if (!terminal) {
            curr[el] = curr[el] || { _errors: [] };
          } else {
            curr[el] = curr[el] || { _errors: [] };
            curr[el]._errors.push(mapper(issue2));
          }
          curr = curr[el];
          i++;
        }
      }
    }
  };
  processError(error46);
  return fieldErrors;
}
function treeifyError(error46, mapper = (issue2) => issue2.message) {
  const result = { errors: [] };
  const processError = (error47, path3 = []) => {
    var _a2, _b;
    for (const issue2 of error47.issues) {
      if (issue2.code === "invalid_union" && issue2.errors.length) {
        issue2.errors.map((issues) => processError({ issues }, issue2.path));
      } else if (issue2.code === "invalid_key") {
        processError({ issues: issue2.issues }, issue2.path);
      } else if (issue2.code === "invalid_element") {
        processError({ issues: issue2.issues }, issue2.path);
      } else {
        const fullpath = [...path3, ...issue2.path];
        if (fullpath.length === 0) {
          result.errors.push(mapper(issue2));
          continue;
        }
        let curr = result;
        let i = 0;
        while (i < fullpath.length) {
          const el = fullpath[i];
          const terminal = i === fullpath.length - 1;
          if (typeof el === "string") {
            curr.properties ?? (curr.properties = {});
            (_a2 = curr.properties)[el] ?? (_a2[el] = { errors: [] });
            curr = curr.properties[el];
          } else {
            curr.items ?? (curr.items = []);
            (_b = curr.items)[el] ?? (_b[el] = { errors: [] });
            curr = curr.items[el];
          }
          if (terminal) {
            curr.errors.push(mapper(issue2));
          }
          i++;
        }
      }
    }
  };
  processError(error46);
  return result;
}
function toDotPath(_path) {
  const segs = [];
  const path3 = _path.map((seg) => typeof seg === "object" ? seg.key : seg);
  for (const seg of path3) {
    if (typeof seg === "number")
      segs.push(`[${seg}]`);
    else if (typeof seg === "symbol")
      segs.push(`[${JSON.stringify(String(seg))}]`);
    else if (/[^\w$]/.test(seg))
      segs.push(`[${JSON.stringify(seg)}]`);
    else {
      if (segs.length)
        segs.push(".");
      segs.push(seg);
    }
  }
  return segs.join("");
}
function prettifyError(error46) {
  const lines = [];
  const issues = [...error46.issues].sort((a, b) => (a.path ?? []).length - (b.path ?? []).length);
  for (const issue2 of issues) {
    lines.push(`\u2716 ${issue2.message}`);
    if (issue2.path?.length)
      lines.push(`  \u2192 at ${toDotPath(issue2.path)}`);
  }
  return lines.join("\n");
}

// node_modules/zod/v4/core/parse.js
var _parse = (_Err) => (schema, value, _ctx, _params) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: false }) : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError();
  }
  if (result.issues.length) {
    const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, _params?.callee);
    throw e;
  }
  return result.value;
};
var parse = /* @__PURE__ */ _parse($ZodRealError);
var _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  if (result.issues.length) {
    const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, params?.callee);
    throw e;
  }
  return result.value;
};
var parseAsync = /* @__PURE__ */ _parseAsync($ZodRealError);
var _safeParse = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError();
  }
  return result.issues.length ? {
    success: false,
    error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
var safeParse = /* @__PURE__ */ _safeParse($ZodRealError);
var _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  return result.issues.length ? {
    success: false,
    error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
var safeParseAsync = /* @__PURE__ */ _safeParseAsync($ZodRealError);
var _encode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _parse(_Err)(schema, value, ctx);
};
var encode = /* @__PURE__ */ _encode($ZodRealError);
var _decode = (_Err) => (schema, value, _ctx) => {
  return _parse(_Err)(schema, value, _ctx);
};
var decode = /* @__PURE__ */ _decode($ZodRealError);
var _encodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _parseAsync(_Err)(schema, value, ctx);
};
var encodeAsync = /* @__PURE__ */ _encodeAsync($ZodRealError);
var _decodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _parseAsync(_Err)(schema, value, _ctx);
};
var decodeAsync = /* @__PURE__ */ _decodeAsync($ZodRealError);
var _safeEncode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _safeParse(_Err)(schema, value, ctx);
};
var safeEncode = /* @__PURE__ */ _safeEncode($ZodRealError);
var _safeDecode = (_Err) => (schema, value, _ctx) => {
  return _safeParse(_Err)(schema, value, _ctx);
};
var safeDecode = /* @__PURE__ */ _safeDecode($ZodRealError);
var _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { direction: "backward" }) : { direction: "backward" };
  return _safeParseAsync(_Err)(schema, value, ctx);
};
var safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync($ZodRealError);
var _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _safeParseAsync(_Err)(schema, value, _ctx);
};
var safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync($ZodRealError);

// node_modules/zod/v4/core/regexes.js
var regexes_exports = {};
__export(regexes_exports, {
  base64: () => base64,
  base64url: () => base64url,
  bigint: () => bigint,
  boolean: () => boolean9,
  browserEmail: () => browserEmail,
  cidrv4: () => cidrv4,
  cidrv6: () => cidrv6,
  cuid: () => cuid,
  cuid2: () => cuid2,
  date: () => date,
  datetime: () => datetime,
  domain: () => domain,
  duration: () => duration,
  e164: () => e164,
  email: () => email,
  emoji: () => emoji,
  extendedDuration: () => extendedDuration,
  guid: () => guid,
  hex: () => hex,
  hostname: () => hostname,
  html5Email: () => html5Email,
  idnEmail: () => idnEmail,
  integer: () => integer,
  ipv4: () => ipv4,
  ipv6: () => ipv6,
  ksuid: () => ksuid,
  lowercase: () => lowercase,
  mac: () => mac,
  md5_base64: () => md5_base64,
  md5_base64url: () => md5_base64url,
  md5_hex: () => md5_hex,
  nanoid: () => nanoid,
  null: () => _null,
  number: () => number,
  rfc5322Email: () => rfc5322Email,
  sha1_base64: () => sha1_base64,
  sha1_base64url: () => sha1_base64url,
  sha1_hex: () => sha1_hex,
  sha256_base64: () => sha256_base64,
  sha256_base64url: () => sha256_base64url,
  sha256_hex: () => sha256_hex,
  sha384_base64: () => sha384_base64,
  sha384_base64url: () => sha384_base64url,
  sha384_hex: () => sha384_hex,
  sha512_base64: () => sha512_base64,
  sha512_base64url: () => sha512_base64url,
  sha512_hex: () => sha512_hex,
  string: () => string,
  time: () => time,
  ulid: () => ulid,
  undefined: () => _undefined,
  unicodeEmail: () => unicodeEmail,
  uppercase: () => uppercase,
  uuid: () => uuid,
  uuid4: () => uuid4,
  uuid6: () => uuid6,
  uuid7: () => uuid7,
  xid: () => xid
});
var cuid = /^[cC][^\s-]{8,}$/;
var cuid2 = /^[0-9a-z]+$/;
var ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
var xid = /^[0-9a-vA-V]{20}$/;
var ksuid = /^[A-Za-z0-9]{27}$/;
var nanoid = /^[a-zA-Z0-9_-]{21}$/;
var duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
var extendedDuration = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
var uuid = (version2) => {
  if (!version2)
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
  return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version2}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
var uuid4 = /* @__PURE__ */ uuid(4);
var uuid6 = /* @__PURE__ */ uuid(6);
var uuid7 = /* @__PURE__ */ uuid(7);
var email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
var html5Email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
var rfc5322Email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var unicodeEmail = /^[^\s@"]{1,64}@[^\s@]{1,255}$/u;
var idnEmail = unicodeEmail;
var browserEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
var _emoji = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
function emoji() {
  return new RegExp(_emoji, "u");
}
var ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
var mac = (delimiter) => {
  const escapedDelim = escapeRegex(delimiter ?? ":");
  return new RegExp(`^(?:[0-9A-F]{2}${escapedDelim}){5}[0-9A-F]{2}$|^(?:[0-9a-f]{2}${escapedDelim}){5}[0-9a-f]{2}$`);
};
var cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
var cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
var base64url = /^[A-Za-z0-9_-]*$/;
var hostname = /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/;
var domain = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
var e164 = /^\+(?:[0-9]){6,14}[0-9]$/;
var dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
var date = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
function timeSource(args) {
  const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
  const regex = typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
  return regex;
}
function time(args) {
  return new RegExp(`^${timeSource(args)}$`);
}
function datetime(args) {
  const time3 = timeSource({ precision: args.precision });
  const opts = ["Z"];
  if (args.local)
    opts.push("");
  if (args.offset)
    opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
  const timeRegex = `${time3}(?:${opts.join("|")})`;
  return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
var string = (params) => {
  const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
  return new RegExp(`^${regex}$`);
};
var bigint = /^-?\d+n?$/;
var integer = /^-?\d+$/;
var number = /^-?\d+(?:\.\d+)?/;
var boolean9 = /^(?:true|false)$/i;
var _null = /^null$/i;
var _undefined = /^undefined$/i;
var lowercase = /^[^A-Z]*$/;
var uppercase = /^[^a-z]*$/;
var hex = /^[0-9a-fA-F]*$/;
function fixedBase64(bodyLength, padding) {
  return new RegExp(`^[A-Za-z0-9+/]{${bodyLength}}${padding}$`);
}
function fixedBase64url(length) {
  return new RegExp(`^[A-Za-z0-9_-]{${length}}$`);
}
var md5_hex = /^[0-9a-fA-F]{32}$/;
var md5_base64 = /* @__PURE__ */ fixedBase64(22, "==");
var md5_base64url = /* @__PURE__ */ fixedBase64url(22);
var sha1_hex = /^[0-9a-fA-F]{40}$/;
var sha1_base64 = /* @__PURE__ */ fixedBase64(27, "=");
var sha1_base64url = /* @__PURE__ */ fixedBase64url(27);
var sha256_hex = /^[0-9a-fA-F]{64}$/;
var sha256_base64 = /* @__PURE__ */ fixedBase64(43, "=");
var sha256_base64url = /* @__PURE__ */ fixedBase64url(43);
var sha384_hex = /^[0-9a-fA-F]{96}$/;
var sha384_base64 = /* @__PURE__ */ fixedBase64(64, "");
var sha384_base64url = /* @__PURE__ */ fixedBase64url(64);
var sha512_hex = /^[0-9a-fA-F]{128}$/;
var sha512_base64 = /* @__PURE__ */ fixedBase64(86, "==");
var sha512_base64url = /* @__PURE__ */ fixedBase64url(86);

// node_modules/zod/v4/core/checks.js
var $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
  var _a2;
  inst._zod ?? (inst._zod = {});
  inst._zod.def = def;
  (_a2 = inst._zod).onattach ?? (_a2.onattach = []);
});
var numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date"
};
var $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    if (def.value < curr) {
      if (def.inclusive)
        bag.maximum = def.value;
      else
        bag.exclusiveMaximum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
      return;
    }
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    if (def.value > curr) {
      if (def.inclusive)
        bag.minimum = def.value;
      else
        bag.exclusiveMinimum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
      return;
    }
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst2) => {
    var _a2;
    (_a2 = inst2._zod.bag).multipleOf ?? (_a2.multipleOf = def.value);
  });
  inst._zod.check = (payload) => {
    if (typeof payload.value !== typeof def.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    const isMultiple = typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0;
    if (isMultiple)
      return;
    payload.issues.push({
      origin: typeof payload.value,
      code: "not_multiple_of",
      divisor: def.value,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
  $ZodCheck.init(inst, def);
  def.format = def.format || "float64";
  const isInt = def.format?.includes("int");
  const origin = isInt ? "int" : "number";
  const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.format = def.format;
    bag.minimum = minimum;
    bag.maximum = maximum;
    if (isInt)
      bag.pattern = integer;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    if (isInt) {
      if (!Number.isInteger(input)) {
        payload.issues.push({
          expected: origin,
          format: def.format,
          code: "invalid_type",
          continue: false,
          input,
          inst
        });
        return;
      }
      if (!Number.isSafeInteger(input)) {
        if (input > 0) {
          payload.issues.push({
            input,
            code: "too_big",
            maximum: Number.MAX_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            continue: !def.abort
          });
        } else {
          payload.issues.push({
            input,
            code: "too_small",
            minimum: Number.MIN_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            continue: !def.abort
          });
        }
        return;
      }
    }
    if (input < minimum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_small",
        minimum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
    if (input > maximum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_big",
        maximum,
        inst
      });
    }
  };
});
var $ZodCheckBigIntFormat = /* @__PURE__ */ $constructor("$ZodCheckBigIntFormat", (inst, def) => {
  $ZodCheck.init(inst, def);
  const [minimum, maximum] = BIGINT_FORMAT_RANGES[def.format];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.format = def.format;
    bag.minimum = minimum;
    bag.maximum = maximum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    if (input < minimum) {
      payload.issues.push({
        origin: "bigint",
        input,
        code: "too_small",
        minimum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
    if (input > maximum) {
      payload.issues.push({
        origin: "bigint",
        input,
        code: "too_big",
        maximum,
        inst
      });
    }
  };
});
var $ZodCheckMaxSize = /* @__PURE__ */ $constructor("$ZodCheckMaxSize", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.size !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    if (def.maximum < curr)
      inst2._zod.bag.maximum = def.maximum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const size = input.size;
    if (size <= def.maximum)
      return;
    payload.issues.push({
      origin: getSizableOrigin(input),
      code: "too_big",
      maximum: def.maximum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMinSize = /* @__PURE__ */ $constructor("$ZodCheckMinSize", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.size !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    if (def.minimum > curr)
      inst2._zod.bag.minimum = def.minimum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const size = input.size;
    if (size >= def.minimum)
      return;
    payload.issues.push({
      origin: getSizableOrigin(input),
      code: "too_small",
      minimum: def.minimum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckSizeEquals = /* @__PURE__ */ $constructor("$ZodCheckSizeEquals", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.size !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.minimum = def.size;
    bag.maximum = def.size;
    bag.size = def.size;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const size = input.size;
    if (size === def.size)
      return;
    const tooBig = size > def.size;
    payload.issues.push({
      origin: getSizableOrigin(input),
      ...tooBig ? { code: "too_big", maximum: def.size } : { code: "too_small", minimum: def.size },
      inclusive: true,
      exact: true,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    if (def.maximum < curr)
      inst2._zod.bag.maximum = def.maximum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length <= def.maximum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: def.maximum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    if (def.minimum > curr)
      inst2._zod.bag.minimum = def.minimum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length >= def.minimum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: def.minimum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== void 0;
  });
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.minimum = def.length;
    bag.maximum = def.length;
    bag.length = def.length;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length === def.length)
      return;
    const origin = getLengthableOrigin(input);
    const tooBig = length > def.length;
    payload.issues.push({
      origin,
      ...tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length },
      inclusive: true,
      exact: true,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
  var _a2, _b;
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.format = def.format;
    if (def.pattern) {
      bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
      bag.patterns.add(def.pattern);
    }
  });
  if (def.pattern)
    (_a2 = inst._zod).check ?? (_a2.check = (payload) => {
      def.pattern.lastIndex = 0;
      if (def.pattern.test(payload.value))
        return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: def.format,
        input: payload.value,
        ...def.pattern ? { pattern: def.pattern.toString() } : {},
        inst,
        continue: !def.abort
      });
    });
  else
    (_b = inst._zod).check ?? (_b.check = () => {
    });
});
var $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    def.pattern.lastIndex = 0;
    if (def.pattern.test(payload.value))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: payload.value,
      pattern: def.pattern.toString(),
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
  def.pattern ?? (def.pattern = lowercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
  def.pattern ?? (def.pattern = uppercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
  $ZodCheck.init(inst, def);
  const escapedRegex = escapeRegex(def.includes);
  const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
  def.pattern = pattern;
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.includes(def.includes, def.position))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: def.includes,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.startsWith(def.prefix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: def.prefix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.endsWith(def.suffix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: def.suffix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
function handleCheckPropertyResult(result, payload, property) {
  if (result.issues.length) {
    payload.issues.push(...prefixIssues(property, result.issues));
  }
}
var $ZodCheckProperty = /* @__PURE__ */ $constructor("$ZodCheckProperty", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.check = (payload) => {
    const result = def.schema._zod.run({
      value: payload.value[def.property],
      issues: []
    }, {});
    if (result instanceof Promise) {
      return result.then((result2) => handleCheckPropertyResult(result2, payload, def.property));
    }
    handleCheckPropertyResult(result, payload, def.property);
    return;
  };
});
var $ZodCheckMimeType = /* @__PURE__ */ $constructor("$ZodCheckMimeType", (inst, def) => {
  $ZodCheck.init(inst, def);
  const mimeSet = new Set(def.mime);
  inst._zod.onattach.push((inst2) => {
    inst2._zod.bag.mime = def.mime;
  });
  inst._zod.check = (payload) => {
    if (mimeSet.has(payload.value.type))
      return;
    payload.issues.push({
      code: "invalid_value",
      values: def.mime,
      input: payload.value.type,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.check = (payload) => {
    payload.value = def.tx(payload.value);
  };
});

// node_modules/zod/v4/core/doc.js
var Doc = class {
  constructor(args = []) {
    this.content = [];
    this.indent = 0;
    if (this)
      this.args = args;
  }
  indented(fn) {
    this.indent += 1;
    fn(this);
    this.indent -= 1;
  }
  write(arg) {
    if (typeof arg === "function") {
      arg(this, { execution: "sync" });
      arg(this, { execution: "async" });
      return;
    }
    const content = arg;
    const lines = content.split("\n").filter((x) => x);
    const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
    const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
    for (const line of dedented) {
      this.content.push(line);
    }
  }
  compile() {
    const F = Function;
    const args = this?.args;
    const content = this?.content ?? [``];
    const lines = [...content.map((x) => `  ${x}`)];
    return new F(...args, lines.join("\n"));
  }
};

// node_modules/zod/v4/core/versions.js
var version = {
  major: 4,
  minor: 2,
  patch: 1
};

// node_modules/zod/v4/core/schemas.js
var $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
  var _a2;
  inst ?? (inst = {});
  inst._zod.def = def;
  inst._zod.bag = inst._zod.bag || {};
  inst._zod.version = version;
  const checks = [...inst._zod.def.checks ?? []];
  if (inst._zod.traits.has("$ZodCheck")) {
    checks.unshift(inst);
  }
  for (const ch of checks) {
    for (const fn of ch._zod.onattach) {
      fn(inst);
    }
  }
  if (checks.length === 0) {
    (_a2 = inst._zod).deferred ?? (_a2.deferred = []);
    inst._zod.deferred?.push(() => {
      inst._zod.run = inst._zod.parse;
    });
  } else {
    const runChecks = (payload, checks2, ctx) => {
      let isAborted = aborted(payload);
      let asyncResult;
      for (const ch of checks2) {
        if (ch._zod.def.when) {
          const shouldRun = ch._zod.def.when(payload);
          if (!shouldRun)
            continue;
        } else if (isAborted) {
          continue;
        }
        const currLen = payload.issues.length;
        const _ = ch._zod.check(payload);
        if (_ instanceof Promise && ctx?.async === false) {
          throw new $ZodAsyncError();
        }
        if (asyncResult || _ instanceof Promise) {
          asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
            await _;
            const nextLen = payload.issues.length;
            if (nextLen === currLen)
              return;
            if (!isAborted)
              isAborted = aborted(payload, currLen);
          });
        } else {
          const nextLen = payload.issues.length;
          if (nextLen === currLen)
            continue;
          if (!isAborted)
            isAborted = aborted(payload, currLen);
        }
      }
      if (asyncResult) {
        return asyncResult.then(() => {
          return payload;
        });
      }
      return payload;
    };
    const handleCanaryResult = (canary, payload, ctx) => {
      if (aborted(canary)) {
        canary.aborted = true;
        return canary;
      }
      const checkResult = runChecks(payload, checks, ctx);
      if (checkResult instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError();
        return checkResult.then((checkResult2) => inst._zod.parse(checkResult2, ctx));
      }
      return inst._zod.parse(checkResult, ctx);
    };
    inst._zod.run = (payload, ctx) => {
      if (ctx.skipChecks) {
        return inst._zod.parse(payload, ctx);
      }
      if (ctx.direction === "backward") {
        const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
        if (canary instanceof Promise) {
          return canary.then((canary2) => {
            return handleCanaryResult(canary2, payload, ctx);
          });
        }
        return handleCanaryResult(canary, payload, ctx);
      }
      const result = inst._zod.parse(payload, ctx);
      if (result instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError();
        return result.then((result2) => runChecks(result2, checks, ctx));
      }
      return runChecks(result, checks, ctx);
    };
  }
  inst["~standard"] = {
    validate: (value) => {
      try {
        const r = safeParse(inst, value);
        return r.success ? { value: r.data } : { issues: r.error?.issues };
      } catch (_) {
        return safeParseAsync(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
      }
    },
    vendor: "zod",
    version: 1
  };
});
var $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string(inst._zod.bag);
  inst._zod.parse = (payload, _) => {
    if (def.coerce)
      try {
        payload.value = String(payload.value);
      } catch (_2) {
      }
    if (typeof payload.value === "string")
      return payload;
    payload.issues.push({
      expected: "string",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
var $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  $ZodString.init(inst, def);
});
var $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
  def.pattern ?? (def.pattern = guid);
  $ZodStringFormat.init(inst, def);
});
var $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
  if (def.version) {
    const versionMap = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    };
    const v = versionMap[def.version];
    if (v === void 0)
      throw new Error(`Invalid UUID version: "${def.version}"`);
    def.pattern ?? (def.pattern = uuid(v));
  } else
    def.pattern ?? (def.pattern = uuid());
  $ZodStringFormat.init(inst, def);
});
var $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
  def.pattern ?? (def.pattern = email);
  $ZodStringFormat.init(inst, def);
});
var $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    try {
      const trimmed = payload.value.trim();
      const url2 = new URL(trimmed);
      if (def.hostname) {
        def.hostname.lastIndex = 0;
        if (!def.hostname.test(url2.hostname)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid hostname",
            pattern: def.hostname.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.protocol) {
        def.protocol.lastIndex = 0;
        if (!def.protocol.test(url2.protocol.endsWith(":") ? url2.protocol.slice(0, -1) : url2.protocol)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid protocol",
            pattern: def.protocol.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.normalize) {
        payload.value = url2.href;
      } else {
        payload.value = trimmed;
      }
      return;
    } catch (_) {
      payload.issues.push({
        code: "invalid_format",
        format: "url",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
  def.pattern ?? (def.pattern = emoji());
  $ZodStringFormat.init(inst, def);
});
var $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
  def.pattern ?? (def.pattern = nanoid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
  def.pattern ?? (def.pattern = cuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
  def.pattern ?? (def.pattern = cuid2);
  $ZodStringFormat.init(inst, def);
});
var $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
  def.pattern ?? (def.pattern = ulid);
  $ZodStringFormat.init(inst, def);
});
var $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
  def.pattern ?? (def.pattern = xid);
  $ZodStringFormat.init(inst, def);
});
var $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
  def.pattern ?? (def.pattern = ksuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
  def.pattern ?? (def.pattern = datetime(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
  def.pattern ?? (def.pattern = date);
  $ZodStringFormat.init(inst, def);
});
var $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
  def.pattern ?? (def.pattern = time(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
  def.pattern ?? (def.pattern = duration);
  $ZodStringFormat.init(inst, def);
});
var $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
  def.pattern ?? (def.pattern = ipv4);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv4`;
});
var $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
  def.pattern ?? (def.pattern = ipv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv6`;
  inst._zod.check = (payload) => {
    try {
      new URL(`http://[${payload.value}]`);
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodMAC = /* @__PURE__ */ $constructor("$ZodMAC", (inst, def) => {
  def.pattern ?? (def.pattern = mac(def.delimiter));
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `mac`;
});
var $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv4);
  $ZodStringFormat.init(inst, def);
});
var $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    const parts = payload.value.split("/");
    try {
      if (parts.length !== 2)
        throw new Error();
      const [address, prefix] = parts;
      if (!prefix)
        throw new Error();
      const prefixNum = Number(prefix);
      if (`${prefixNum}` !== prefix)
        throw new Error();
      if (prefixNum < 0 || prefixNum > 128)
        throw new Error();
      new URL(`http://[${address}]`);
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
function isValidBase64(data) {
  if (data === "")
    return true;
  if (data.length % 4 !== 0)
    return false;
  try {
    atob(data);
    return true;
  } catch {
    return false;
  }
}
var $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
  def.pattern ?? (def.pattern = base64);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64";
  inst._zod.check = (payload) => {
    if (isValidBase64(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
function isValidBase64URL(data) {
  if (!base64url.test(data))
    return false;
  const base643 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
  const padded = base643.padEnd(Math.ceil(base643.length / 4) * 4, "=");
  return isValidBase64(padded);
}
var $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
  def.pattern ?? (def.pattern = base64url);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64url";
  inst._zod.check = (payload) => {
    if (isValidBase64URL(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
  def.pattern ?? (def.pattern = e164);
  $ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3)
      return false;
    const [header] = tokensParts;
    if (!header)
      return false;
    const parsedHeader = JSON.parse(atob(header));
    if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
      return false;
    if (!parsedHeader.alg)
      return false;
    if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
      return false;
    return true;
  } catch {
    return false;
  }
}
var $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (isValidJWT(payload.value, def.alg))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCustomStringFormat = /* @__PURE__ */ $constructor("$ZodCustomStringFormat", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (def.fn(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: def.format,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = inst._zod.bag.pattern ?? number;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Number(payload.value);
      } catch (_) {
      }
    const input = payload.value;
    if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
      return payload;
    }
    const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
    payload.issues.push({
      expected: "number",
      code: "invalid_type",
      input,
      inst,
      ...received ? { received } : {}
    });
    return payload;
  };
});
var $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumberFormat", (inst, def) => {
  $ZodCheckNumberFormat.init(inst, def);
  $ZodNumber.init(inst, def);
});
var $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = boolean9;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Boolean(payload.value);
      } catch (_) {
      }
    const input = payload.value;
    if (typeof input === "boolean")
      return payload;
    payload.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodBigInt = /* @__PURE__ */ $constructor("$ZodBigInt", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = bigint;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = BigInt(payload.value);
      } catch (_) {
      }
    if (typeof payload.value === "bigint")
      return payload;
    payload.issues.push({
      expected: "bigint",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
var $ZodBigIntFormat = /* @__PURE__ */ $constructor("$ZodBigIntFormat", (inst, def) => {
  $ZodCheckBigIntFormat.init(inst, def);
  $ZodBigInt.init(inst, def);
});
var $ZodSymbol = /* @__PURE__ */ $constructor("$ZodSymbol", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (typeof input === "symbol")
      return payload;
    payload.issues.push({
      expected: "symbol",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodUndefined = /* @__PURE__ */ $constructor("$ZodUndefined", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = _undefined;
  inst._zod.values = /* @__PURE__ */ new Set([void 0]);
  inst._zod.optin = "optional";
  inst._zod.optout = "optional";
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (typeof input === "undefined")
      return payload;
    payload.issues.push({
      expected: "undefined",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodNull = /* @__PURE__ */ $constructor("$ZodNull", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = _null;
  inst._zod.values = /* @__PURE__ */ new Set([null]);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (input === null)
      return payload;
    payload.issues.push({
      expected: "null",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodAny = /* @__PURE__ */ $constructor("$ZodAny", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload) => payload;
});
var $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload) => payload;
});
var $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    payload.issues.push({
      expected: "never",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
var $ZodVoid = /* @__PURE__ */ $constructor("$ZodVoid", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (typeof input === "undefined")
      return payload;
    payload.issues.push({
      expected: "void",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodDate = /* @__PURE__ */ $constructor("$ZodDate", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce) {
      try {
        payload.value = new Date(payload.value);
      } catch (_err) {
      }
    }
    const input = payload.value;
    const isDate = input instanceof Date;
    const isValidDate = isDate && !Number.isNaN(input.getTime());
    if (isValidDate)
      return payload;
    payload.issues.push({
      expected: "date",
      code: "invalid_type",
      input,
      ...isDate ? { received: "Invalid Date" } : {},
      inst
    });
    return payload;
  };
});
function handleArrayResult(result, final, index2) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index2, result.issues));
  }
  final.value[index2] = result.value;
}
var $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        expected: "array",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = Array(input.length);
    const proms = [];
    for (let i = 0; i < input.length; i++) {
      const item = input[i];
      const result = def.element._zod.run({
        value: item,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result2) => handleArrayResult(result2, payload, i)));
      } else {
        handleArrayResult(result, payload, i);
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
function handlePropertyResult(result, final, key, input) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(key, result.issues));
  }
  if (result.value === void 0) {
    if (key in input) {
      final.value[key] = void 0;
    }
  } else {
    final.value[key] = result.value;
  }
}
function normalizeDef(def) {
  const keys = Object.keys(def.shape);
  for (const k of keys) {
    if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
      throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
    }
  }
  const okeys = optionalKeys(def.shape);
  return {
    ...def,
    keys,
    keySet: new Set(keys),
    numKeys: keys.length,
    optionalKeys: new Set(okeys)
  };
}
function handleCatchall(proms, input, payload, ctx, def, inst) {
  const unrecognized = [];
  const keySet = def.keySet;
  const _catchall = def.catchall._zod;
  const t2 = _catchall.def.type;
  for (const key in input) {
    if (keySet.has(key))
      continue;
    if (t2 === "never") {
      unrecognized.push(key);
      continue;
    }
    const r = _catchall.run({ value: input[key], issues: [] }, ctx);
    if (r instanceof Promise) {
      proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input)));
    } else {
      handlePropertyResult(r, payload, key, input);
    }
  }
  if (unrecognized.length) {
    payload.issues.push({
      code: "unrecognized_keys",
      keys: unrecognized,
      input,
      inst
    });
  }
  if (!proms.length)
    return payload;
  return Promise.all(proms).then(() => {
    return payload;
  });
}
var $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
  $ZodType.init(inst, def);
  const desc6 = Object.getOwnPropertyDescriptor(def, "shape");
  if (!desc6?.get) {
    const sh = def.shape;
    Object.defineProperty(def, "shape", {
      get: () => {
        const newSh = { ...sh };
        Object.defineProperty(def, "shape", {
          value: newSh
        });
        return newSh;
      }
    });
  }
  const _normalized = cached(() => normalizeDef(def));
  defineLazy(inst._zod, "propValues", () => {
    const shape = def.shape;
    const propValues = {};
    for (const key in shape) {
      const field = shape[key]._zod;
      if (field.values) {
        propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
        for (const v of field.values)
          propValues[key].add(v);
      }
    }
    return propValues;
  });
  const isObject2 = isObject;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = {};
    const proms = [];
    const shape = value.shape;
    for (const key of value.keys) {
      const el = shape[key];
      const r = el._zod.run({ value: input[key], issues: [] }, ctx);
      if (r instanceof Promise) {
        proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input)));
      } else {
        handlePropertyResult(r, payload, key, input);
      }
    }
    if (!catchall) {
      return proms.length ? Promise.all(proms).then(() => payload) : payload;
    }
    return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
  };
});
var $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
  $ZodObject.init(inst, def);
  const superParse = inst._zod.parse;
  const _normalized = cached(() => normalizeDef(def));
  const generateFastpass = (shape) => {
    const doc = new Doc(["shape", "payload", "ctx"]);
    const normalized = _normalized.value;
    const parseStr = (key) => {
      const k = esc(key);
      return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
    };
    doc.write(`const input = payload.value;`);
    const ids = /* @__PURE__ */ Object.create(null);
    let counter = 0;
    for (const key of normalized.keys) {
      ids[key] = `key_${counter++}`;
    }
    doc.write(`const newResult = {};`);
    for (const key of normalized.keys) {
      const id = ids[key];
      const k = esc(key);
      doc.write(`const ${id} = ${parseStr(key)};`);
      doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
    }
    doc.write(`payload.value = newResult;`);
    doc.write(`return payload;`);
    const fn = doc.compile();
    return (payload, ctx) => fn(shape, payload, ctx);
  };
  let fastpass;
  const isObject2 = isObject;
  const jit = !globalConfig.jitless;
  const allowsEval2 = allowsEval;
  const fastEnabled = jit && allowsEval2.value;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
      if (!fastpass)
        fastpass = generateFastpass(def.shape);
      payload = fastpass(payload, ctx);
      if (!catchall)
        return payload;
      return handleCatchall([], input, payload, ctx, value, inst);
    }
    return superParse(payload, ctx);
  };
});
function handleUnionResults(results, final, inst, ctx) {
  for (const result of results) {
    if (result.issues.length === 0) {
      final.value = result.value;
      return final;
    }
  }
  const nonaborted = results.filter((r) => !aborted(r));
  if (nonaborted.length === 1) {
    final.value = nonaborted[0].value;
    return nonaborted[0];
  }
  final.issues.push({
    code: "invalid_union",
    input: final.value,
    inst,
    errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  });
  return final;
}
var $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
  defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
  defineLazy(inst._zod, "values", () => {
    if (def.options.every((o) => o._zod.values)) {
      return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
    }
    return void 0;
  });
  defineLazy(inst._zod, "pattern", () => {
    if (def.options.every((o) => o._zod.pattern)) {
      const patterns = def.options.map((o) => o._zod.pattern);
      return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
    }
    return void 0;
  });
  const single = def.options.length === 1;
  const first = def.options[0]._zod.run;
  inst._zod.parse = (payload, ctx) => {
    if (single) {
      return first(payload, ctx);
    }
    let async = false;
    const results = [];
    for (const option of def.options) {
      const result = option._zod.run({
        value: payload.value,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        results.push(result);
        async = true;
      } else {
        if (result.issues.length === 0)
          return result;
        results.push(result);
      }
    }
    if (!async)
      return handleUnionResults(results, payload, inst, ctx);
    return Promise.all(results).then((results2) => {
      return handleUnionResults(results2, payload, inst, ctx);
    });
  };
});
function handleExclusiveUnionResults(results, final, inst, ctx) {
  const successes = results.filter((r) => r.issues.length === 0);
  if (successes.length === 1) {
    final.value = successes[0].value;
    return final;
  }
  if (successes.length === 0) {
    final.issues.push({
      code: "invalid_union",
      input: final.value,
      inst,
      errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
    });
  } else {
    final.issues.push({
      code: "invalid_union",
      input: final.value,
      inst,
      errors: [],
      inclusive: false
    });
  }
  return final;
}
var $ZodXor = /* @__PURE__ */ $constructor("$ZodXor", (inst, def) => {
  $ZodUnion.init(inst, def);
  def.inclusive = false;
  const single = def.options.length === 1;
  const first = def.options[0]._zod.run;
  inst._zod.parse = (payload, ctx) => {
    if (single) {
      return first(payload, ctx);
    }
    let async = false;
    const results = [];
    for (const option of def.options) {
      const result = option._zod.run({
        value: payload.value,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        results.push(result);
        async = true;
      } else {
        results.push(result);
      }
    }
    if (!async)
      return handleExclusiveUnionResults(results, payload, inst, ctx);
    return Promise.all(results).then((results2) => {
      return handleExclusiveUnionResults(results2, payload, inst, ctx);
    });
  };
});
var $ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("$ZodDiscriminatedUnion", (inst, def) => {
  def.inclusive = false;
  $ZodUnion.init(inst, def);
  const _super = inst._zod.parse;
  defineLazy(inst._zod, "propValues", () => {
    const propValues = {};
    for (const option of def.options) {
      const pv = option._zod.propValues;
      if (!pv || Object.keys(pv).length === 0)
        throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
      for (const [k, v] of Object.entries(pv)) {
        if (!propValues[k])
          propValues[k] = /* @__PURE__ */ new Set();
        for (const val of v) {
          propValues[k].add(val);
        }
      }
    }
    return propValues;
  });
  const disc = cached(() => {
    const opts = def.options;
    const map2 = /* @__PURE__ */ new Map();
    for (const o of opts) {
      const values = o._zod.propValues?.[def.discriminator];
      if (!values || values.size === 0)
        throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(o)}"`);
      for (const v of values) {
        if (map2.has(v)) {
          throw new Error(`Duplicate discriminator value "${String(v)}"`);
        }
        map2.set(v, o);
      }
    }
    return map2;
  });
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!isObject(input)) {
      payload.issues.push({
        code: "invalid_type",
        expected: "object",
        input,
        inst
      });
      return payload;
    }
    const opt = disc.value.get(input?.[def.discriminator]);
    if (opt) {
      return opt._zod.run(payload, ctx);
    }
    if (def.unionFallback) {
      return _super(payload, ctx);
    }
    payload.issues.push({
      code: "invalid_union",
      errors: [],
      note: "No matching discriminator",
      discriminator: def.discriminator,
      input,
      path: [def.discriminator],
      inst
    });
    return payload;
  };
});
var $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    const left = def.left._zod.run({ value: input, issues: [] }, ctx);
    const right = def.right._zod.run({ value: input, issues: [] }, ctx);
    const async = left instanceof Promise || right instanceof Promise;
    if (async) {
      return Promise.all([left, right]).then(([left2, right2]) => {
        return handleIntersectionResults(payload, left2, right2);
      });
    }
    return handleIntersectionResults(payload, left, right);
  };
});
function mergeValues(a, b) {
  if (a === b) {
    return { valid: true, data: a };
  }
  if (a instanceof Date && b instanceof Date && +a === +b) {
    return { valid: true, data: a };
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const bKeys = Object.keys(b);
    const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
        };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }
    const newArray = [];
    for (let index2 = 0; index2 < a.length; index2++) {
      const itemA = a[index2];
      const itemB = b[index2];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index2, ...sharedValue.mergeErrorPath]
        };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  }
  return { valid: false, mergeErrorPath: [] };
}
function handleIntersectionResults(result, left, right) {
  if (left.issues.length) {
    result.issues.push(...left.issues);
  }
  if (right.issues.length) {
    result.issues.push(...right.issues);
  }
  if (aborted(result))
    return result;
  const merged = mergeValues(left.value, right.value);
  if (!merged.valid) {
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
  }
  result.value = merged.data;
  return result;
}
var $ZodTuple = /* @__PURE__ */ $constructor("$ZodTuple", (inst, def) => {
  $ZodType.init(inst, def);
  const items = def.items;
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        input,
        inst,
        expected: "tuple",
        code: "invalid_type"
      });
      return payload;
    }
    payload.value = [];
    const proms = [];
    const reversedIndex = [...items].reverse().findIndex((item) => item._zod.optin !== "optional");
    const optStart = reversedIndex === -1 ? 0 : items.length - reversedIndex;
    if (!def.rest) {
      const tooBig = input.length > items.length;
      const tooSmall = input.length < optStart - 1;
      if (tooBig || tooSmall) {
        payload.issues.push({
          ...tooBig ? { code: "too_big", maximum: items.length } : { code: "too_small", minimum: items.length },
          input,
          inst,
          origin: "array"
        });
        return payload;
      }
    }
    let i = -1;
    for (const item of items) {
      i++;
      if (i >= input.length) {
        if (i >= optStart)
          continue;
      }
      const result = item._zod.run({
        value: input[i],
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result2) => handleTupleResult(result2, payload, i)));
      } else {
        handleTupleResult(result, payload, i);
      }
    }
    if (def.rest) {
      const rest = input.slice(items.length);
      for (const el of rest) {
        i++;
        const result = def.rest._zod.run({
          value: el,
          issues: []
        }, ctx);
        if (result instanceof Promise) {
          proms.push(result.then((result2) => handleTupleResult(result2, payload, i)));
        } else {
          handleTupleResult(result, payload, i);
        }
      }
    }
    if (proms.length)
      return Promise.all(proms).then(() => payload);
    return payload;
  };
});
function handleTupleResult(result, final, index2) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index2, result.issues));
  }
  final.value[index2] = result.value;
}
var $ZodRecord = /* @__PURE__ */ $constructor("$ZodRecord", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!isPlainObject(input)) {
      payload.issues.push({
        expected: "record",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    const proms = [];
    const values = def.keyType._zod.values;
    if (values) {
      payload.value = {};
      const recordKeys = /* @__PURE__ */ new Set();
      for (const key of values) {
        if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
          recordKeys.add(typeof key === "number" ? key.toString() : key);
          const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
          if (result instanceof Promise) {
            proms.push(result.then((result2) => {
              if (result2.issues.length) {
                payload.issues.push(...prefixIssues(key, result2.issues));
              }
              payload.value[key] = result2.value;
            }));
          } else {
            if (result.issues.length) {
              payload.issues.push(...prefixIssues(key, result.issues));
            }
            payload.value[key] = result.value;
          }
        }
      }
      let unrecognized;
      for (const key in input) {
        if (!recordKeys.has(key)) {
          unrecognized = unrecognized ?? [];
          unrecognized.push(key);
        }
      }
      if (unrecognized && unrecognized.length > 0) {
        payload.issues.push({
          code: "unrecognized_keys",
          input,
          inst,
          keys: unrecognized
        });
      }
    } else {
      payload.value = {};
      for (const key of Reflect.ownKeys(input)) {
        if (key === "__proto__")
          continue;
        const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
        if (keyResult instanceof Promise) {
          throw new Error("Async schemas not supported in object keys currently");
        }
        if (keyResult.issues.length) {
          if (def.mode === "loose") {
            payload.value[key] = input[key];
          } else {
            payload.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
              input: key,
              path: [key],
              inst
            });
          }
          continue;
        }
        const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
        if (result instanceof Promise) {
          proms.push(result.then((result2) => {
            if (result2.issues.length) {
              payload.issues.push(...prefixIssues(key, result2.issues));
            }
            payload.value[keyResult.value] = result2.value;
          }));
        } else {
          if (result.issues.length) {
            payload.issues.push(...prefixIssues(key, result.issues));
          }
          payload.value[keyResult.value] = result.value;
        }
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
var $ZodMap = /* @__PURE__ */ $constructor("$ZodMap", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!(input instanceof Map)) {
      payload.issues.push({
        expected: "map",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    const proms = [];
    payload.value = /* @__PURE__ */ new Map();
    for (const [key, value] of input) {
      const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
      const valueResult = def.valueType._zod.run({ value, issues: [] }, ctx);
      if (keyResult instanceof Promise || valueResult instanceof Promise) {
        proms.push(Promise.all([keyResult, valueResult]).then(([keyResult2, valueResult2]) => {
          handleMapResult(keyResult2, valueResult2, payload, key, input, inst, ctx);
        }));
      } else {
        handleMapResult(keyResult, valueResult, payload, key, input, inst, ctx);
      }
    }
    if (proms.length)
      return Promise.all(proms).then(() => payload);
    return payload;
  };
});
function handleMapResult(keyResult, valueResult, final, key, input, inst, ctx) {
  if (keyResult.issues.length) {
    if (propertyKeyTypes.has(typeof key)) {
      final.issues.push(...prefixIssues(key, keyResult.issues));
    } else {
      final.issues.push({
        code: "invalid_key",
        origin: "map",
        input,
        inst,
        issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config()))
      });
    }
  }
  if (valueResult.issues.length) {
    if (propertyKeyTypes.has(typeof key)) {
      final.issues.push(...prefixIssues(key, valueResult.issues));
    } else {
      final.issues.push({
        origin: "map",
        code: "invalid_element",
        input,
        inst,
        key,
        issues: valueResult.issues.map((iss) => finalizeIssue(iss, ctx, config()))
      });
    }
  }
  final.value.set(keyResult.value, valueResult.value);
}
var $ZodSet = /* @__PURE__ */ $constructor("$ZodSet", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!(input instanceof Set)) {
      payload.issues.push({
        input,
        inst,
        expected: "set",
        code: "invalid_type"
      });
      return payload;
    }
    const proms = [];
    payload.value = /* @__PURE__ */ new Set();
    for (const item of input) {
      const result = def.valueType._zod.run({ value: item, issues: [] }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result2) => handleSetResult(result2, payload)));
      } else
        handleSetResult(result, payload);
    }
    if (proms.length)
      return Promise.all(proms).then(() => payload);
    return payload;
  };
});
function handleSetResult(result, final) {
  if (result.issues.length) {
    final.issues.push(...result.issues);
  }
  final.value.add(result.value);
}
var $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
  $ZodType.init(inst, def);
  const values = getEnumValues(def.entries);
  const valuesSet = new Set(values);
  inst._zod.values = valuesSet;
  inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (valuesSet.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodLiteral = /* @__PURE__ */ $constructor("$ZodLiteral", (inst, def) => {
  $ZodType.init(inst, def);
  if (def.values.length === 0) {
    throw new Error("Cannot create literal schema with no valid values");
  }
  const values = new Set(def.values);
  inst._zod.values = values;
  inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (values.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values: def.values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodFile = /* @__PURE__ */ $constructor("$ZodFile", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (input instanceof File)
      return payload;
    payload.issues.push({
      expected: "file",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    const _out = def.transform(payload.value, payload);
    if (ctx.async) {
      const output = _out instanceof Promise ? _out : Promise.resolve(_out);
      return output.then((output2) => {
        payload.value = output2;
        return payload;
      });
    }
    if (_out instanceof Promise) {
      throw new $ZodAsyncError();
    }
    payload.value = _out;
    return payload;
  };
});
function handleOptionalResult(result, input) {
  if (result.issues.length && input === void 0) {
    return { issues: [], value: void 0 };
  }
  return result;
}
var $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  inst._zod.optout = "optional";
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
  });
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    if (def.innerType._zod.optin === "optional") {
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise)
        return result.then((r) => handleOptionalResult(r, payload.value));
      return handleOptionalResult(result, payload.value);
    }
    if (payload.value === void 0) {
      return payload;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
  });
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === null)
      return payload;
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === void 0) {
      payload.value = def.defaultValue;
      return payload;
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => handleDefaultResult(result2, def));
    }
    return handleDefaultResult(result, def);
  };
});
function handleDefaultResult(payload, def) {
  if (payload.value === void 0) {
    payload.value = def.defaultValue;
  }
  return payload;
}
var $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === void 0) {
      payload.value = def.defaultValue;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => {
    const v = def.innerType._zod.values;
    return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
  });
  inst._zod.parse = (payload, ctx) => {
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => handleNonOptionalResult(result2, inst));
    }
    return handleNonOptionalResult(result, inst);
  };
});
function handleNonOptionalResult(payload, inst) {
  if (!payload.issues.length && payload.value === void 0) {
    payload.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: payload.value,
      inst
    });
  }
  return payload;
}
var $ZodSuccess = /* @__PURE__ */ $constructor("$ZodSuccess", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      throw new $ZodEncodeError("ZodSuccess");
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => {
        payload.value = result2.issues.length === 0;
        return payload;
      });
    }
    payload.value = result.issues.length === 0;
    return payload;
  };
});
var $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => {
        payload.value = result2.value;
        if (result2.issues.length) {
          payload.value = def.catchValue({
            ...payload,
            error: {
              issues: result2.issues.map((iss) => finalizeIssue(iss, ctx, config()))
            },
            input: payload.value
          });
          payload.issues = [];
        }
        return payload;
      });
    }
    payload.value = result.value;
    if (result.issues.length) {
      payload.value = def.catchValue({
        ...payload,
        error: {
          issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
        },
        input: payload.value
      });
      payload.issues = [];
    }
    return payload;
  };
});
var $ZodNaN = /* @__PURE__ */ $constructor("$ZodNaN", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    if (typeof payload.value !== "number" || !Number.isNaN(payload.value)) {
      payload.issues.push({
        input: payload.value,
        inst,
        expected: "nan",
        code: "invalid_type"
      });
      return payload;
    }
    return payload;
  };
});
var $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => def.in._zod.values);
  defineLazy(inst._zod, "optin", () => def.in._zod.optin);
  defineLazy(inst._zod, "optout", () => def.out._zod.optout);
  defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      const right = def.out._zod.run(payload, ctx);
      if (right instanceof Promise) {
        return right.then((right2) => handlePipeResult(right2, def.in, ctx));
      }
      return handlePipeResult(right, def.in, ctx);
    }
    const left = def.in._zod.run(payload, ctx);
    if (left instanceof Promise) {
      return left.then((left2) => handlePipeResult(left2, def.out, ctx));
    }
    return handlePipeResult(left, def.out, ctx);
  };
});
function handlePipeResult(left, next, ctx) {
  if (left.issues.length) {
    left.aborted = true;
    return left;
  }
  return next._zod.run({ value: left.value, issues: left.issues }, ctx);
}
var $ZodCodec = /* @__PURE__ */ $constructor("$ZodCodec", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => def.in._zod.values);
  defineLazy(inst._zod, "optin", () => def.in._zod.optin);
  defineLazy(inst._zod, "optout", () => def.out._zod.optout);
  defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
  inst._zod.parse = (payload, ctx) => {
    const direction = ctx.direction || "forward";
    if (direction === "forward") {
      const left = def.in._zod.run(payload, ctx);
      if (left instanceof Promise) {
        return left.then((left2) => handleCodecAResult(left2, def, ctx));
      }
      return handleCodecAResult(left, def, ctx);
    } else {
      const right = def.out._zod.run(payload, ctx);
      if (right instanceof Promise) {
        return right.then((right2) => handleCodecAResult(right2, def, ctx));
      }
      return handleCodecAResult(right, def, ctx);
    }
  };
});
function handleCodecAResult(result, def, ctx) {
  if (result.issues.length) {
    result.aborted = true;
    return result;
  }
  const direction = ctx.direction || "forward";
  if (direction === "forward") {
    const transformed = def.transform(result.value, result);
    if (transformed instanceof Promise) {
      return transformed.then((value) => handleCodecTxResult(result, value, def.out, ctx));
    }
    return handleCodecTxResult(result, transformed, def.out, ctx);
  } else {
    const transformed = def.reverseTransform(result.value, result);
    if (transformed instanceof Promise) {
      return transformed.then((value) => handleCodecTxResult(result, value, def.in, ctx));
    }
    return handleCodecTxResult(result, transformed, def.in, ctx);
  }
}
function handleCodecTxResult(left, value, nextSchema, ctx) {
  if (left.issues.length) {
    left.aborted = true;
    return left;
  }
  return nextSchema._zod.run({ value, issues: left.issues }, ctx);
}
var $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
  defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then(handleReadonlyResult);
    }
    return handleReadonlyResult(result);
  };
});
function handleReadonlyResult(payload) {
  payload.value = Object.freeze(payload.value);
  return payload;
}
var $ZodTemplateLiteral = /* @__PURE__ */ $constructor("$ZodTemplateLiteral", (inst, def) => {
  $ZodType.init(inst, def);
  const regexParts = [];
  for (const part of def.parts) {
    if (typeof part === "object" && part !== null) {
      if (!part._zod.pattern) {
        throw new Error(`Invalid template literal part, no pattern found: ${[...part._zod.traits].shift()}`);
      }
      const source = part._zod.pattern instanceof RegExp ? part._zod.pattern.source : part._zod.pattern;
      if (!source)
        throw new Error(`Invalid template literal part: ${part._zod.traits}`);
      const start = source.startsWith("^") ? 1 : 0;
      const end = source.endsWith("$") ? source.length - 1 : source.length;
      regexParts.push(source.slice(start, end));
    } else if (part === null || primitiveTypes.has(typeof part)) {
      regexParts.push(escapeRegex(`${part}`));
    } else {
      throw new Error(`Invalid template literal part: ${part}`);
    }
  }
  inst._zod.pattern = new RegExp(`^${regexParts.join("")}$`);
  inst._zod.parse = (payload, _ctx) => {
    if (typeof payload.value !== "string") {
      payload.issues.push({
        input: payload.value,
        inst,
        expected: "template_literal",
        code: "invalid_type"
      });
      return payload;
    }
    inst._zod.pattern.lastIndex = 0;
    if (!inst._zod.pattern.test(payload.value)) {
      payload.issues.push({
        input: payload.value,
        inst,
        code: "invalid_format",
        format: def.format ?? "template_literal",
        pattern: inst._zod.pattern.source
      });
      return payload;
    }
    return payload;
  };
});
var $ZodFunction = /* @__PURE__ */ $constructor("$ZodFunction", (inst, def) => {
  $ZodType.init(inst, def);
  inst._def = def;
  inst._zod.def = def;
  inst.implement = (func) => {
    if (typeof func !== "function") {
      throw new Error("implement() must be called with a function");
    }
    return function(...args) {
      const parsedArgs = inst._def.input ? parse(inst._def.input, args) : args;
      const result = Reflect.apply(func, this, parsedArgs);
      if (inst._def.output) {
        return parse(inst._def.output, result);
      }
      return result;
    };
  };
  inst.implementAsync = (func) => {
    if (typeof func !== "function") {
      throw new Error("implementAsync() must be called with a function");
    }
    return async function(...args) {
      const parsedArgs = inst._def.input ? await parseAsync(inst._def.input, args) : args;
      const result = await Reflect.apply(func, this, parsedArgs);
      if (inst._def.output) {
        return await parseAsync(inst._def.output, result);
      }
      return result;
    };
  };
  inst._zod.parse = (payload, _ctx) => {
    if (typeof payload.value !== "function") {
      payload.issues.push({
        code: "invalid_type",
        expected: "function",
        input: payload.value,
        inst
      });
      return payload;
    }
    const hasPromiseOutput = inst._def.output && inst._def.output._zod.def.type === "promise";
    if (hasPromiseOutput) {
      payload.value = inst.implementAsync(payload.value);
    } else {
      payload.value = inst.implement(payload.value);
    }
    return payload;
  };
  inst.input = (...args) => {
    const F = inst.constructor;
    if (Array.isArray(args[0])) {
      return new F({
        type: "function",
        input: new $ZodTuple({
          type: "tuple",
          items: args[0],
          rest: args[1]
        }),
        output: inst._def.output
      });
    }
    return new F({
      type: "function",
      input: args[0],
      output: inst._def.output
    });
  };
  inst.output = (output) => {
    const F = inst.constructor;
    return new F({
      type: "function",
      input: inst._def.input,
      output
    });
  };
  return inst;
});
var $ZodPromise = /* @__PURE__ */ $constructor("$ZodPromise", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    return Promise.resolve(payload.value).then((inner) => def.innerType._zod.run({ value: inner, issues: [] }, ctx));
  };
});
var $ZodLazy = /* @__PURE__ */ $constructor("$ZodLazy", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "innerType", () => def.getter());
  defineLazy(inst._zod, "pattern", () => inst._zod.innerType?._zod?.pattern);
  defineLazy(inst._zod, "propValues", () => inst._zod.innerType?._zod?.propValues);
  defineLazy(inst._zod, "optin", () => inst._zod.innerType?._zod?.optin ?? void 0);
  defineLazy(inst._zod, "optout", () => inst._zod.innerType?._zod?.optout ?? void 0);
  inst._zod.parse = (payload, ctx) => {
    const inner = inst._zod.innerType;
    return inner._zod.run(payload, ctx);
  };
});
var $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
  $ZodCheck.init(inst, def);
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _) => {
    return payload;
  };
  inst._zod.check = (payload) => {
    const input = payload.value;
    const r = def.fn(input);
    if (r instanceof Promise) {
      return r.then((r2) => handleRefineResult(r2, payload, input, inst));
    }
    handleRefineResult(r, payload, input, inst);
    return;
  };
});
function handleRefineResult(result, payload, input, inst) {
  if (!result) {
    const _iss = {
      code: "custom",
      input,
      inst,
      // incorporates params.error into issue reporting
      path: [...inst._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !inst._zod.def.abort
      // params: inst._zod.def.params,
    };
    if (inst._zod.def.params)
      _iss.params = inst._zod.def.params;
    payload.issues.push(issue(_iss));
  }
}

// node_modules/zod/v4/locales/index.js
var locales_exports = {};
__export(locales_exports, {
  ar: () => ar_default,
  az: () => az_default,
  be: () => be_default,
  bg: () => bg_default,
  ca: () => ca_default,
  cs: () => cs_default,
  da: () => da_default,
  de: () => de_default,
  en: () => en_default,
  eo: () => eo_default,
  es: () => es_default,
  fa: () => fa_default,
  fi: () => fi_default,
  fr: () => fr_default,
  frCA: () => fr_CA_default,
  he: () => he_default,
  hu: () => hu_default,
  id: () => id_default,
  is: () => is_default,
  it: () => it_default,
  ja: () => ja_default,
  ka: () => ka_default,
  kh: () => kh_default,
  km: () => km_default,
  ko: () => ko_default,
  lt: () => lt_default,
  mk: () => mk_default,
  ms: () => ms_default,
  nl: () => nl_default,
  no: () => no_default,
  ota: () => ota_default,
  pl: () => pl_default,
  ps: () => ps_default,
  pt: () => pt_default,
  ru: () => ru_default,
  sl: () => sl_default,
  sv: () => sv_default,
  ta: () => ta_default,
  th: () => th_default,
  tr: () => tr_default,
  ua: () => ua_default,
  uk: () => uk_default,
  ur: () => ur_default,
  vi: () => vi_default,
  yo: () => yo_default,
  zhCN: () => zh_CN_default,
  zhTW: () => zh_TW_default
});

// node_modules/zod/v4/locales/ar.js
var error = () => {
  const Sizable = {
    string: { unit: "\u062D\u0631\u0641", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
    file: { unit: "\u0628\u0627\u064A\u062A", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
    array: { unit: "\u0639\u0646\u0635\u0631", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
    set: { unit: "\u0639\u0646\u0635\u0631", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "number";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "array";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "\u0645\u062F\u062E\u0644",
    email: "\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
    url: "\u0631\u0627\u0628\u0637",
    emoji: "\u0625\u064A\u0645\u0648\u062C\u064A",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "\u062A\u0627\u0631\u064A\u062E \u0648\u0648\u0642\u062A \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
    date: "\u062A\u0627\u0631\u064A\u062E \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
    time: "\u0648\u0642\u062A \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
    duration: "\u0645\u062F\u0629 \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
    ipv4: "\u0639\u0646\u0648\u0627\u0646 IPv4",
    ipv6: "\u0639\u0646\u0648\u0627\u0646 IPv6",
    cidrv4: "\u0645\u062F\u0649 \u0639\u0646\u0627\u0648\u064A\u0646 \u0628\u0635\u064A\u063A\u0629 IPv4",
    cidrv6: "\u0645\u062F\u0649 \u0639\u0646\u0627\u0648\u064A\u0646 \u0628\u0635\u064A\u063A\u0629 IPv6",
    base64: "\u0646\u064E\u0635 \u0628\u062A\u0631\u0645\u064A\u0632 base64-encoded",
    base64url: "\u0646\u064E\u0635 \u0628\u062A\u0631\u0645\u064A\u0632 base64url-encoded",
    json_string: "\u0646\u064E\u0635 \u0639\u0644\u0649 \u0647\u064A\u0626\u0629 JSON",
    e164: "\u0631\u0642\u0645 \u0647\u0627\u062A\u0641 \u0628\u0645\u0639\u064A\u0627\u0631 E.164",
    jwt: "JWT",
    template_literal: "\u0645\u062F\u062E\u0644"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${issue2.expected}\u060C \u0648\u0644\u0643\u0646 \u062A\u0645 \u0625\u062F\u062E\u0627\u0644 ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${stringifyPrimitive(issue2.values[0])}`;
        return `\u0627\u062E\u062A\u064A\u0627\u0631 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062A\u0648\u0642\u0639 \u0627\u0646\u062A\u0642\u0627\u0621 \u0623\u062D\u062F \u0647\u0630\u0647 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A: ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return ` \u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${issue2.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "\u0639\u0646\u0635\u0631"}`;
        return `\u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${issue2.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${adj} ${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${issue2.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${issue2.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${adj} ${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0628\u062F\u0623 \u0628\u0640 "${issue2.prefix}"`;
        if (_issue.format === "ends_with")
          return `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0646\u062A\u0647\u064A \u0628\u0640 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0636\u0645\u0651\u064E\u0646 "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0637\u0627\u0628\u0642 \u0627\u0644\u0646\u0645\u0637 ${_issue.pattern}`;
        return `${Nouns[_issue.format] ?? issue2.format} \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644`;
      }
      case "not_multiple_of":
        return `\u0631\u0642\u0645 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0646 \u0645\u0636\u0627\u0639\u0641\u0627\u062A ${issue2.divisor}`;
      case "unrecognized_keys":
        return `\u0645\u0639\u0631\u0641${issue2.keys.length > 1 ? "\u0627\u062A" : ""} \u063A\u0631\u064A\u0628${issue2.keys.length > 1 ? "\u0629" : ""}: ${joinValues(issue2.keys, "\u060C ")}`;
      case "invalid_key":
        return `\u0645\u0639\u0631\u0641 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644 \u0641\u064A ${issue2.origin}`;
      case "invalid_union":
        return "\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644";
      case "invalid_element":
        return `\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644 \u0641\u064A ${issue2.origin}`;
      default:
        return "\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644";
    }
  };
};
function ar_default() {
  return {
    localeError: error()
  };
}

// node_modules/zod/v4/locales/az.js
var error2 = () => {
  const Sizable = {
    string: { unit: "simvol", verb: "olmal\u0131d\u0131r" },
    file: { unit: "bayt", verb: "olmal\u0131d\u0131r" },
    array: { unit: "element", verb: "olmal\u0131d\u0131r" },
    set: { unit: "element", verb: "olmal\u0131d\u0131r" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "number";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "array";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "input",
    email: "email address",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO datetime",
    date: "ISO date",
    time: "ISO time",
    duration: "ISO duration",
    ipv4: "IPv4 address",
    ipv6: "IPv6 address",
    cidrv4: "IPv4 range",
    cidrv6: "IPv6 range",
    base64: "base64-encoded string",
    base64url: "base64url-encoded string",
    json_string: "JSON string",
    e164: "E.164 number",
    jwt: "JWT",
    template_literal: "input"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${issue2.expected}, daxil olan ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${stringifyPrimitive(issue2.values[0])}`;
        return `Yanl\u0131\u015F se\xE7im: a\u015Fa\u011F\u0131dak\u0131lardan biri olmal\u0131d\u0131r: ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${issue2.origin ?? "d\u0259y\u0259r"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "element"}`;
        return `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${issue2.origin ?? "d\u0259y\u0259r"} ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        return `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Yanl\u0131\u015F m\u0259tn: "${_issue.prefix}" il\u0259 ba\u015Flamal\u0131d\u0131r`;
        if (_issue.format === "ends_with")
          return `Yanl\u0131\u015F m\u0259tn: "${_issue.suffix}" il\u0259 bitm\u0259lidir`;
        if (_issue.format === "includes")
          return `Yanl\u0131\u015F m\u0259tn: "${_issue.includes}" daxil olmal\u0131d\u0131r`;
        if (_issue.format === "regex")
          return `Yanl\u0131\u015F m\u0259tn: ${_issue.pattern} \u015Fablonuna uy\u011Fun olmal\u0131d\u0131r`;
        return `Yanl\u0131\u015F ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Yanl\u0131\u015F \u0259d\u0259d: ${issue2.divisor} il\u0259 b\xF6l\xFCn\u0259 bil\u0259n olmal\u0131d\u0131r`;
      case "unrecognized_keys":
        return `Tan\u0131nmayan a\xE7ar${issue2.keys.length > 1 ? "lar" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `${issue2.origin} daxilind\u0259 yanl\u0131\u015F a\xE7ar`;
      case "invalid_union":
        return "Yanl\u0131\u015F d\u0259y\u0259r";
      case "invalid_element":
        return `${issue2.origin} daxilind\u0259 yanl\u0131\u015F d\u0259y\u0259r`;
      default:
        return `Yanl\u0131\u015F d\u0259y\u0259r`;
    }
  };
};
function az_default() {
  return {
    localeError: error2()
  };
}

// node_modules/zod/v4/locales/be.js
function getBelarusianPlural(count3, one, few, many) {
  const absCount = Math.abs(count3);
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return many;
  }
  if (lastDigit === 1) {
    return one;
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return few;
  }
  return many;
}
var error3 = () => {
  const Sizable = {
    string: {
      unit: {
        one: "\u0441\u0456\u043C\u0432\u0430\u043B",
        few: "\u0441\u0456\u043C\u0432\u0430\u043B\u044B",
        many: "\u0441\u0456\u043C\u0432\u0430\u043B\u0430\u045E"
      },
      verb: "\u043C\u0435\u0446\u044C"
    },
    array: {
      unit: {
        one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
        few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B",
        many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430\u045E"
      },
      verb: "\u043C\u0435\u0446\u044C"
    },
    set: {
      unit: {
        one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
        few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B",
        many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430\u045E"
      },
      verb: "\u043C\u0435\u0446\u044C"
    },
    file: {
      unit: {
        one: "\u0431\u0430\u0439\u0442",
        few: "\u0431\u0430\u0439\u0442\u044B",
        many: "\u0431\u0430\u0439\u0442\u0430\u045E"
      },
      verb: "\u043C\u0435\u0446\u044C"
    }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "\u043B\u0456\u043A";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "\u043C\u0430\u0441\u0456\u045E";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "\u0443\u0432\u043E\u0434",
    email: "email \u0430\u0434\u0440\u0430\u0441",
    url: "URL",
    emoji: "\u044D\u043C\u043E\u0434\u0437\u0456",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO \u0434\u0430\u0442\u0430 \u0456 \u0447\u0430\u0441",
    date: "ISO \u0434\u0430\u0442\u0430",
    time: "ISO \u0447\u0430\u0441",
    duration: "ISO \u043F\u0440\u0430\u0446\u044F\u0433\u043B\u0430\u0441\u0446\u044C",
    ipv4: "IPv4 \u0430\u0434\u0440\u0430\u0441",
    ipv6: "IPv6 \u0430\u0434\u0440\u0430\u0441",
    cidrv4: "IPv4 \u0434\u044B\u044F\u043F\u0430\u0437\u043E\u043D",
    cidrv6: "IPv6 \u0434\u044B\u044F\u043F\u0430\u0437\u043E\u043D",
    base64: "\u0440\u0430\u0434\u043E\u043A \u0443 \u0444\u0430\u0440\u043C\u0430\u0446\u0435 base64",
    base64url: "\u0440\u0430\u0434\u043E\u043A \u0443 \u0444\u0430\u0440\u043C\u0430\u0446\u0435 base64url",
    json_string: "JSON \u0440\u0430\u0434\u043E\u043A",
    e164: "\u043D\u0443\u043C\u0430\u0440 E.164",
    jwt: "JWT",
    template_literal: "\u0443\u0432\u043E\u0434"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u045E\u0441\u044F ${issue2.expected}, \u0430\u0442\u0440\u044B\u043C\u0430\u043D\u0430 ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F ${stringifyPrimitive(issue2.values[0])}`;
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0432\u0430\u0440\u044B\u044F\u043D\u0442: \u0447\u0430\u043A\u0430\u045E\u0441\u044F \u0430\u0434\u0437\u0456\u043D \u0437 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          const maxValue = Number(issue2.maximum);
          const unit = getBelarusianPlural(maxValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${sizing.verb} ${adj}${issue2.maximum.toString()} ${unit}`;
        }
        return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          const minValue = Number(issue2.minimum);
          const unit = getBelarusianPlural(minValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${issue2.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${sizing.verb} ${adj}${issue2.minimum.toString()} ${unit}`;
        }
        return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${issue2.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u043F\u0430\u0447\u044B\u043D\u0430\u0446\u0446\u0430 \u0437 "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u0430\u043A\u0430\u043D\u0447\u0432\u0430\u0446\u0446\u0430 \u043D\u0430 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u043C\u044F\u0448\u0447\u0430\u0446\u044C "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0430\u0434\u043F\u0430\u0432\u044F\u0434\u0430\u0446\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${_issue.pattern}`;
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u043B\u0456\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0431\u044B\u0446\u044C \u043A\u0440\u0430\u0442\u043D\u044B\u043C ${issue2.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u0430\u0441\u043F\u0430\u0437\u043D\u0430\u043D\u044B ${issue2.keys.length > 1 ? "\u043A\u043B\u044E\u0447\u044B" : "\u043A\u043B\u044E\u0447"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u043A\u043B\u044E\u0447 \u0443 ${issue2.origin}`;
      case "invalid_union":
        return "\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434";
      case "invalid_element":
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u0430\u0435 \u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435 \u045E ${issue2.origin}`;
      default:
        return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434`;
    }
  };
};
function be_default() {
  return {
    localeError: error3()
  };
}

// node_modules/zod/v4/locales/bg.js
var parsedType = (data) => {
  const t2 = typeof data;
  switch (t2) {
    case "number": {
      return Number.isNaN(data) ? "NaN" : "\u0447\u0438\u0441\u043B\u043E";
    }
    case "object": {
      if (Array.isArray(data)) {
        return "\u043C\u0430\u0441\u0438\u0432";
      }
      if (data === null) {
        return "null";
      }
      if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
        return data.constructor.name;
      }
    }
  }
  return t2;
};
var error4 = () => {
  const Sizable = {
    string: { unit: "\u0441\u0438\u043C\u0432\u043E\u043B\u0430", verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430" },
    file: { unit: "\u0431\u0430\u0439\u0442\u0430", verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430" },
    array: { unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430", verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430" },
    set: { unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430", verb: "\u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const Nouns = {
    regex: "\u0432\u0445\u043E\u0434",
    email: "\u0438\u043C\u0435\u0439\u043B \u0430\u0434\u0440\u0435\u0441",
    url: "URL",
    emoji: "\u0435\u043C\u043E\u0434\u0436\u0438",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO \u0432\u0440\u0435\u043C\u0435",
    date: "ISO \u0434\u0430\u0442\u0430",
    time: "ISO \u0432\u0440\u0435\u043C\u0435",
    duration: "ISO \u043F\u0440\u043E\u0434\u044A\u043B\u0436\u0438\u0442\u0435\u043B\u043D\u043E\u0441\u0442",
    ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441",
    ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441",
    cidrv4: "IPv4 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
    cidrv6: "IPv6 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
    base64: "base64-\u043A\u043E\u0434\u0438\u0440\u0430\u043D \u043D\u0438\u0437",
    base64url: "base64url-\u043A\u043E\u0434\u0438\u0440\u0430\u043D \u043D\u0438\u0437",
    json_string: "JSON \u043D\u0438\u0437",
    e164: "E.164 \u043D\u043E\u043C\u0435\u0440",
    jwt: "JWT",
    template_literal: "\u0432\u0445\u043E\u0434"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D ${issue2.expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D ${parsedType(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434: \u043E\u0447\u0430\u043A\u0432\u0430\u043D ${stringifyPrimitive(issue2.values[0])}`;
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 \u043E\u043F\u0446\u0438\u044F: \u043E\u0447\u0430\u043A\u0432\u0430\u043D\u043E \u0435\u0434\u043D\u043E \u043E\u0442 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u0422\u0432\u044A\u0440\u0434\u0435 \u0433\u043E\u043B\u044F\u043C\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${issue2.origin ?? "\u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442"} \u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430 ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0430"}`;
        return `\u0422\u0432\u044A\u0440\u0434\u0435 \u0433\u043E\u043B\u044F\u043C\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${issue2.origin ?? "\u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442"} \u0434\u0430 \u0431\u044A\u0434\u0435 ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0422\u0432\u044A\u0440\u0434\u0435 \u043C\u0430\u043B\u043A\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${issue2.origin} \u0434\u0430 \u0441\u044A\u0434\u044A\u0440\u0436\u0430 ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u0422\u0432\u044A\u0440\u0434\u0435 \u043C\u0430\u043B\u043A\u043E: \u043E\u0447\u0430\u043A\u0432\u0430 \u0441\u0435 ${issue2.origin} \u0434\u0430 \u0431\u044A\u0434\u0435 ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0437\u0430\u043F\u043E\u0447\u0432\u0430 \u0441 "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0437\u0430\u0432\u044A\u0440\u0448\u0432\u0430 \u0441 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0432\u043A\u043B\u044E\u0447\u0432\u0430 "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043D\u0438\u0437: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0441\u044A\u0432\u043F\u0430\u0434\u0430 \u0441 ${_issue.pattern}`;
        let invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D";
        if (_issue.format === "emoji")
          invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E";
        if (_issue.format === "datetime")
          invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E";
        if (_issue.format === "date")
          invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430";
        if (_issue.format === "time")
          invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E";
        if (_issue.format === "duration")
          invalid_adj = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430";
        return `${invalid_adj} ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u043E \u0447\u0438\u0441\u043B\u043E: \u0442\u0440\u044F\u0431\u0432\u0430 \u0434\u0430 \u0431\u044A\u0434\u0435 \u043A\u0440\u0430\u0442\u043D\u043E \u043D\u0430 ${issue2.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u0430\u0437\u043F\u043E\u0437\u043D\u0430\u0442${issue2.keys.length > 1 ? "\u0438" : ""} \u043A\u043B\u044E\u0447${issue2.keys.length > 1 ? "\u043E\u0432\u0435" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043A\u043B\u044E\u0447 \u0432 ${issue2.origin}`;
      case "invalid_union":
        return "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434";
      case "invalid_element":
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u043D\u0430 \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442 \u0432 ${issue2.origin}`;
      default:
        return `\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0432\u0445\u043E\u0434`;
    }
  };
};
function bg_default() {
  return {
    localeError: error4()
  };
}

// node_modules/zod/v4/locales/ca.js
var error5 = () => {
  const Sizable = {
    string: { unit: "car\xE0cters", verb: "contenir" },
    file: { unit: "bytes", verb: "contenir" },
    array: { unit: "elements", verb: "contenir" },
    set: { unit: "elements", verb: "contenir" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "number";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "array";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "entrada",
    email: "adre\xE7a electr\xF2nica",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "data i hora ISO",
    date: "data ISO",
    time: "hora ISO",
    duration: "durada ISO",
    ipv4: "adre\xE7a IPv4",
    ipv6: "adre\xE7a IPv6",
    cidrv4: "rang IPv4",
    cidrv6: "rang IPv6",
    base64: "cadena codificada en base64",
    base64url: "cadena codificada en base64url",
    json_string: "cadena JSON",
    e164: "n\xFAmero E.164",
    jwt: "JWT",
    template_literal: "entrada"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Tipus inv\xE0lid: s'esperava ${issue2.expected}, s'ha rebut ${parsedType8(issue2.input)}`;
      // return `Tipus invàlid: s'esperava ${issue.expected}, s'ha rebut ${util.getParsedType(issue.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Valor inv\xE0lid: s'esperava ${stringifyPrimitive(issue2.values[0])}`;
        return `Opci\xF3 inv\xE0lida: s'esperava una de ${joinValues(issue2.values, " o ")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "com a m\xE0xim" : "menys de";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Massa gran: s'esperava que ${issue2.origin ?? "el valor"} contingu\xE9s ${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "elements"}`;
        return `Massa gran: s'esperava que ${issue2.origin ?? "el valor"} fos ${adj} ${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? "com a m\xEDnim" : "m\xE9s de";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Massa petit: s'esperava que ${issue2.origin} contingu\xE9s ${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Massa petit: s'esperava que ${issue2.origin} fos ${adj} ${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `Format inv\xE0lid: ha de comen\xE7ar amb "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `Format inv\xE0lid: ha d'acabar amb "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Format inv\xE0lid: ha d'incloure "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Format inv\xE0lid: ha de coincidir amb el patr\xF3 ${_issue.pattern}`;
        return `Format inv\xE0lid per a ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `N\xFAmero inv\xE0lid: ha de ser m\xFAltiple de ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Clau${issue2.keys.length > 1 ? "s" : ""} no reconeguda${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Clau inv\xE0lida a ${issue2.origin}`;
      case "invalid_union":
        return "Entrada inv\xE0lida";
      // Could also be "Tipus d'unió invàlid" but "Entrada invàlida" is more general
      case "invalid_element":
        return `Element inv\xE0lid a ${issue2.origin}`;
      default:
        return `Entrada inv\xE0lida`;
    }
  };
};
function ca_default() {
  return {
    localeError: error5()
  };
}

// node_modules/zod/v4/locales/cs.js
var error6 = () => {
  const Sizable = {
    string: { unit: "znak\u016F", verb: "m\xEDt" },
    file: { unit: "bajt\u016F", verb: "m\xEDt" },
    array: { unit: "prvk\u016F", verb: "m\xEDt" },
    set: { unit: "prvk\u016F", verb: "m\xEDt" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "\u010D\xEDslo";
      }
      case "string": {
        return "\u0159et\u011Bzec";
      }
      case "boolean": {
        return "boolean";
      }
      case "bigint": {
        return "bigint";
      }
      case "function": {
        return "funkce";
      }
      case "symbol": {
        return "symbol";
      }
      case "undefined": {
        return "undefined";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "pole";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "regul\xE1rn\xED v\xFDraz",
    email: "e-mailov\xE1 adresa",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "datum a \u010Das ve form\xE1tu ISO",
    date: "datum ve form\xE1tu ISO",
    time: "\u010Das ve form\xE1tu ISO",
    duration: "doba trv\xE1n\xED ISO",
    ipv4: "IPv4 adresa",
    ipv6: "IPv6 adresa",
    cidrv4: "rozsah IPv4",
    cidrv6: "rozsah IPv6",
    base64: "\u0159et\u011Bzec zak\xF3dovan\xFD ve form\xE1tu base64",
    base64url: "\u0159et\u011Bzec zak\xF3dovan\xFD ve form\xE1tu base64url",
    json_string: "\u0159et\u011Bzec ve form\xE1tu JSON",
    e164: "\u010D\xEDslo E.164",
    jwt: "JWT",
    template_literal: "vstup"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${issue2.expected}, obdr\u017Eeno ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${stringifyPrimitive(issue2.values[0])}`;
        return `Neplatn\xE1 mo\u017Enost: o\u010Dek\xE1v\xE1na jedna z hodnot ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${issue2.origin ?? "hodnota"} mus\xED m\xEDt ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "prvk\u016F"}`;
        }
        return `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${issue2.origin ?? "hodnota"} mus\xED b\xFDt ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${issue2.origin ?? "hodnota"} mus\xED m\xEDt ${adj}${issue2.minimum.toString()} ${sizing.unit ?? "prvk\u016F"}`;
        }
        return `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${issue2.origin ?? "hodnota"} mus\xED b\xFDt ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Neplatn\xFD \u0159et\u011Bzec: mus\xED za\u010D\xEDnat na "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Neplatn\xFD \u0159et\u011Bzec: mus\xED kon\u010Dit na "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Neplatn\xFD \u0159et\u011Bzec: mus\xED obsahovat "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Neplatn\xFD \u0159et\u011Bzec: mus\xED odpov\xEDdat vzoru ${_issue.pattern}`;
        return `Neplatn\xFD form\xE1t ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Neplatn\xE9 \u010D\xEDslo: mus\xED b\xFDt n\xE1sobkem ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Nezn\xE1m\xE9 kl\xED\u010De: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Neplatn\xFD kl\xED\u010D v ${issue2.origin}`;
      case "invalid_union":
        return "Neplatn\xFD vstup";
      case "invalid_element":
        return `Neplatn\xE1 hodnota v ${issue2.origin}`;
      default:
        return `Neplatn\xFD vstup`;
    }
  };
};
function cs_default() {
  return {
    localeError: error6()
  };
}

// node_modules/zod/v4/locales/da.js
var error7 = () => {
  const Sizable = {
    string: { unit: "tegn", verb: "havde" },
    file: { unit: "bytes", verb: "havde" },
    array: { unit: "elementer", verb: "indeholdt" },
    set: { unit: "elementer", verb: "indeholdt" }
  };
  const TypeNames = {
    string: "streng",
    number: "tal",
    boolean: "boolean",
    array: "liste",
    object: "objekt",
    set: "s\xE6t",
    file: "fil"
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  function getTypeName(type) {
    return TypeNames[type] ?? type;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "tal";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "liste";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
        return "objekt";
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "input",
    email: "e-mailadresse",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO dato- og klokkesl\xE6t",
    date: "ISO-dato",
    time: "ISO-klokkesl\xE6t",
    duration: "ISO-varighed",
    ipv4: "IPv4-omr\xE5de",
    ipv6: "IPv6-omr\xE5de",
    cidrv4: "IPv4-spektrum",
    cidrv6: "IPv6-spektrum",
    base64: "base64-kodet streng",
    base64url: "base64url-kodet streng",
    json_string: "JSON-streng",
    e164: "E.164-nummer",
    jwt: "JWT",
    template_literal: "input"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Ugyldigt input: forventede ${getTypeName(issue2.expected)}, fik ${getTypeName(parsedType8(issue2.input))}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Ugyldig v\xE6rdi: forventede ${stringifyPrimitive(issue2.values[0])}`;
        return `Ugyldigt valg: forventede en af f\xF8lgende ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        const origin = getTypeName(issue2.origin);
        if (sizing)
          return `For stor: forventede ${origin ?? "value"} ${sizing.verb} ${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "elementer"}`;
        return `For stor: forventede ${origin ?? "value"} havde ${adj} ${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        const origin = getTypeName(issue2.origin);
        if (sizing) {
          return `For lille: forventede ${origin} ${sizing.verb} ${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `For lille: forventede ${origin} havde ${adj} ${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Ugyldig streng: skal starte med "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Ugyldig streng: skal ende med "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Ugyldig streng: skal indeholde "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Ugyldig streng: skal matche m\xF8nsteret ${_issue.pattern}`;
        return `Ugyldig ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Ugyldigt tal: skal v\xE6re deleligt med ${issue2.divisor}`;
      case "unrecognized_keys":
        return `${issue2.keys.length > 1 ? "Ukendte n\xF8gler" : "Ukendt n\xF8gle"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Ugyldig n\xF8gle i ${issue2.origin}`;
      case "invalid_union":
        return "Ugyldigt input: matcher ingen af de tilladte typer";
      case "invalid_element":
        return `Ugyldig v\xE6rdi i ${issue2.origin}`;
      default:
        return `Ugyldigt input`;
    }
  };
};
function da_default() {
  return {
    localeError: error7()
  };
}

// node_modules/zod/v4/locales/de.js
var error8 = () => {
  const Sizable = {
    string: { unit: "Zeichen", verb: "zu haben" },
    file: { unit: "Bytes", verb: "zu haben" },
    array: { unit: "Elemente", verb: "zu haben" },
    set: { unit: "Elemente", verb: "zu haben" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "Zahl";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "Array";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "Eingabe",
    email: "E-Mail-Adresse",
    url: "URL",
    emoji: "Emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO-Datum und -Uhrzeit",
    date: "ISO-Datum",
    time: "ISO-Uhrzeit",
    duration: "ISO-Dauer",
    ipv4: "IPv4-Adresse",
    ipv6: "IPv6-Adresse",
    cidrv4: "IPv4-Bereich",
    cidrv6: "IPv6-Bereich",
    base64: "Base64-codierter String",
    base64url: "Base64-URL-codierter String",
    json_string: "JSON-String",
    e164: "E.164-Nummer",
    jwt: "JWT",
    template_literal: "Eingabe"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Ung\xFCltige Eingabe: erwartet ${issue2.expected}, erhalten ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Ung\xFCltige Eingabe: erwartet ${stringifyPrimitive(issue2.values[0])}`;
        return `Ung\xFCltige Option: erwartet eine von ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Zu gro\xDF: erwartet, dass ${issue2.origin ?? "Wert"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "Elemente"} hat`;
        return `Zu gro\xDF: erwartet, dass ${issue2.origin ?? "Wert"} ${adj}${issue2.maximum.toString()} ist`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Zu klein: erwartet, dass ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit} hat`;
        }
        return `Zu klein: erwartet, dass ${issue2.origin} ${adj}${issue2.minimum.toString()} ist`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Ung\xFCltiger String: muss mit "${_issue.prefix}" beginnen`;
        if (_issue.format === "ends_with")
          return `Ung\xFCltiger String: muss mit "${_issue.suffix}" enden`;
        if (_issue.format === "includes")
          return `Ung\xFCltiger String: muss "${_issue.includes}" enthalten`;
        if (_issue.format === "regex")
          return `Ung\xFCltiger String: muss dem Muster ${_issue.pattern} entsprechen`;
        return `Ung\xFCltig: ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Ung\xFCltige Zahl: muss ein Vielfaches von ${issue2.divisor} sein`;
      case "unrecognized_keys":
        return `${issue2.keys.length > 1 ? "Unbekannte Schl\xFCssel" : "Unbekannter Schl\xFCssel"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Ung\xFCltiger Schl\xFCssel in ${issue2.origin}`;
      case "invalid_union":
        return "Ung\xFCltige Eingabe";
      case "invalid_element":
        return `Ung\xFCltiger Wert in ${issue2.origin}`;
      default:
        return `Ung\xFCltige Eingabe`;
    }
  };
};
function de_default() {
  return {
    localeError: error8()
  };
}

// node_modules/zod/v4/locales/en.js
var parsedType2 = (data) => {
  const t2 = typeof data;
  switch (t2) {
    case "number": {
      return Number.isNaN(data) ? "NaN" : "number";
    }
    case "object": {
      if (Array.isArray(data)) {
        return "array";
      }
      if (data === null) {
        return "null";
      }
      if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
        return data.constructor.name;
      }
    }
  }
  return t2;
};
var error9 = () => {
  const Sizable = {
    string: { unit: "characters", verb: "to have" },
    file: { unit: "bytes", verb: "to have" },
    array: { unit: "items", verb: "to have" },
    set: { unit: "items", verb: "to have" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const Nouns = {
    regex: "input",
    email: "email address",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO datetime",
    date: "ISO date",
    time: "ISO time",
    duration: "ISO duration",
    ipv4: "IPv4 address",
    ipv6: "IPv6 address",
    mac: "MAC address",
    cidrv4: "IPv4 range",
    cidrv6: "IPv6 range",
    base64: "base64-encoded string",
    base64url: "base64url-encoded string",
    json_string: "JSON string",
    e164: "E.164 number",
    jwt: "JWT",
    template_literal: "input"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Invalid input: expected ${issue2.expected}, received ${parsedType2(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Invalid input: expected ${stringifyPrimitive(issue2.values[0])}`;
        return `Invalid option: expected one of ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Too big: expected ${issue2.origin ?? "value"} to have ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elements"}`;
        return `Too big: expected ${issue2.origin ?? "value"} to be ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Too small: expected ${issue2.origin} to have ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Too small: expected ${issue2.origin} to be ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `Invalid string: must start with "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `Invalid string: must end with "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Invalid string: must include "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Invalid string: must match pattern ${_issue.pattern}`;
        return `Invalid ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Invalid number: must be a multiple of ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Unrecognized key${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Invalid key in ${issue2.origin}`;
      case "invalid_union":
        return "Invalid input";
      case "invalid_element":
        return `Invalid value in ${issue2.origin}`;
      default:
        return `Invalid input`;
    }
  };
};
function en_default() {
  return {
    localeError: error9()
  };
}

// node_modules/zod/v4/locales/eo.js
var parsedType3 = (data) => {
  const t2 = typeof data;
  switch (t2) {
    case "number": {
      return Number.isNaN(data) ? "NaN" : "nombro";
    }
    case "object": {
      if (Array.isArray(data)) {
        return "tabelo";
      }
      if (data === null) {
        return "senvalora";
      }
      if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
        return data.constructor.name;
      }
    }
  }
  return t2;
};
var error10 = () => {
  const Sizable = {
    string: { unit: "karaktrojn", verb: "havi" },
    file: { unit: "bajtojn", verb: "havi" },
    array: { unit: "elementojn", verb: "havi" },
    set: { unit: "elementojn", verb: "havi" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const Nouns = {
    regex: "enigo",
    email: "retadreso",
    url: "URL",
    emoji: "emo\u011Dio",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO-datotempo",
    date: "ISO-dato",
    time: "ISO-tempo",
    duration: "ISO-da\u016Dro",
    ipv4: "IPv4-adreso",
    ipv6: "IPv6-adreso",
    cidrv4: "IPv4-rango",
    cidrv6: "IPv6-rango",
    base64: "64-ume kodita karaktraro",
    base64url: "URL-64-ume kodita karaktraro",
    json_string: "JSON-karaktraro",
    e164: "E.164-nombro",
    jwt: "JWT",
    template_literal: "enigo"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Nevalida enigo: atendi\u011Dis ${issue2.expected}, ricevi\u011Dis ${parsedType3(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Nevalida enigo: atendi\u011Dis ${stringifyPrimitive(issue2.values[0])}`;
        return `Nevalida opcio: atendi\u011Dis unu el ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Tro granda: atendi\u011Dis ke ${issue2.origin ?? "valoro"} havu ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementojn"}`;
        return `Tro granda: atendi\u011Dis ke ${issue2.origin ?? "valoro"} havu ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Tro malgranda: atendi\u011Dis ke ${issue2.origin} havu ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Tro malgranda: atendi\u011Dis ke ${issue2.origin} estu ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Nevalida karaktraro: devas komenci\u011Di per "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Nevalida karaktraro: devas fini\u011Di per "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Nevalida karaktraro: devas inkluzivi "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Nevalida karaktraro: devas kongrui kun la modelo ${_issue.pattern}`;
        return `Nevalida ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Nevalida nombro: devas esti oblo de ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Nekonata${issue2.keys.length > 1 ? "j" : ""} \u015Dlosilo${issue2.keys.length > 1 ? "j" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Nevalida \u015Dlosilo en ${issue2.origin}`;
      case "invalid_union":
        return "Nevalida enigo";
      case "invalid_element":
        return `Nevalida valoro en ${issue2.origin}`;
      default:
        return `Nevalida enigo`;
    }
  };
};
function eo_default() {
  return {
    localeError: error10()
  };
}

// node_modules/zod/v4/locales/es.js
var error11 = () => {
  const Sizable = {
    string: { unit: "caracteres", verb: "tener" },
    file: { unit: "bytes", verb: "tener" },
    array: { unit: "elementos", verb: "tener" },
    set: { unit: "elementos", verb: "tener" }
  };
  const TypeNames = {
    string: "texto",
    number: "n\xFAmero",
    boolean: "booleano",
    array: "arreglo",
    object: "objeto",
    set: "conjunto",
    file: "archivo",
    date: "fecha",
    bigint: "n\xFAmero grande",
    symbol: "s\xEDmbolo",
    undefined: "indefinido",
    null: "nulo",
    function: "funci\xF3n",
    map: "mapa",
    record: "registro",
    tuple: "tupla",
    enum: "enumeraci\xF3n",
    union: "uni\xF3n",
    literal: "literal",
    promise: "promesa",
    void: "vac\xEDo",
    never: "nunca",
    unknown: "desconocido",
    any: "cualquiera"
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  function getTypeName(type) {
    return TypeNames[type] ?? type;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "number";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "array";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype) {
          return data.constructor.name;
        }
        return "object";
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "entrada",
    email: "direcci\xF3n de correo electr\xF3nico",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "fecha y hora ISO",
    date: "fecha ISO",
    time: "hora ISO",
    duration: "duraci\xF3n ISO",
    ipv4: "direcci\xF3n IPv4",
    ipv6: "direcci\xF3n IPv6",
    cidrv4: "rango IPv4",
    cidrv6: "rango IPv6",
    base64: "cadena codificada en base64",
    base64url: "URL codificada en base64",
    json_string: "cadena JSON",
    e164: "n\xFAmero E.164",
    jwt: "JWT",
    template_literal: "entrada"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Entrada inv\xE1lida: se esperaba ${getTypeName(issue2.expected)}, recibido ${getTypeName(parsedType8(issue2.input))}`;
      // return `Entrada inválida: se esperaba ${issue.expected}, recibido ${util.getParsedType(issue.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Entrada inv\xE1lida: se esperaba ${stringifyPrimitive(issue2.values[0])}`;
        return `Opci\xF3n inv\xE1lida: se esperaba una de ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        const origin = getTypeName(issue2.origin);
        if (sizing)
          return `Demasiado grande: se esperaba que ${origin ?? "valor"} tuviera ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementos"}`;
        return `Demasiado grande: se esperaba que ${origin ?? "valor"} fuera ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        const origin = getTypeName(issue2.origin);
        if (sizing) {
          return `Demasiado peque\xF1o: se esperaba que ${origin} tuviera ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Demasiado peque\xF1o: se esperaba que ${origin} fuera ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Cadena inv\xE1lida: debe comenzar con "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Cadena inv\xE1lida: debe terminar en "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Cadena inv\xE1lida: debe incluir "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Cadena inv\xE1lida: debe coincidir con el patr\xF3n ${_issue.pattern}`;
        return `Inv\xE1lido ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `N\xFAmero inv\xE1lido: debe ser m\xFAltiplo de ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Llave${issue2.keys.length > 1 ? "s" : ""} desconocida${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Llave inv\xE1lida en ${getTypeName(issue2.origin)}`;
      case "invalid_union":
        return "Entrada inv\xE1lida";
      case "invalid_element":
        return `Valor inv\xE1lido en ${getTypeName(issue2.origin)}`;
      default:
        return `Entrada inv\xE1lida`;
    }
  };
};
function es_default() {
  return {
    localeError: error11()
  };
}

// node_modules/zod/v4/locales/fa.js
var error12 = () => {
  const Sizable = {
    string: { unit: "\u06A9\u0627\u0631\u0627\u06A9\u062A\u0631", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" },
    file: { unit: "\u0628\u0627\u06CC\u062A", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" },
    array: { unit: "\u0622\u06CC\u062A\u0645", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" },
    set: { unit: "\u0622\u06CC\u062A\u0645", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "\u0639\u062F\u062F";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "\u0622\u0631\u0627\u06CC\u0647";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "\u0648\u0631\u0648\u062F\u06CC",
    email: "\u0622\u062F\u0631\u0633 \u0627\u06CC\u0645\u06CC\u0644",
    url: "URL",
    emoji: "\u0627\u06CC\u0645\u0648\u062C\u06CC",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "\u062A\u0627\u0631\u06CC\u062E \u0648 \u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
    date: "\u062A\u0627\u0631\u06CC\u062E \u0627\u06CC\u0632\u0648",
    time: "\u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
    duration: "\u0645\u062F\u062A \u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
    ipv4: "IPv4 \u0622\u062F\u0631\u0633",
    ipv6: "IPv6 \u0622\u062F\u0631\u0633",
    cidrv4: "IPv4 \u062F\u0627\u0645\u0646\u0647",
    cidrv6: "IPv6 \u062F\u0627\u0645\u0646\u0647",
    base64: "base64-encoded \u0631\u0634\u062A\u0647",
    base64url: "base64url-encoded \u0631\u0634\u062A\u0647",
    json_string: "JSON \u0631\u0634\u062A\u0647",
    e164: "E.164 \u0639\u062F\u062F",
    jwt: "JWT",
    template_literal: "\u0648\u0631\u0648\u062F\u06CC"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${issue2.expected} \u0645\u06CC\u200C\u0628\u0648\u062F\u060C ${parsedType8(issue2.input)} \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F`;
      case "invalid_value":
        if (issue2.values.length === 1) {
          return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${stringifyPrimitive(issue2.values[0])} \u0645\u06CC\u200C\u0628\u0648\u062F`;
        }
        return `\u06AF\u0632\u06CC\u0646\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A \u06CC\u06A9\u06CC \u0627\u0632 ${joinValues(issue2.values, "|")} \u0645\u06CC\u200C\u0628\u0648\u062F`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${issue2.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0639\u0646\u0635\u0631"} \u0628\u0627\u0634\u062F`;
        }
        return `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${issue2.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${adj}${issue2.maximum.toString()} \u0628\u0627\u0634\u062F`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${issue2.origin} \u0628\u0627\u06CC\u062F ${adj}${issue2.minimum.toString()} ${sizing.unit} \u0628\u0627\u0634\u062F`;
        }
        return `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${issue2.origin} \u0628\u0627\u06CC\u062F ${adj}${issue2.minimum.toString()} \u0628\u0627\u0634\u062F`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${_issue.prefix}" \u0634\u0631\u0648\u0639 \u0634\u0648\u062F`;
        }
        if (_issue.format === "ends_with") {
          return `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${_issue.suffix}" \u062A\u0645\u0627\u0645 \u0634\u0648\u062F`;
        }
        if (_issue.format === "includes") {
          return `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0634\u0627\u0645\u0644 "${_issue.includes}" \u0628\u0627\u0634\u062F`;
        }
        if (_issue.format === "regex") {
          return `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 \u0627\u0644\u06AF\u0648\u06CC ${_issue.pattern} \u0645\u0637\u0627\u0628\u0642\u062A \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F`;
        }
        return `${Nouns[_issue.format] ?? issue2.format} \u0646\u0627\u0645\u0639\u062A\u0628\u0631`;
      }
      case "not_multiple_of":
        return `\u0639\u062F\u062F \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0645\u0636\u0631\u0628 ${issue2.divisor} \u0628\u0627\u0634\u062F`;
      case "unrecognized_keys":
        return `\u06A9\u0644\u06CC\u062F${issue2.keys.length > 1 ? "\u0647\u0627\u06CC" : ""} \u0646\u0627\u0634\u0646\u0627\u0633: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u06A9\u0644\u06CC\u062F \u0646\u0627\u0634\u0646\u0627\u0633 \u062F\u0631 ${issue2.origin}`;
      case "invalid_union":
        return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631`;
      case "invalid_element":
        return `\u0645\u0642\u062F\u0627\u0631 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u062F\u0631 ${issue2.origin}`;
      default:
        return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631`;
    }
  };
};
function fa_default() {
  return {
    localeError: error12()
  };
}

// node_modules/zod/v4/locales/fi.js
var error13 = () => {
  const Sizable = {
    string: { unit: "merkki\xE4", subject: "merkkijonon" },
    file: { unit: "tavua", subject: "tiedoston" },
    array: { unit: "alkiota", subject: "listan" },
    set: { unit: "alkiota", subject: "joukon" },
    number: { unit: "", subject: "luvun" },
    bigint: { unit: "", subject: "suuren kokonaisluvun" },
    int: { unit: "", subject: "kokonaisluvun" },
    date: { unit: "", subject: "p\xE4iv\xE4m\xE4\xE4r\xE4n" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "number";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "array";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "s\xE4\xE4nn\xF6llinen lauseke",
    email: "s\xE4hk\xF6postiosoite",
    url: "URL-osoite",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO-aikaleima",
    date: "ISO-p\xE4iv\xE4m\xE4\xE4r\xE4",
    time: "ISO-aika",
    duration: "ISO-kesto",
    ipv4: "IPv4-osoite",
    ipv6: "IPv6-osoite",
    cidrv4: "IPv4-alue",
    cidrv6: "IPv6-alue",
    base64: "base64-koodattu merkkijono",
    base64url: "base64url-koodattu merkkijono",
    json_string: "JSON-merkkijono",
    e164: "E.164-luku",
    jwt: "JWT",
    template_literal: "templaattimerkkijono"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Virheellinen tyyppi: odotettiin ${issue2.expected}, oli ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Virheellinen sy\xF6te: t\xE4ytyy olla ${stringifyPrimitive(issue2.values[0])}`;
        return `Virheellinen valinta: t\xE4ytyy olla yksi seuraavista: ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Liian suuri: ${sizing.subject} t\xE4ytyy olla ${adj}${issue2.maximum.toString()} ${sizing.unit}`.trim();
        }
        return `Liian suuri: arvon t\xE4ytyy olla ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Liian pieni: ${sizing.subject} t\xE4ytyy olla ${adj}${issue2.minimum.toString()} ${sizing.unit}`.trim();
        }
        return `Liian pieni: arvon t\xE4ytyy olla ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Virheellinen sy\xF6te: t\xE4ytyy alkaa "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Virheellinen sy\xF6te: t\xE4ytyy loppua "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Virheellinen sy\xF6te: t\xE4ytyy sis\xE4lt\xE4\xE4 "${_issue.includes}"`;
        if (_issue.format === "regex") {
          return `Virheellinen sy\xF6te: t\xE4ytyy vastata s\xE4\xE4nn\xF6llist\xE4 lauseketta ${_issue.pattern}`;
        }
        return `Virheellinen ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Virheellinen luku: t\xE4ytyy olla luvun ${issue2.divisor} monikerta`;
      case "unrecognized_keys":
        return `${issue2.keys.length > 1 ? "Tuntemattomat avaimet" : "Tuntematon avain"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return "Virheellinen avain tietueessa";
      case "invalid_union":
        return "Virheellinen unioni";
      case "invalid_element":
        return "Virheellinen arvo joukossa";
      default:
        return `Virheellinen sy\xF6te`;
    }
  };
};
function fi_default() {
  return {
    localeError: error13()
  };
}

// node_modules/zod/v4/locales/fr.js
var error14 = () => {
  const Sizable = {
    string: { unit: "caract\xE8res", verb: "avoir" },
    file: { unit: "octets", verb: "avoir" },
    array: { unit: "\xE9l\xE9ments", verb: "avoir" },
    set: { unit: "\xE9l\xE9ments", verb: "avoir" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "nombre";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "tableau";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "entr\xE9e",
    email: "adresse e-mail",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "date et heure ISO",
    date: "date ISO",
    time: "heure ISO",
    duration: "dur\xE9e ISO",
    ipv4: "adresse IPv4",
    ipv6: "adresse IPv6",
    cidrv4: "plage IPv4",
    cidrv6: "plage IPv6",
    base64: "cha\xEEne encod\xE9e en base64",
    base64url: "cha\xEEne encod\xE9e en base64url",
    json_string: "cha\xEEne JSON",
    e164: "num\xE9ro E.164",
    jwt: "JWT",
    template_literal: "entr\xE9e"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Entr\xE9e invalide : ${issue2.expected} attendu, ${parsedType8(issue2.input)} re\xE7u`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Entr\xE9e invalide : ${stringifyPrimitive(issue2.values[0])} attendu`;
        return `Option invalide : une valeur parmi ${joinValues(issue2.values, "|")} attendue`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Trop grand : ${issue2.origin ?? "valeur"} doit ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\xE9l\xE9ment(s)"}`;
        return `Trop grand : ${issue2.origin ?? "valeur"} doit \xEAtre ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Trop petit : ${issue2.origin} doit ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Trop petit : ${issue2.origin} doit \xEAtre ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Cha\xEEne invalide : doit commencer par "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Cha\xEEne invalide : doit se terminer par "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Cha\xEEne invalide : doit inclure "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Cha\xEEne invalide : doit correspondre au mod\xE8le ${_issue.pattern}`;
        return `${Nouns[_issue.format] ?? issue2.format} invalide`;
      }
      case "not_multiple_of":
        return `Nombre invalide : doit \xEAtre un multiple de ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Cl\xE9${issue2.keys.length > 1 ? "s" : ""} non reconnue${issue2.keys.length > 1 ? "s" : ""} : ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Cl\xE9 invalide dans ${issue2.origin}`;
      case "invalid_union":
        return "Entr\xE9e invalide";
      case "invalid_element":
        return `Valeur invalide dans ${issue2.origin}`;
      default:
        return `Entr\xE9e invalide`;
    }
  };
};
function fr_default() {
  return {
    localeError: error14()
  };
}

// node_modules/zod/v4/locales/fr-CA.js
var error15 = () => {
  const Sizable = {
    string: { unit: "caract\xE8res", verb: "avoir" },
    file: { unit: "octets", verb: "avoir" },
    array: { unit: "\xE9l\xE9ments", verb: "avoir" },
    set: { unit: "\xE9l\xE9ments", verb: "avoir" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "number";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "array";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "entr\xE9e",
    email: "adresse courriel",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "date-heure ISO",
    date: "date ISO",
    time: "heure ISO",
    duration: "dur\xE9e ISO",
    ipv4: "adresse IPv4",
    ipv6: "adresse IPv6",
    cidrv4: "plage IPv4",
    cidrv6: "plage IPv6",
    base64: "cha\xEEne encod\xE9e en base64",
    base64url: "cha\xEEne encod\xE9e en base64url",
    json_string: "cha\xEEne JSON",
    e164: "num\xE9ro E.164",
    jwt: "JWT",
    template_literal: "entr\xE9e"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Entr\xE9e invalide : attendu ${issue2.expected}, re\xE7u ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Entr\xE9e invalide : attendu ${stringifyPrimitive(issue2.values[0])}`;
        return `Option invalide : attendu l'une des valeurs suivantes ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "\u2264" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Trop grand : attendu que ${issue2.origin ?? "la valeur"} ait ${adj}${issue2.maximum.toString()} ${sizing.unit}`;
        return `Trop grand : attendu que ${issue2.origin ?? "la valeur"} soit ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? "\u2265" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Trop petit : attendu que ${issue2.origin} ait ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Trop petit : attendu que ${issue2.origin} soit ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `Cha\xEEne invalide : doit commencer par "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `Cha\xEEne invalide : doit se terminer par "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Cha\xEEne invalide : doit inclure "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Cha\xEEne invalide : doit correspondre au motif ${_issue.pattern}`;
        return `${Nouns[_issue.format] ?? issue2.format} invalide`;
      }
      case "not_multiple_of":
        return `Nombre invalide : doit \xEAtre un multiple de ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Cl\xE9${issue2.keys.length > 1 ? "s" : ""} non reconnue${issue2.keys.length > 1 ? "s" : ""} : ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Cl\xE9 invalide dans ${issue2.origin}`;
      case "invalid_union":
        return "Entr\xE9e invalide";
      case "invalid_element":
        return `Valeur invalide dans ${issue2.origin}`;
      default:
        return `Entr\xE9e invalide`;
    }
  };
};
function fr_CA_default() {
  return {
    localeError: error15()
  };
}

// node_modules/zod/v4/locales/he.js
var error16 = () => {
  const TypeNames = {
    string: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA", gender: "f" },
    number: { label: "\u05DE\u05E1\u05E4\u05E8", gender: "m" },
    boolean: { label: "\u05E2\u05E8\u05DA \u05D1\u05D5\u05DC\u05D9\u05D0\u05E0\u05D9", gender: "m" },
    bigint: { label: "BigInt", gender: "m" },
    date: { label: "\u05EA\u05D0\u05E8\u05D9\u05DA", gender: "m" },
    array: { label: "\u05DE\u05E2\u05E8\u05DA", gender: "m" },
    object: { label: "\u05D0\u05D5\u05D1\u05D9\u05D9\u05E7\u05D8", gender: "m" },
    null: { label: "\u05E2\u05E8\u05DA \u05E8\u05D9\u05E7 (null)", gender: "m" },
    undefined: { label: "\u05E2\u05E8\u05DA \u05DC\u05D0 \u05DE\u05D5\u05D2\u05D3\u05E8 (undefined)", gender: "m" },
    symbol: { label: "\u05E1\u05D9\u05DE\u05D1\u05D5\u05DC (Symbol)", gender: "m" },
    function: { label: "\u05E4\u05D5\u05E0\u05E7\u05E6\u05D9\u05D4", gender: "f" },
    map: { label: "\u05DE\u05E4\u05D4 (Map)", gender: "f" },
    set: { label: "\u05E7\u05D1\u05D5\u05E6\u05D4 (Set)", gender: "f" },
    file: { label: "\u05E7\u05D5\u05D1\u05E5", gender: "m" },
    promise: { label: "Promise", gender: "m" },
    NaN: { label: "NaN", gender: "m" },
    unknown: { label: "\u05E2\u05E8\u05DA \u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2", gender: "m" },
    value: { label: "\u05E2\u05E8\u05DA", gender: "m" }
  };
  const Sizable = {
    string: { unit: "\u05EA\u05D5\u05D5\u05D9\u05DD", shortLabel: "\u05E7\u05E6\u05E8", longLabel: "\u05D0\u05E8\u05D5\u05DA" },
    file: { unit: "\u05D1\u05D9\u05D9\u05D8\u05D9\u05DD", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" },
    array: { unit: "\u05E4\u05E8\u05D9\u05D8\u05D9\u05DD", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" },
    set: { unit: "\u05E4\u05E8\u05D9\u05D8\u05D9\u05DD", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" },
    number: { unit: "", shortLabel: "\u05E7\u05D8\u05DF", longLabel: "\u05D2\u05D3\u05D5\u05DC" }
    // no unit
  };
  const typeEntry = (t2) => t2 ? TypeNames[t2] : void 0;
  const typeLabel = (t2) => {
    const e = typeEntry(t2);
    if (e)
      return e.label;
    return t2 ?? TypeNames.unknown.label;
  };
  const withDefinite = (t2) => `\u05D4${typeLabel(t2)}`;
  const verbFor = (t2) => {
    const e = typeEntry(t2);
    const gender = e?.gender ?? "m";
    return gender === "f" ? "\u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05D9\u05D5\u05EA" : "\u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA";
  };
  const getSizing = (origin) => {
    if (!origin)
      return null;
    return Sizable[origin] ?? null;
  };
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number":
        return Number.isNaN(data) ? "NaN" : "number";
      case "object": {
        if (Array.isArray(data))
          return "array";
        if (data === null)
          return "null";
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
        return "object";
      }
      default:
        return t2;
    }
  };
  const Nouns = {
    regex: { label: "\u05E7\u05DC\u05D8", gender: "m" },
    email: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA \u05D0\u05D9\u05DE\u05D9\u05D9\u05DC", gender: "f" },
    url: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA \u05E8\u05E9\u05EA", gender: "f" },
    emoji: { label: "\u05D0\u05D9\u05DE\u05D5\u05D2'\u05D9", gender: "m" },
    uuid: { label: "UUID", gender: "m" },
    nanoid: { label: "nanoid", gender: "m" },
    guid: { label: "GUID", gender: "m" },
    cuid: { label: "cuid", gender: "m" },
    cuid2: { label: "cuid2", gender: "m" },
    ulid: { label: "ULID", gender: "m" },
    xid: { label: "XID", gender: "m" },
    ksuid: { label: "KSUID", gender: "m" },
    datetime: { label: "\u05EA\u05D0\u05E8\u05D9\u05DA \u05D5\u05D6\u05DE\u05DF ISO", gender: "m" },
    date: { label: "\u05EA\u05D0\u05E8\u05D9\u05DA ISO", gender: "m" },
    time: { label: "\u05D6\u05DE\u05DF ISO", gender: "m" },
    duration: { label: "\u05DE\u05E9\u05DA \u05D6\u05DE\u05DF ISO", gender: "m" },
    ipv4: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA IPv4", gender: "f" },
    ipv6: { label: "\u05DB\u05EA\u05D5\u05D1\u05EA IPv6", gender: "f" },
    cidrv4: { label: "\u05D8\u05D5\u05D5\u05D7 IPv4", gender: "m" },
    cidrv6: { label: "\u05D8\u05D5\u05D5\u05D7 IPv6", gender: "m" },
    base64: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D1\u05D1\u05E1\u05D9\u05E1 64", gender: "f" },
    base64url: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D1\u05D1\u05E1\u05D9\u05E1 64 \u05DC\u05DB\u05EA\u05D5\u05D1\u05D5\u05EA \u05E8\u05E9\u05EA", gender: "f" },
    json_string: { label: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA JSON", gender: "f" },
    e164: { label: "\u05DE\u05E1\u05E4\u05E8 E.164", gender: "m" },
    jwt: { label: "JWT", gender: "m" },
    ends_with: { label: "\u05E7\u05DC\u05D8", gender: "m" },
    includes: { label: "\u05E7\u05DC\u05D8", gender: "m" },
    lowercase: { label: "\u05E7\u05DC\u05D8", gender: "m" },
    starts_with: { label: "\u05E7\u05DC\u05D8", gender: "m" },
    uppercase: { label: "\u05E7\u05DC\u05D8", gender: "m" }
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expectedKey = issue2.expected;
        const expected = typeLabel(expectedKey);
        const receivedKey = parsedType8(issue2.input);
        const received = TypeNames[receivedKey]?.label ?? receivedKey;
        return `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${expected}, \u05D4\u05EA\u05E7\u05D1\u05DC ${received}`;
      }
      case "invalid_value": {
        if (issue2.values.length === 1) {
          return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05E2\u05E8\u05DA \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA ${stringifyPrimitive(issue2.values[0])}`;
        }
        const stringified = issue2.values.map((v) => stringifyPrimitive(v));
        if (issue2.values.length === 2) {
          return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05D4\u05DF ${stringified[0]} \u05D0\u05D5 ${stringified[1]}`;
        }
        const lastValue = stringified[stringified.length - 1];
        const restValues = stringified.slice(0, -1).join(", ");
        return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05DE\u05EA\u05D0\u05D9\u05DE\u05D5\u05EA \u05D4\u05DF ${restValues} \u05D0\u05D5 ${lastValue}`;
      }
      case "too_big": {
        const sizing = getSizing(issue2.origin);
        const subject = withDefinite(issue2.origin ?? "value");
        if (issue2.origin === "string") {
          return `${sizing?.longLabel ?? "\u05D0\u05E8\u05D5\u05DA"} \u05DE\u05D3\u05D9: ${subject} \u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05DB\u05D9\u05DC ${issue2.maximum.toString()} ${sizing?.unit ?? ""} ${issue2.inclusive ? "\u05D0\u05D5 \u05E4\u05D7\u05D5\u05EA" : "\u05DC\u05DB\u05DC \u05D4\u05D9\u05D5\u05EA\u05E8"}`.trim();
        }
        if (issue2.origin === "number") {
          const comparison = issue2.inclusive ? `\u05E7\u05D8\u05DF \u05D0\u05D5 \u05E9\u05D5\u05D5\u05D4 \u05DC-${issue2.maximum}` : `\u05E7\u05D8\u05DF \u05DE-${issue2.maximum}`;
          return `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${subject} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${comparison}`;
        }
        if (issue2.origin === "array" || issue2.origin === "set") {
          const verb = issue2.origin === "set" ? "\u05E6\u05E8\u05D9\u05DB\u05D4" : "\u05E6\u05E8\u05D9\u05DA";
          const comparison = issue2.inclusive ? `${issue2.maximum} ${sizing?.unit ?? ""} \u05D0\u05D5 \u05E4\u05D7\u05D5\u05EA` : `\u05E4\u05D7\u05D5\u05EA \u05DE-${issue2.maximum} ${sizing?.unit ?? ""}`;
          return `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${subject} ${verb} \u05DC\u05D4\u05DB\u05D9\u05DC ${comparison}`.trim();
        }
        const adj = issue2.inclusive ? "<=" : "<";
        const be = verbFor(issue2.origin ?? "value");
        if (sizing?.unit) {
          return `${sizing.longLabel} \u05DE\u05D3\u05D9: ${subject} ${be} ${adj}${issue2.maximum.toString()} ${sizing.unit}`;
        }
        return `${sizing?.longLabel ?? "\u05D2\u05D3\u05D5\u05DC"} \u05DE\u05D3\u05D9: ${subject} ${be} ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const sizing = getSizing(issue2.origin);
        const subject = withDefinite(issue2.origin ?? "value");
        if (issue2.origin === "string") {
          return `${sizing?.shortLabel ?? "\u05E7\u05E6\u05E8"} \u05DE\u05D3\u05D9: ${subject} \u05E6\u05E8\u05D9\u05DB\u05D4 \u05DC\u05D4\u05DB\u05D9\u05DC ${issue2.minimum.toString()} ${sizing?.unit ?? ""} ${issue2.inclusive ? "\u05D0\u05D5 \u05D9\u05D5\u05EA\u05E8" : "\u05DC\u05E4\u05D7\u05D5\u05EA"}`.trim();
        }
        if (issue2.origin === "number") {
          const comparison = issue2.inclusive ? `\u05D2\u05D3\u05D5\u05DC \u05D0\u05D5 \u05E9\u05D5\u05D5\u05D4 \u05DC-${issue2.minimum}` : `\u05D2\u05D3\u05D5\u05DC \u05DE-${issue2.minimum}`;
          return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${subject} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${comparison}`;
        }
        if (issue2.origin === "array" || issue2.origin === "set") {
          const verb = issue2.origin === "set" ? "\u05E6\u05E8\u05D9\u05DB\u05D4" : "\u05E6\u05E8\u05D9\u05DA";
          if (issue2.minimum === 1 && issue2.inclusive) {
            const singularPhrase = issue2.origin === "set" ? "\u05DC\u05E4\u05D7\u05D5\u05EA \u05E4\u05E8\u05D9\u05D8 \u05D0\u05D7\u05D3" : "\u05DC\u05E4\u05D7\u05D5\u05EA \u05E4\u05E8\u05D9\u05D8 \u05D0\u05D7\u05D3";
            return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${subject} ${verb} \u05DC\u05D4\u05DB\u05D9\u05DC ${singularPhrase}`;
          }
          const comparison = issue2.inclusive ? `${issue2.minimum} ${sizing?.unit ?? ""} \u05D0\u05D5 \u05D9\u05D5\u05EA\u05E8` : `\u05D9\u05D5\u05EA\u05E8 \u05DE-${issue2.minimum} ${sizing?.unit ?? ""}`;
          return `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${subject} ${verb} \u05DC\u05D4\u05DB\u05D9\u05DC ${comparison}`.trim();
        }
        const adj = issue2.inclusive ? ">=" : ">";
        const be = verbFor(issue2.origin ?? "value");
        if (sizing?.unit) {
          return `${sizing.shortLabel} \u05DE\u05D3\u05D9: ${subject} ${be} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `${sizing?.shortLabel ?? "\u05E7\u05D8\u05DF"} \u05DE\u05D3\u05D9: ${subject} ${be} ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D7\u05D9\u05DC \u05D1 "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05E1\u05EA\u05D9\u05D9\u05DD \u05D1 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05DB\u05DC\u05D5\u05DC "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u05D4\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D0\u05D9\u05DD \u05DC\u05EA\u05D1\u05E0\u05D9\u05EA ${_issue.pattern}`;
        const nounEntry = Nouns[_issue.format];
        const noun = nounEntry?.label ?? _issue.format;
        const gender = nounEntry?.gender ?? "m";
        const adjective = gender === "f" ? "\u05EA\u05E7\u05D9\u05E0\u05D4" : "\u05EA\u05E7\u05D9\u05DF";
        return `${noun} \u05DC\u05D0 ${adjective}`;
      }
      case "not_multiple_of":
        return `\u05DE\u05E1\u05E4\u05E8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA \u05DE\u05DB\u05E4\u05DC\u05D4 \u05E9\u05DC ${issue2.divisor}`;
      case "unrecognized_keys":
        return `\u05DE\u05E4\u05EA\u05D7${issue2.keys.length > 1 ? "\u05D5\u05EA" : ""} \u05DC\u05D0 \u05DE\u05D6\u05D5\u05D4${issue2.keys.length > 1 ? "\u05D9\u05DD" : "\u05D4"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key": {
        return `\u05E9\u05D3\u05D4 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1\u05D0\u05D5\u05D1\u05D9\u05D9\u05E7\u05D8`;
      }
      case "invalid_union":
        return "\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF";
      case "invalid_element": {
        const place = withDefinite(issue2.origin ?? "array");
        return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1${place}`;
      }
      default:
        return `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF`;
    }
  };
};
function he_default() {
  return {
    localeError: error16()
  };
}

// node_modules/zod/v4/locales/hu.js
var error17 = () => {
  const Sizable = {
    string: { unit: "karakter", verb: "legyen" },
    file: { unit: "byte", verb: "legyen" },
    array: { unit: "elem", verb: "legyen" },
    set: { unit: "elem", verb: "legyen" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "sz\xE1m";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "t\xF6mb";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "bemenet",
    email: "email c\xEDm",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO id\u0151b\xE9lyeg",
    date: "ISO d\xE1tum",
    time: "ISO id\u0151",
    duration: "ISO id\u0151intervallum",
    ipv4: "IPv4 c\xEDm",
    ipv6: "IPv6 c\xEDm",
    cidrv4: "IPv4 tartom\xE1ny",
    cidrv6: "IPv6 tartom\xE1ny",
    base64: "base64-k\xF3dolt string",
    base64url: "base64url-k\xF3dolt string",
    json_string: "JSON string",
    e164: "E.164 sz\xE1m",
    jwt: "JWT",
    template_literal: "bemenet"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${issue2.expected}, a kapott \xE9rt\xE9k ${parsedType8(issue2.input)}`;
      // return `Invalid input: expected ${issue.expected}, received ${util.getParsedType(issue.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${stringifyPrimitive(issue2.values[0])}`;
        return `\xC9rv\xE9nytelen opci\xF3: valamelyik \xE9rt\xE9k v\xE1rt ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `T\xFAl nagy: ${issue2.origin ?? "\xE9rt\xE9k"} m\xE9rete t\xFAl nagy ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elem"}`;
        return `T\xFAl nagy: a bemeneti \xE9rt\xE9k ${issue2.origin ?? "\xE9rt\xE9k"} t\xFAl nagy: ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${issue2.origin} m\xE9rete t\xFAl kicsi ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${issue2.origin} t\xFAl kicsi ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\xC9rv\xE9nytelen string: "${_issue.prefix}" \xE9rt\xE9kkel kell kezd\u0151dnie`;
        if (_issue.format === "ends_with")
          return `\xC9rv\xE9nytelen string: "${_issue.suffix}" \xE9rt\xE9kkel kell v\xE9gz\u0151dnie`;
        if (_issue.format === "includes")
          return `\xC9rv\xE9nytelen string: "${_issue.includes}" \xE9rt\xE9ket kell tartalmaznia`;
        if (_issue.format === "regex")
          return `\xC9rv\xE9nytelen string: ${_issue.pattern} mint\xE1nak kell megfelelnie`;
        return `\xC9rv\xE9nytelen ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\xC9rv\xE9nytelen sz\xE1m: ${issue2.divisor} t\xF6bbsz\xF6r\xF6s\xE9nek kell lennie`;
      case "unrecognized_keys":
        return `Ismeretlen kulcs${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\xC9rv\xE9nytelen kulcs ${issue2.origin}`;
      case "invalid_union":
        return "\xC9rv\xE9nytelen bemenet";
      case "invalid_element":
        return `\xC9rv\xE9nytelen \xE9rt\xE9k: ${issue2.origin}`;
      default:
        return `\xC9rv\xE9nytelen bemenet`;
    }
  };
};
function hu_default() {
  return {
    localeError: error17()
  };
}

// node_modules/zod/v4/locales/id.js
var error18 = () => {
  const Sizable = {
    string: { unit: "karakter", verb: "memiliki" },
    file: { unit: "byte", verb: "memiliki" },
    array: { unit: "item", verb: "memiliki" },
    set: { unit: "item", verb: "memiliki" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "number";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "array";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "input",
    email: "alamat email",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "tanggal dan waktu format ISO",
    date: "tanggal format ISO",
    time: "jam format ISO",
    duration: "durasi format ISO",
    ipv4: "alamat IPv4",
    ipv6: "alamat IPv6",
    cidrv4: "rentang alamat IPv4",
    cidrv6: "rentang alamat IPv6",
    base64: "string dengan enkode base64",
    base64url: "string dengan enkode base64url",
    json_string: "string JSON",
    e164: "angka E.164",
    jwt: "JWT",
    template_literal: "input"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Input tidak valid: diharapkan ${issue2.expected}, diterima ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Input tidak valid: diharapkan ${stringifyPrimitive(issue2.values[0])}`;
        return `Pilihan tidak valid: diharapkan salah satu dari ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Terlalu besar: diharapkan ${issue2.origin ?? "value"} memiliki ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elemen"}`;
        return `Terlalu besar: diharapkan ${issue2.origin ?? "value"} menjadi ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Terlalu kecil: diharapkan ${issue2.origin} memiliki ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Terlalu kecil: diharapkan ${issue2.origin} menjadi ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `String tidak valid: harus dimulai dengan "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `String tidak valid: harus berakhir dengan "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `String tidak valid: harus menyertakan "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `String tidak valid: harus sesuai pola ${_issue.pattern}`;
        return `${Nouns[_issue.format] ?? issue2.format} tidak valid`;
      }
      case "not_multiple_of":
        return `Angka tidak valid: harus kelipatan dari ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Kunci tidak dikenali ${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Kunci tidak valid di ${issue2.origin}`;
      case "invalid_union":
        return "Input tidak valid";
      case "invalid_element":
        return `Nilai tidak valid di ${issue2.origin}`;
      default:
        return `Input tidak valid`;
    }
  };
};
function id_default() {
  return {
    localeError: error18()
  };
}

// node_modules/zod/v4/locales/is.js
var parsedType4 = (data) => {
  const t2 = typeof data;
  switch (t2) {
    case "number": {
      return Number.isNaN(data) ? "NaN" : "n\xFAmer";
    }
    case "object": {
      if (Array.isArray(data)) {
        return "fylki";
      }
      if (data === null) {
        return "null";
      }
      if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
        return data.constructor.name;
      }
    }
  }
  return t2;
};
var error19 = () => {
  const Sizable = {
    string: { unit: "stafi", verb: "a\xF0 hafa" },
    file: { unit: "b\xE6ti", verb: "a\xF0 hafa" },
    array: { unit: "hluti", verb: "a\xF0 hafa" },
    set: { unit: "hluti", verb: "a\xF0 hafa" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const Nouns = {
    regex: "gildi",
    email: "netfang",
    url: "vefsl\xF3\xF0",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO dagsetning og t\xEDmi",
    date: "ISO dagsetning",
    time: "ISO t\xEDmi",
    duration: "ISO t\xEDmalengd",
    ipv4: "IPv4 address",
    ipv6: "IPv6 address",
    cidrv4: "IPv4 range",
    cidrv6: "IPv6 range",
    base64: "base64-encoded strengur",
    base64url: "base64url-encoded strengur",
    json_string: "JSON strengur",
    e164: "E.164 t\xF6lugildi",
    jwt: "JWT",
    template_literal: "gildi"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Rangt gildi: \xDE\xFA sl\xF3st inn ${parsedType4(issue2.input)} \xFEar sem \xE1 a\xF0 vera ${issue2.expected}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Rangt gildi: gert r\xE1\xF0 fyrir ${stringifyPrimitive(issue2.values[0])}`;
        return `\xD3gilt val: m\xE1 vera eitt af eftirfarandi ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Of st\xF3rt: gert er r\xE1\xF0 fyrir a\xF0 ${issue2.origin ?? "gildi"} hafi ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "hluti"}`;
        return `Of st\xF3rt: gert er r\xE1\xF0 fyrir a\xF0 ${issue2.origin ?? "gildi"} s\xE9 ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Of l\xEDti\xF0: gert er r\xE1\xF0 fyrir a\xF0 ${issue2.origin} hafi ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Of l\xEDti\xF0: gert er r\xE1\xF0 fyrir a\xF0 ${issue2.origin} s\xE9 ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\xD3gildur strengur: ver\xF0ur a\xF0 byrja \xE1 "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `\xD3gildur strengur: ver\xF0ur a\xF0 enda \xE1 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\xD3gildur strengur: ver\xF0ur a\xF0 innihalda "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\xD3gildur strengur: ver\xF0ur a\xF0 fylgja mynstri ${_issue.pattern}`;
        return `Rangt ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `R\xF6ng tala: ver\xF0ur a\xF0 vera margfeldi af ${issue2.divisor}`;
      case "unrecognized_keys":
        return `\xD3\xFEekkt ${issue2.keys.length > 1 ? "ir lyklar" : "ur lykill"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Rangur lykill \xED ${issue2.origin}`;
      case "invalid_union":
        return "Rangt gildi";
      case "invalid_element":
        return `Rangt gildi \xED ${issue2.origin}`;
      default:
        return `Rangt gildi`;
    }
  };
};
function is_default() {
  return {
    localeError: error19()
  };
}

// node_modules/zod/v4/locales/it.js
var error20 = () => {
  const Sizable = {
    string: { unit: "caratteri", verb: "avere" },
    file: { unit: "byte", verb: "avere" },
    array: { unit: "elementi", verb: "avere" },
    set: { unit: "elementi", verb: "avere" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "numero";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "vettore";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "input",
    email: "indirizzo email",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "data e ora ISO",
    date: "data ISO",
    time: "ora ISO",
    duration: "durata ISO",
    ipv4: "indirizzo IPv4",
    ipv6: "indirizzo IPv6",
    cidrv4: "intervallo IPv4",
    cidrv6: "intervallo IPv6",
    base64: "stringa codificata in base64",
    base64url: "URL codificata in base64",
    json_string: "stringa JSON",
    e164: "numero E.164",
    jwt: "JWT",
    template_literal: "input"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Input non valido: atteso ${issue2.expected}, ricevuto ${parsedType8(issue2.input)}`;
      // return `Input non valido: atteso ${issue.expected}, ricevuto ${util.getParsedType(issue.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Input non valido: atteso ${stringifyPrimitive(issue2.values[0])}`;
        return `Opzione non valida: atteso uno tra ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Troppo grande: ${issue2.origin ?? "valore"} deve avere ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementi"}`;
        return `Troppo grande: ${issue2.origin ?? "valore"} deve essere ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Troppo piccolo: ${issue2.origin} deve avere ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Troppo piccolo: ${issue2.origin} deve essere ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Stringa non valida: deve iniziare con "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Stringa non valida: deve terminare con "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Stringa non valida: deve includere "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Stringa non valida: deve corrispondere al pattern ${_issue.pattern}`;
        return `Invalid ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Numero non valido: deve essere un multiplo di ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Chiav${issue2.keys.length > 1 ? "i" : "e"} non riconosciut${issue2.keys.length > 1 ? "e" : "a"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Chiave non valida in ${issue2.origin}`;
      case "invalid_union":
        return "Input non valido";
      case "invalid_element":
        return `Valore non valido in ${issue2.origin}`;
      default:
        return `Input non valido`;
    }
  };
};
function it_default() {
  return {
    localeError: error20()
  };
}

// node_modules/zod/v4/locales/ja.js
var error21 = () => {
  const Sizable = {
    string: { unit: "\u6587\u5B57", verb: "\u3067\u3042\u308B" },
    file: { unit: "\u30D0\u30A4\u30C8", verb: "\u3067\u3042\u308B" },
    array: { unit: "\u8981\u7D20", verb: "\u3067\u3042\u308B" },
    set: { unit: "\u8981\u7D20", verb: "\u3067\u3042\u308B" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "\u6570\u5024";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "\u914D\u5217";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "\u5165\u529B\u5024",
    email: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9",
    url: "URL",
    emoji: "\u7D75\u6587\u5B57",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO\u65E5\u6642",
    date: "ISO\u65E5\u4ED8",
    time: "ISO\u6642\u523B",
    duration: "ISO\u671F\u9593",
    ipv4: "IPv4\u30A2\u30C9\u30EC\u30B9",
    ipv6: "IPv6\u30A2\u30C9\u30EC\u30B9",
    cidrv4: "IPv4\u7BC4\u56F2",
    cidrv6: "IPv6\u7BC4\u56F2",
    base64: "base64\u30A8\u30F3\u30B3\u30FC\u30C9\u6587\u5B57\u5217",
    base64url: "base64url\u30A8\u30F3\u30B3\u30FC\u30C9\u6587\u5B57\u5217",
    json_string: "JSON\u6587\u5B57\u5217",
    e164: "E.164\u756A\u53F7",
    jwt: "JWT",
    template_literal: "\u5165\u529B\u5024"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\u7121\u52B9\u306A\u5165\u529B: ${issue2.expected}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001${parsedType8(issue2.input)}\u304C\u5165\u529B\u3055\u308C\u307E\u3057\u305F`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u7121\u52B9\u306A\u5165\u529B: ${stringifyPrimitive(issue2.values[0])}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F`;
        return `\u7121\u52B9\u306A\u9078\u629E: ${joinValues(issue2.values, "\u3001")}\u306E\u3044\u305A\u308C\u304B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      case "too_big": {
        const adj = issue2.inclusive ? "\u4EE5\u4E0B\u3067\u3042\u308B" : "\u3088\u308A\u5C0F\u3055\u3044";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u5927\u304D\u3059\u304E\u308B\u5024: ${issue2.origin ?? "\u5024"}\u306F${issue2.maximum.toString()}${sizing.unit ?? "\u8981\u7D20"}${adj}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
        return `\u5927\u304D\u3059\u304E\u308B\u5024: ${issue2.origin ?? "\u5024"}\u306F${issue2.maximum.toString()}${adj}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? "\u4EE5\u4E0A\u3067\u3042\u308B" : "\u3088\u308A\u5927\u304D\u3044";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${issue2.origin}\u306F${issue2.minimum.toString()}${sizing.unit}${adj}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
        return `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${issue2.origin}\u306F${issue2.minimum.toString()}${adj}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${_issue.prefix}"\u3067\u59CB\u307E\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
        if (_issue.format === "ends_with")
          return `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${_issue.suffix}"\u3067\u7D42\u308F\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
        if (_issue.format === "includes")
          return `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${_issue.includes}"\u3092\u542B\u3080\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
        if (_issue.format === "regex")
          return `\u7121\u52B9\u306A\u6587\u5B57\u5217: \u30D1\u30BF\u30FC\u30F3${_issue.pattern}\u306B\u4E00\u81F4\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
        return `\u7121\u52B9\u306A${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u7121\u52B9\u306A\u6570\u5024: ${issue2.divisor}\u306E\u500D\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`;
      case "unrecognized_keys":
        return `\u8A8D\u8B58\u3055\u308C\u3066\u3044\u306A\u3044\u30AD\u30FC${issue2.keys.length > 1 ? "\u7FA4" : ""}: ${joinValues(issue2.keys, "\u3001")}`;
      case "invalid_key":
        return `${issue2.origin}\u5185\u306E\u7121\u52B9\u306A\u30AD\u30FC`;
      case "invalid_union":
        return "\u7121\u52B9\u306A\u5165\u529B";
      case "invalid_element":
        return `${issue2.origin}\u5185\u306E\u7121\u52B9\u306A\u5024`;
      default:
        return `\u7121\u52B9\u306A\u5165\u529B`;
    }
  };
};
function ja_default() {
  return {
    localeError: error21()
  };
}

// node_modules/zod/v4/locales/ka.js
var parsedType5 = (data) => {
  const t2 = typeof data;
  switch (t2) {
    case "number": {
      return Number.isNaN(data) ? "NaN" : "\u10E0\u10D8\u10EA\u10EE\u10D5\u10D8";
    }
    case "object": {
      if (Array.isArray(data)) {
        return "\u10DB\u10D0\u10E1\u10D8\u10D5\u10D8";
      }
      if (data === null) {
        return "null";
      }
      if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
        return data.constructor.name;
      }
    }
  }
  const typeMap = {
    string: "\u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
    boolean: "\u10D1\u10E3\u10DA\u10D4\u10D0\u10DC\u10D8",
    undefined: "undefined",
    bigint: "bigint",
    symbol: "symbol",
    function: "\u10E4\u10E3\u10DC\u10E5\u10EA\u10D8\u10D0"
  };
  return typeMap[t2] ?? t2;
};
var error22 = () => {
  const Sizable = {
    string: { unit: "\u10E1\u10D8\u10DB\u10D1\u10DD\u10DA\u10DD", verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1" },
    file: { unit: "\u10D1\u10D0\u10D8\u10E2\u10D8", verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1" },
    array: { unit: "\u10D4\u10DA\u10D4\u10DB\u10D4\u10DC\u10E2\u10D8", verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1" },
    set: { unit: "\u10D4\u10DA\u10D4\u10DB\u10D4\u10DC\u10E2\u10D8", verb: "\u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const Nouns = {
    regex: "\u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0",
    email: "\u10D4\u10DA-\u10E4\u10DD\u10E1\u10E2\u10D8\u10E1 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
    url: "URL",
    emoji: "\u10D4\u10DB\u10DD\u10EF\u10D8",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "\u10D7\u10D0\u10E0\u10D8\u10E6\u10D8-\u10D3\u10E0\u10DD",
    date: "\u10D7\u10D0\u10E0\u10D8\u10E6\u10D8",
    time: "\u10D3\u10E0\u10DD",
    duration: "\u10EE\u10D0\u10DC\u10D2\u10E0\u10EB\u10DA\u10D8\u10D5\u10DD\u10D1\u10D0",
    ipv4: "IPv4 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
    ipv6: "IPv6 \u10DB\u10D8\u10E1\u10D0\u10DB\u10D0\u10E0\u10D7\u10D8",
    cidrv4: "IPv4 \u10D3\u10D8\u10D0\u10DE\u10D0\u10D6\u10DD\u10DC\u10D8",
    cidrv6: "IPv6 \u10D3\u10D8\u10D0\u10DE\u10D0\u10D6\u10DD\u10DC\u10D8",
    base64: "base64-\u10D9\u10DD\u10D3\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
    base64url: "base64url-\u10D9\u10DD\u10D3\u10D8\u10E0\u10D4\u10D1\u10E3\u10DA\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
    json_string: "JSON \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8",
    e164: "E.164 \u10DC\u10DD\u10DB\u10D4\u10E0\u10D8",
    jwt: "JWT",
    template_literal: "\u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.expected}, \u10DB\u10D8\u10E6\u10D4\u10D1\u10E3\u10DA\u10D8 ${parsedType5(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${stringifyPrimitive(issue2.values[0])}`;
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D5\u10D0\u10E0\u10D8\u10D0\u10DC\u10E2\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8\u10D0 \u10D4\u10E0\u10D7-\u10D4\u10E0\u10D7\u10D8 ${joinValues(issue2.values, "|")}-\u10D3\u10D0\u10DC`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10D3\u10D8\u10D3\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.origin ?? "\u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit}`;
        return `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10D3\u10D8\u10D3\u10D8: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.origin ?? "\u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0"} \u10D8\u10E7\u10DD\u10E1 ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10DE\u10D0\u10E2\u10D0\u10E0\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u10D6\u10D4\u10D3\u10DB\u10D4\u10E2\u10D0\u10D3 \u10DE\u10D0\u10E2\u10D0\u10E0\u10D0: \u10DB\u10DD\u10E1\u10D0\u10DA\u10DD\u10D3\u10DC\u10D4\u10DA\u10D8 ${issue2.origin} \u10D8\u10E7\u10DD\u10E1 ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10D8\u10EC\u10E7\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 "${_issue.prefix}"-\u10D8\u10D7`;
        }
        if (_issue.format === "ends_with")
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10DB\u10D7\u10D0\u10D5\u10E0\u10D3\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 "${_issue.suffix}"-\u10D8\u10D7`;
        if (_issue.format === "includes")
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D8\u10EA\u10D0\u10D5\u10D3\u10D4\u10E1 "${_issue.includes}"-\u10E1`;
        if (_issue.format === "regex")
          return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E1\u10E2\u10E0\u10D8\u10DC\u10D2\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10E8\u10D4\u10D4\u10E1\u10D0\u10D1\u10D0\u10DB\u10D4\u10D1\u10DD\u10D3\u10D4\u10E1 \u10E8\u10D0\u10D1\u10DA\u10DD\u10DC\u10E1 ${_issue.pattern}`;
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E0\u10D8\u10EA\u10EE\u10D5\u10D8: \u10E3\u10DC\u10D3\u10D0 \u10D8\u10E7\u10DD\u10E1 ${issue2.divisor}-\u10D8\u10E1 \u10EF\u10D4\u10E0\u10D0\u10D3\u10D8`;
      case "unrecognized_keys":
        return `\u10E3\u10EA\u10DC\u10DD\u10D1\u10D8 \u10D2\u10D0\u10E1\u10D0\u10E6\u10D4\u10D1${issue2.keys.length > 1 ? "\u10D4\u10D1\u10D8" : "\u10D8"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10D2\u10D0\u10E1\u10D0\u10E6\u10D4\u10D1\u10D8 ${issue2.origin}-\u10E8\u10D8`;
      case "invalid_union":
        return "\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0";
      case "invalid_element":
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10DB\u10DC\u10D8\u10E8\u10D5\u10DC\u10D4\u10DA\u10DD\u10D1\u10D0 ${issue2.origin}-\u10E8\u10D8`;
      default:
        return `\u10D0\u10E0\u10D0\u10E1\u10EC\u10DD\u10E0\u10D8 \u10E8\u10D4\u10E7\u10D5\u10D0\u10DC\u10D0`;
    }
  };
};
function ka_default() {
  return {
    localeError: error22()
  };
}

// node_modules/zod/v4/locales/km.js
var error23 = () => {
  const Sizable = {
    string: { unit: "\u178F\u17BD\u17A2\u1780\u17D2\u179F\u179A", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
    file: { unit: "\u1794\u17C3", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
    array: { unit: "\u1792\u17B6\u178F\u17BB", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
    set: { unit: "\u1792\u17B6\u178F\u17BB", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "\u1798\u17B7\u1793\u1798\u17C2\u1793\u1787\u17B6\u179B\u17C1\u1781 (NaN)" : "\u179B\u17C1\u1781";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "\u17A2\u17B6\u179A\u17C1 (Array)";
        }
        if (data === null) {
          return "\u1782\u17D2\u1798\u17B6\u1793\u178F\u1798\u17D2\u179B\u17C3 (null)";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B",
    email: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793\u17A2\u17CA\u17B8\u1798\u17C2\u179B",
    url: "URL",
    emoji: "\u179F\u1789\u17D2\u1789\u17B6\u17A2\u17B6\u179A\u1798\u17D2\u1798\u178E\u17CD",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "\u1780\u17B6\u179B\u1794\u179A\u17B7\u1785\u17D2\u1786\u17C1\u1791 \u1793\u17B7\u1784\u1798\u17C9\u17C4\u1784 ISO",
    date: "\u1780\u17B6\u179B\u1794\u179A\u17B7\u1785\u17D2\u1786\u17C1\u1791 ISO",
    time: "\u1798\u17C9\u17C4\u1784 ISO",
    duration: "\u179A\u1799\u17C8\u1796\u17C1\u179B ISO",
    ipv4: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv4",
    ipv6: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv6",
    cidrv4: "\u178A\u17C2\u1793\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv4",
    cidrv6: "\u178A\u17C2\u1793\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv6",
    base64: "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u17A2\u17CA\u17B7\u1780\u17BC\u178A base64",
    base64url: "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u17A2\u17CA\u17B7\u1780\u17BC\u178A base64url",
    json_string: "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A JSON",
    e164: "\u179B\u17C1\u1781 E.164",
    jwt: "JWT",
    template_literal: "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.expected} \u1794\u17C9\u17BB\u1793\u17D2\u178F\u17C2\u1791\u1791\u17BD\u179B\u1794\u17B6\u1793 ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${stringifyPrimitive(issue2.values[0])}`;
        return `\u1787\u1798\u17D2\u179A\u17BE\u179F\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1787\u17B6\u1798\u17BD\u1799\u1780\u17D2\u1793\u17BB\u1784\u1785\u17C6\u178E\u17C4\u1798 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "\u1792\u17B6\u178F\u17BB"}`;
        return `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${adj} ${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.origin} ${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${issue2.origin} ${adj} ${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798\u178A\u17C4\u1799 "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1794\u1789\u17D2\u1785\u1794\u17CB\u178A\u17C4\u1799 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1798\u17B6\u1793 "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1795\u17D2\u1782\u17BC\u1795\u17D2\u1782\u1784\u1793\u17B9\u1784\u1791\u1798\u17D2\u179A\u1784\u17CB\u178A\u17C2\u179B\u1794\u17B6\u1793\u1780\u17C6\u178E\u178F\u17CB ${_issue.pattern}`;
        return `\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u179B\u17C1\u1781\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1787\u17B6\u1796\u17A0\u17BB\u1782\u17BB\u178E\u1793\u17C3 ${issue2.divisor}`;
      case "unrecognized_keys":
        return `\u179A\u1780\u1783\u17BE\u1789\u179F\u17C4\u1798\u17B7\u1793\u179F\u17D2\u1782\u17B6\u179B\u17CB\u17D6 ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u179F\u17C4\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u1793\u17C5\u1780\u17D2\u1793\u17BB\u1784 ${issue2.origin}`;
      case "invalid_union":
        return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C`;
      case "invalid_element":
        return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u1793\u17C5\u1780\u17D2\u1793\u17BB\u1784 ${issue2.origin}`;
      default:
        return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C`;
    }
  };
};
function km_default() {
  return {
    localeError: error23()
  };
}

// node_modules/zod/v4/locales/kh.js
function kh_default() {
  return km_default();
}

// node_modules/zod/v4/locales/ko.js
var error24 = () => {
  const Sizable = {
    string: { unit: "\uBB38\uC790", verb: "to have" },
    file: { unit: "\uBC14\uC774\uD2B8", verb: "to have" },
    array: { unit: "\uAC1C", verb: "to have" },
    set: { unit: "\uAC1C", verb: "to have" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "number";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "array";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "\uC785\uB825",
    email: "\uC774\uBA54\uC77C \uC8FC\uC18C",
    url: "URL",
    emoji: "\uC774\uBAA8\uC9C0",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO \uB0A0\uC9DC\uC2DC\uAC04",
    date: "ISO \uB0A0\uC9DC",
    time: "ISO \uC2DC\uAC04",
    duration: "ISO \uAE30\uAC04",
    ipv4: "IPv4 \uC8FC\uC18C",
    ipv6: "IPv6 \uC8FC\uC18C",
    cidrv4: "IPv4 \uBC94\uC704",
    cidrv6: "IPv6 \uBC94\uC704",
    base64: "base64 \uC778\uCF54\uB529 \uBB38\uC790\uC5F4",
    base64url: "base64url \uC778\uCF54\uB529 \uBB38\uC790\uC5F4",
    json_string: "JSON \uBB38\uC790\uC5F4",
    e164: "E.164 \uBC88\uD638",
    jwt: "JWT",
    template_literal: "\uC785\uB825"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\uC798\uBABB\uB41C \uC785\uB825: \uC608\uC0C1 \uD0C0\uC785\uC740 ${issue2.expected}, \uBC1B\uC740 \uD0C0\uC785\uC740 ${parsedType8(issue2.input)}\uC785\uB2C8\uB2E4`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\uC798\uBABB\uB41C \uC785\uB825: \uAC12\uC740 ${stringifyPrimitive(issue2.values[0])} \uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4`;
        return `\uC798\uBABB\uB41C \uC635\uC158: ${joinValues(issue2.values, "\uB610\uB294 ")} \uC911 \uD558\uB098\uC5EC\uC57C \uD569\uB2C8\uB2E4`;
      case "too_big": {
        const adj = issue2.inclusive ? "\uC774\uD558" : "\uBBF8\uB9CC";
        const suffix = adj === "\uBBF8\uB9CC" ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4" : "\uC5EC\uC57C \uD569\uB2C8\uB2E4";
        const sizing = getSizing(issue2.origin);
        const unit = sizing?.unit ?? "\uC694\uC18C";
        if (sizing)
          return `${issue2.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${issue2.maximum.toString()}${unit} ${adj}${suffix}`;
        return `${issue2.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${issue2.maximum.toString()} ${adj}${suffix}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? "\uC774\uC0C1" : "\uCD08\uACFC";
        const suffix = adj === "\uC774\uC0C1" ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4" : "\uC5EC\uC57C \uD569\uB2C8\uB2E4";
        const sizing = getSizing(issue2.origin);
        const unit = sizing?.unit ?? "\uC694\uC18C";
        if (sizing) {
          return `${issue2.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${issue2.minimum.toString()}${unit} ${adj}${suffix}`;
        }
        return `${issue2.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${issue2.minimum.toString()} ${adj}${suffix}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${_issue.prefix}"(\uC73C)\uB85C \uC2DC\uC791\uD574\uC57C \uD569\uB2C8\uB2E4`;
        }
        if (_issue.format === "ends_with")
          return `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${_issue.suffix}"(\uC73C)\uB85C \uB05D\uB098\uC57C \uD569\uB2C8\uB2E4`;
        if (_issue.format === "includes")
          return `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${_issue.includes}"\uC744(\uB97C) \uD3EC\uD568\uD574\uC57C \uD569\uB2C8\uB2E4`;
        if (_issue.format === "regex")
          return `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: \uC815\uADDC\uC2DD ${_issue.pattern} \uD328\uD134\uACFC \uC77C\uCE58\uD574\uC57C \uD569\uB2C8\uB2E4`;
        return `\uC798\uBABB\uB41C ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\uC798\uBABB\uB41C \uC22B\uC790: ${issue2.divisor}\uC758 \uBC30\uC218\uC5EC\uC57C \uD569\uB2C8\uB2E4`;
      case "unrecognized_keys":
        return `\uC778\uC2DD\uD560 \uC218 \uC5C6\uB294 \uD0A4: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\uC798\uBABB\uB41C \uD0A4: ${issue2.origin}`;
      case "invalid_union":
        return `\uC798\uBABB\uB41C \uC785\uB825`;
      case "invalid_element":
        return `\uC798\uBABB\uB41C \uAC12: ${issue2.origin}`;
      default:
        return `\uC798\uBABB\uB41C \uC785\uB825`;
    }
  };
};
function ko_default() {
  return {
    localeError: error24()
  };
}

// node_modules/zod/v4/locales/lt.js
var parsedType6 = (data) => {
  const t2 = typeof data;
  return parsedTypeFromType(t2, data);
};
var parsedTypeFromType = (t2, data = void 0) => {
  switch (t2) {
    case "number": {
      return Number.isNaN(data) ? "NaN" : "skai\u010Dius";
    }
    case "bigint": {
      return "sveikasis skai\u010Dius";
    }
    case "string": {
      return "eilut\u0117";
    }
    case "boolean": {
      return "login\u0117 reik\u0161m\u0117";
    }
    case "undefined":
    case "void": {
      return "neapibr\u0117\u017Eta reik\u0161m\u0117";
    }
    case "function": {
      return "funkcija";
    }
    case "symbol": {
      return "simbolis";
    }
    case "object": {
      if (data === void 0)
        return "ne\u017Einomas objektas";
      if (data === null)
        return "nulin\u0117 reik\u0161m\u0117";
      if (Array.isArray(data))
        return "masyvas";
      if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
        return data.constructor.name;
      }
      return "objektas";
    }
    //Zod types below
    case "null": {
      return "nulin\u0117 reik\u0161m\u0117";
    }
  }
  return t2;
};
var capitalizeFirstCharacter = (text11) => {
  return text11.charAt(0).toUpperCase() + text11.slice(1);
};
function getUnitTypeFromNumber(number4) {
  const abs = Math.abs(number4);
  const last = abs % 10;
  const last2 = abs % 100;
  if (last2 >= 11 && last2 <= 19 || last === 0)
    return "many";
  if (last === 1)
    return "one";
  return "few";
}
var error25 = () => {
  const Sizable = {
    string: {
      unit: {
        one: "simbolis",
        few: "simboliai",
        many: "simboli\u0173"
      },
      verb: {
        smaller: {
          inclusive: "turi b\u016Bti ne ilgesn\u0117 kaip",
          notInclusive: "turi b\u016Bti trumpesn\u0117 kaip"
        },
        bigger: {
          inclusive: "turi b\u016Bti ne trumpesn\u0117 kaip",
          notInclusive: "turi b\u016Bti ilgesn\u0117 kaip"
        }
      }
    },
    file: {
      unit: {
        one: "baitas",
        few: "baitai",
        many: "bait\u0173"
      },
      verb: {
        smaller: {
          inclusive: "turi b\u016Bti ne didesnis kaip",
          notInclusive: "turi b\u016Bti ma\u017Eesnis kaip"
        },
        bigger: {
          inclusive: "turi b\u016Bti ne ma\u017Eesnis kaip",
          notInclusive: "turi b\u016Bti didesnis kaip"
        }
      }
    },
    array: {
      unit: {
        one: "element\u0105",
        few: "elementus",
        many: "element\u0173"
      },
      verb: {
        smaller: {
          inclusive: "turi tur\u0117ti ne daugiau kaip",
          notInclusive: "turi tur\u0117ti ma\u017Eiau kaip"
        },
        bigger: {
          inclusive: "turi tur\u0117ti ne ma\u017Eiau kaip",
          notInclusive: "turi tur\u0117ti daugiau kaip"
        }
      }
    },
    set: {
      unit: {
        one: "element\u0105",
        few: "elementus",
        many: "element\u0173"
      },
      verb: {
        smaller: {
          inclusive: "turi tur\u0117ti ne daugiau kaip",
          notInclusive: "turi tur\u0117ti ma\u017Eiau kaip"
        },
        bigger: {
          inclusive: "turi tur\u0117ti ne ma\u017Eiau kaip",
          notInclusive: "turi tur\u0117ti daugiau kaip"
        }
      }
    }
  };
  function getSizing(origin, unitType, inclusive, targetShouldBe) {
    const result = Sizable[origin] ?? null;
    if (result === null)
      return result;
    return {
      unit: result.unit[unitType],
      verb: result.verb[targetShouldBe][inclusive ? "inclusive" : "notInclusive"]
    };
  }
  const Nouns = {
    regex: "\u012Fvestis",
    email: "el. pa\u0161to adresas",
    url: "URL",
    emoji: "jaustukas",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO data ir laikas",
    date: "ISO data",
    time: "ISO laikas",
    duration: "ISO trukm\u0117",
    ipv4: "IPv4 adresas",
    ipv6: "IPv6 adresas",
    cidrv4: "IPv4 tinklo prefiksas (CIDR)",
    cidrv6: "IPv6 tinklo prefiksas (CIDR)",
    base64: "base64 u\u017Ekoduota eilut\u0117",
    base64url: "base64url u\u017Ekoduota eilut\u0117",
    json_string: "JSON eilut\u0117",
    e164: "E.164 numeris",
    jwt: "JWT",
    template_literal: "\u012Fvestis"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Gautas tipas ${parsedType6(issue2.input)}, o tik\u0117tasi - ${parsedTypeFromType(issue2.expected)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Privalo b\u016Bti ${stringifyPrimitive(issue2.values[0])}`;
        return `Privalo b\u016Bti vienas i\u0161 ${joinValues(issue2.values, "|")} pasirinkim\u0173`;
      case "too_big": {
        const origin = parsedTypeFromType(issue2.origin);
        const sizing = getSizing(issue2.origin, getUnitTypeFromNumber(Number(issue2.maximum)), issue2.inclusive ?? false, "smaller");
        if (sizing?.verb)
          return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} ${sizing.verb} ${issue2.maximum.toString()} ${sizing.unit ?? "element\u0173"}`;
        const adj = issue2.inclusive ? "ne didesnis kaip" : "ma\u017Eesnis kaip";
        return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} turi b\u016Bti ${adj} ${issue2.maximum.toString()} ${sizing?.unit}`;
      }
      case "too_small": {
        const origin = parsedTypeFromType(issue2.origin);
        const sizing = getSizing(issue2.origin, getUnitTypeFromNumber(Number(issue2.minimum)), issue2.inclusive ?? false, "bigger");
        if (sizing?.verb)
          return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} ${sizing.verb} ${issue2.minimum.toString()} ${sizing.unit ?? "element\u0173"}`;
        const adj = issue2.inclusive ? "ne ma\u017Eesnis kaip" : "didesnis kaip";
        return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} turi b\u016Bti ${adj} ${issue2.minimum.toString()} ${sizing?.unit}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `Eilut\u0117 privalo prasid\u0117ti "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `Eilut\u0117 privalo pasibaigti "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Eilut\u0117 privalo \u012Ftraukti "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Eilut\u0117 privalo atitikti ${_issue.pattern}`;
        return `Neteisingas ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Skai\u010Dius privalo b\u016Bti ${issue2.divisor} kartotinis.`;
      case "unrecognized_keys":
        return `Neatpa\u017Eint${issue2.keys.length > 1 ? "i" : "as"} rakt${issue2.keys.length > 1 ? "ai" : "as"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return "Rastas klaidingas raktas";
      case "invalid_union":
        return "Klaidinga \u012Fvestis";
      case "invalid_element": {
        const origin = parsedTypeFromType(issue2.origin);
        return `${capitalizeFirstCharacter(origin ?? issue2.origin ?? "reik\u0161m\u0117")} turi klaiding\u0105 \u012Fvest\u012F`;
      }
      default:
        return "Klaidinga \u012Fvestis";
    }
  };
};
function lt_default() {
  return {
    localeError: error25()
  };
}

// node_modules/zod/v4/locales/mk.js
var error26 = () => {
  const Sizable = {
    string: { unit: "\u0437\u043D\u0430\u0446\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" },
    file: { unit: "\u0431\u0430\u0458\u0442\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" },
    array: { unit: "\u0441\u0442\u0430\u0432\u043A\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" },
    set: { unit: "\u0441\u0442\u0430\u0432\u043A\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "\u0431\u0440\u043E\u0458";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "\u043D\u0438\u0437\u0430";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "\u0432\u043D\u0435\u0441",
    email: "\u0430\u0434\u0440\u0435\u0441\u0430 \u043D\u0430 \u0435-\u043F\u043E\u0448\u0442\u0430",
    url: "URL",
    emoji: "\u0435\u043C\u043E\u045F\u0438",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO \u0434\u0430\u0442\u0443\u043C \u0438 \u0432\u0440\u0435\u043C\u0435",
    date: "ISO \u0434\u0430\u0442\u0443\u043C",
    time: "ISO \u0432\u0440\u0435\u043C\u0435",
    duration: "ISO \u0432\u0440\u0435\u043C\u0435\u0442\u0440\u0430\u0435\u045A\u0435",
    ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441\u0430",
    ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441\u0430",
    cidrv4: "IPv4 \u043E\u043F\u0441\u0435\u0433",
    cidrv6: "IPv6 \u043E\u043F\u0441\u0435\u0433",
    base64: "base64-\u0435\u043D\u043A\u043E\u0434\u0438\u0440\u0430\u043D\u0430 \u043D\u0438\u0437\u0430",
    base64url: "base64url-\u0435\u043D\u043A\u043E\u0434\u0438\u0440\u0430\u043D\u0430 \u043D\u0438\u0437\u0430",
    json_string: "JSON \u043D\u0438\u0437\u0430",
    e164: "E.164 \u0431\u0440\u043E\u0458",
    jwt: "JWT",
    template_literal: "\u0432\u043D\u0435\u0441"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.expected}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E ${parsedType8(issue2.input)}`;
      // return `Invalid input: expected ${issue.expected}, received ${util.getParsedType(issue.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Invalid input: expected ${stringifyPrimitive(issue2.values[0])}`;
        return `\u0413\u0440\u0435\u0448\u0430\u043D\u0430 \u043E\u043F\u0446\u0438\u0458\u0430: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 \u0435\u0434\u043D\u0430 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0438\u043C\u0430 ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0438"}`;
        return `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0431\u0438\u0434\u0435 ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.origin} \u0434\u0430 \u0438\u043C\u0430 ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${issue2.origin} \u0434\u0430 \u0431\u0438\u0434\u0435 ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u043F\u043E\u0447\u043D\u0443\u0432\u0430 \u0441\u043E "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u0432\u0440\u0448\u0443\u0432\u0430 \u0441\u043E "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0432\u043A\u043B\u0443\u0447\u0443\u0432\u0430 "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u043E\u0434\u0433\u043E\u0430\u0440\u0430 \u043D\u0430 \u043F\u0430\u0442\u0435\u0440\u043D\u043E\u0442 ${_issue.pattern}`;
        return `Invalid ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u0413\u0440\u0435\u0448\u0435\u043D \u0431\u0440\u043E\u0458: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0431\u0438\u0434\u0435 \u0434\u0435\u043B\u0438\u0432 \u0441\u043E ${issue2.divisor}`;
      case "unrecognized_keys":
        return `${issue2.keys.length > 1 ? "\u041D\u0435\u043F\u0440\u0435\u043F\u043E\u0437\u043D\u0430\u0435\u043D\u0438 \u043A\u043B\u0443\u0447\u0435\u0432\u0438" : "\u041D\u0435\u043F\u0440\u0435\u043F\u043E\u0437\u043D\u0430\u0435\u043D \u043A\u043B\u0443\u0447"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u0413\u0440\u0435\u0448\u0435\u043D \u043A\u043B\u0443\u0447 \u0432\u043E ${issue2.origin}`;
      case "invalid_union":
        return "\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441";
      case "invalid_element":
        return `\u0413\u0440\u0435\u0448\u043D\u0430 \u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442 \u0432\u043E ${issue2.origin}`;
      default:
        return `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441`;
    }
  };
};
function mk_default() {
  return {
    localeError: error26()
  };
}

// node_modules/zod/v4/locales/ms.js
var error27 = () => {
  const Sizable = {
    string: { unit: "aksara", verb: "mempunyai" },
    file: { unit: "bait", verb: "mempunyai" },
    array: { unit: "elemen", verb: "mempunyai" },
    set: { unit: "elemen", verb: "mempunyai" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "nombor";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "array";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "input",
    email: "alamat e-mel",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "tarikh masa ISO",
    date: "tarikh ISO",
    time: "masa ISO",
    duration: "tempoh ISO",
    ipv4: "alamat IPv4",
    ipv6: "alamat IPv6",
    cidrv4: "julat IPv4",
    cidrv6: "julat IPv6",
    base64: "string dikodkan base64",
    base64url: "string dikodkan base64url",
    json_string: "string JSON",
    e164: "nombor E.164",
    jwt: "JWT",
    template_literal: "input"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Input tidak sah: dijangka ${issue2.expected}, diterima ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Input tidak sah: dijangka ${stringifyPrimitive(issue2.values[0])}`;
        return `Pilihan tidak sah: dijangka salah satu daripada ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Terlalu besar: dijangka ${issue2.origin ?? "nilai"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elemen"}`;
        return `Terlalu besar: dijangka ${issue2.origin ?? "nilai"} adalah ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Terlalu kecil: dijangka ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Terlalu kecil: dijangka ${issue2.origin} adalah ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `String tidak sah: mesti bermula dengan "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `String tidak sah: mesti berakhir dengan "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `String tidak sah: mesti mengandungi "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `String tidak sah: mesti sepadan dengan corak ${_issue.pattern}`;
        return `${Nouns[_issue.format] ?? issue2.format} tidak sah`;
      }
      case "not_multiple_of":
        return `Nombor tidak sah: perlu gandaan ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Kunci tidak dikenali: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Kunci tidak sah dalam ${issue2.origin}`;
      case "invalid_union":
        return "Input tidak sah";
      case "invalid_element":
        return `Nilai tidak sah dalam ${issue2.origin}`;
      default:
        return `Input tidak sah`;
    }
  };
};
function ms_default() {
  return {
    localeError: error27()
  };
}

// node_modules/zod/v4/locales/nl.js
var error28 = () => {
  const Sizable = {
    string: { unit: "tekens", verb: "te hebben" },
    file: { unit: "bytes", verb: "te hebben" },
    array: { unit: "elementen", verb: "te hebben" },
    set: { unit: "elementen", verb: "te hebben" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "getal";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "array";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "invoer",
    email: "emailadres",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO datum en tijd",
    date: "ISO datum",
    time: "ISO tijd",
    duration: "ISO duur",
    ipv4: "IPv4-adres",
    ipv6: "IPv6-adres",
    cidrv4: "IPv4-bereik",
    cidrv6: "IPv6-bereik",
    base64: "base64-gecodeerde tekst",
    base64url: "base64 URL-gecodeerde tekst",
    json_string: "JSON string",
    e164: "E.164-nummer",
    jwt: "JWT",
    template_literal: "invoer"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Ongeldige invoer: verwacht ${issue2.expected}, ontving ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Ongeldige invoer: verwacht ${stringifyPrimitive(issue2.values[0])}`;
        return `Ongeldige optie: verwacht \xE9\xE9n van ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Te groot: verwacht dat ${issue2.origin ?? "waarde"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementen"}`;
        return `Te groot: verwacht dat ${issue2.origin ?? "waarde"} ${adj}${issue2.maximum.toString()} is`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Te klein: verwacht dat ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Te klein: verwacht dat ${issue2.origin} ${adj}${issue2.minimum.toString()} is`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `Ongeldige tekst: moet met "${_issue.prefix}" beginnen`;
        }
        if (_issue.format === "ends_with")
          return `Ongeldige tekst: moet op "${_issue.suffix}" eindigen`;
        if (_issue.format === "includes")
          return `Ongeldige tekst: moet "${_issue.includes}" bevatten`;
        if (_issue.format === "regex")
          return `Ongeldige tekst: moet overeenkomen met patroon ${_issue.pattern}`;
        return `Ongeldig: ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Ongeldig getal: moet een veelvoud van ${issue2.divisor} zijn`;
      case "unrecognized_keys":
        return `Onbekende key${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Ongeldige key in ${issue2.origin}`;
      case "invalid_union":
        return "Ongeldige invoer";
      case "invalid_element":
        return `Ongeldige waarde in ${issue2.origin}`;
      default:
        return `Ongeldige invoer`;
    }
  };
};
function nl_default() {
  return {
    localeError: error28()
  };
}

// node_modules/zod/v4/locales/no.js
var error29 = () => {
  const Sizable = {
    string: { unit: "tegn", verb: "\xE5 ha" },
    file: { unit: "bytes", verb: "\xE5 ha" },
    array: { unit: "elementer", verb: "\xE5 inneholde" },
    set: { unit: "elementer", verb: "\xE5 inneholde" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "tall";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "liste";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "input",
    email: "e-postadresse",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO dato- og klokkeslett",
    date: "ISO-dato",
    time: "ISO-klokkeslett",
    duration: "ISO-varighet",
    ipv4: "IPv4-omr\xE5de",
    ipv6: "IPv6-omr\xE5de",
    cidrv4: "IPv4-spekter",
    cidrv6: "IPv6-spekter",
    base64: "base64-enkodet streng",
    base64url: "base64url-enkodet streng",
    json_string: "JSON-streng",
    e164: "E.164-nummer",
    jwt: "JWT",
    template_literal: "input"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Ugyldig input: forventet ${issue2.expected}, fikk ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Ugyldig verdi: forventet ${stringifyPrimitive(issue2.values[0])}`;
        return `Ugyldig valg: forventet en av ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `For stor(t): forventet ${issue2.origin ?? "value"} til \xE5 ha ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementer"}`;
        return `For stor(t): forventet ${issue2.origin ?? "value"} til \xE5 ha ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `For lite(n): forventet ${issue2.origin} til \xE5 ha ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `For lite(n): forventet ${issue2.origin} til \xE5 ha ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Ugyldig streng: m\xE5 starte med "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Ugyldig streng: m\xE5 ende med "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Ugyldig streng: m\xE5 inneholde "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Ugyldig streng: m\xE5 matche m\xF8nsteret ${_issue.pattern}`;
        return `Ugyldig ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Ugyldig tall: m\xE5 v\xE6re et multiplum av ${issue2.divisor}`;
      case "unrecognized_keys":
        return `${issue2.keys.length > 1 ? "Ukjente n\xF8kler" : "Ukjent n\xF8kkel"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Ugyldig n\xF8kkel i ${issue2.origin}`;
      case "invalid_union":
        return "Ugyldig input";
      case "invalid_element":
        return `Ugyldig verdi i ${issue2.origin}`;
      default:
        return `Ugyldig input`;
    }
  };
};
function no_default() {
  return {
    localeError: error29()
  };
}

// node_modules/zod/v4/locales/ota.js
var error30 = () => {
  const Sizable = {
    string: { unit: "harf", verb: "olmal\u0131d\u0131r" },
    file: { unit: "bayt", verb: "olmal\u0131d\u0131r" },
    array: { unit: "unsur", verb: "olmal\u0131d\u0131r" },
    set: { unit: "unsur", verb: "olmal\u0131d\u0131r" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "numara";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "saf";
        }
        if (data === null) {
          return "gayb";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "giren",
    email: "epostag\xE2h",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO heng\xE2m\u0131",
    date: "ISO tarihi",
    time: "ISO zaman\u0131",
    duration: "ISO m\xFCddeti",
    ipv4: "IPv4 ni\u015F\xE2n\u0131",
    ipv6: "IPv6 ni\u015F\xE2n\u0131",
    cidrv4: "IPv4 menzili",
    cidrv6: "IPv6 menzili",
    base64: "base64-\u015Fifreli metin",
    base64url: "base64url-\u015Fifreli metin",
    json_string: "JSON metin",
    e164: "E.164 say\u0131s\u0131",
    jwt: "JWT",
    template_literal: "giren"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `F\xE2sit giren: umulan ${issue2.expected}, al\u0131nan ${parsedType8(issue2.input)}`;
      // return `Fâsit giren: umulan ${issue.expected}, alınan ${util.getParsedType(issue.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `F\xE2sit giren: umulan ${stringifyPrimitive(issue2.values[0])}`;
        return `F\xE2sit tercih: m\xFBteberler ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Fazla b\xFCy\xFCk: ${issue2.origin ?? "value"}, ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elements"} sahip olmal\u0131yd\u0131.`;
        return `Fazla b\xFCy\xFCk: ${issue2.origin ?? "value"}, ${adj}${issue2.maximum.toString()} olmal\u0131yd\u0131.`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Fazla k\xFC\xE7\xFCk: ${issue2.origin}, ${adj}${issue2.minimum.toString()} ${sizing.unit} sahip olmal\u0131yd\u0131.`;
        }
        return `Fazla k\xFC\xE7\xFCk: ${issue2.origin}, ${adj}${issue2.minimum.toString()} olmal\u0131yd\u0131.`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `F\xE2sit metin: "${_issue.prefix}" ile ba\u015Flamal\u0131.`;
        if (_issue.format === "ends_with")
          return `F\xE2sit metin: "${_issue.suffix}" ile bitmeli.`;
        if (_issue.format === "includes")
          return `F\xE2sit metin: "${_issue.includes}" ihtiv\xE2 etmeli.`;
        if (_issue.format === "regex")
          return `F\xE2sit metin: ${_issue.pattern} nak\u015F\u0131na uymal\u0131.`;
        return `F\xE2sit ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `F\xE2sit say\u0131: ${issue2.divisor} kat\u0131 olmal\u0131yd\u0131.`;
      case "unrecognized_keys":
        return `Tan\u0131nmayan anahtar ${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `${issue2.origin} i\xE7in tan\u0131nmayan anahtar var.`;
      case "invalid_union":
        return "Giren tan\u0131namad\u0131.";
      case "invalid_element":
        return `${issue2.origin} i\xE7in tan\u0131nmayan k\u0131ymet var.`;
      default:
        return `K\u0131ymet tan\u0131namad\u0131.`;
    }
  };
};
function ota_default() {
  return {
    localeError: error30()
  };
}

// node_modules/zod/v4/locales/ps.js
var error31 = () => {
  const Sizable = {
    string: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
    file: { unit: "\u0628\u0627\u06CC\u067C\u0633", verb: "\u0648\u0644\u0631\u064A" },
    array: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
    set: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "\u0639\u062F\u062F";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "\u0627\u0631\u06D0";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "\u0648\u0631\u0648\u062F\u064A",
    email: "\u0628\u0631\u06CC\u069A\u0646\u0627\u0644\u06CC\u06A9",
    url: "\u06CC\u0648 \u0622\u0631 \u0627\u0644",
    emoji: "\u0627\u06CC\u0645\u0648\u062C\u064A",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "\u0646\u06CC\u067C\u0647 \u0627\u0648 \u0648\u062E\u062A",
    date: "\u0646\u06D0\u067C\u0647",
    time: "\u0648\u062E\u062A",
    duration: "\u0645\u0648\u062F\u0647",
    ipv4: "\u062F IPv4 \u067E\u062A\u0647",
    ipv6: "\u062F IPv6 \u067E\u062A\u0647",
    cidrv4: "\u062F IPv4 \u0633\u0627\u062D\u0647",
    cidrv6: "\u062F IPv6 \u0633\u0627\u062D\u0647",
    base64: "base64-encoded \u0645\u062A\u0646",
    base64url: "base64url-encoded \u0645\u062A\u0646",
    json_string: "JSON \u0645\u062A\u0646",
    e164: "\u062F E.164 \u0634\u0645\u06D0\u0631\u0647",
    jwt: "JWT",
    template_literal: "\u0648\u0631\u0648\u062F\u064A"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${issue2.expected} \u0648\u0627\u06CC, \u0645\u06AB\u0631 ${parsedType8(issue2.input)} \u062A\u0631\u0644\u0627\u0633\u0647 \u0634\u0648`;
      case "invalid_value":
        if (issue2.values.length === 1) {
          return `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${stringifyPrimitive(issue2.values[0])} \u0648\u0627\u06CC`;
        }
        return `\u0646\u0627\u0633\u0645 \u0627\u0646\u062A\u062E\u0627\u0628: \u0628\u0627\u06CC\u062F \u06CC\u0648 \u0644\u0647 ${joinValues(issue2.values, "|")} \u0685\u062E\u0647 \u0648\u0627\u06CC`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${issue2.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0639\u0646\u0635\u0631\u0648\u0646\u0647"} \u0648\u0644\u0631\u064A`;
        }
        return `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${issue2.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${adj}${issue2.maximum.toString()} \u0648\u064A`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${issue2.origin} \u0628\u0627\u06CC\u062F ${adj}${issue2.minimum.toString()} ${sizing.unit} \u0648\u0644\u0631\u064A`;
        }
        return `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${issue2.origin} \u0628\u0627\u06CC\u062F ${adj}${issue2.minimum.toString()} \u0648\u064A`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${_issue.prefix}" \u0633\u0631\u0647 \u067E\u06CC\u0644 \u0634\u064A`;
        }
        if (_issue.format === "ends_with") {
          return `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${_issue.suffix}" \u0633\u0631\u0647 \u067E\u0627\u06CC \u062A\u0647 \u0648\u0631\u0633\u064A\u0696\u064A`;
        }
        if (_issue.format === "includes") {
          return `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F "${_issue.includes}" \u0648\u0644\u0631\u064A`;
        }
        if (_issue.format === "regex") {
          return `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F ${_issue.pattern} \u0633\u0631\u0647 \u0645\u0637\u0627\u0628\u0642\u062A \u0648\u0644\u0631\u064A`;
        }
        return `${Nouns[_issue.format] ?? issue2.format} \u0646\u0627\u0633\u0645 \u062F\u06CC`;
      }
      case "not_multiple_of":
        return `\u0646\u0627\u0633\u0645 \u0639\u062F\u062F: \u0628\u0627\u06CC\u062F \u062F ${issue2.divisor} \u0645\u0636\u0631\u0628 \u0648\u064A`;
      case "unrecognized_keys":
        return `\u0646\u0627\u0633\u0645 ${issue2.keys.length > 1 ? "\u06A9\u0644\u06CC\u0689\u0648\u0646\u0647" : "\u06A9\u0644\u06CC\u0689"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u0646\u0627\u0633\u0645 \u06A9\u0644\u06CC\u0689 \u067E\u0647 ${issue2.origin} \u06A9\u06D0`;
      case "invalid_union":
        return `\u0646\u0627\u0633\u0645\u0647 \u0648\u0631\u0648\u062F\u064A`;
      case "invalid_element":
        return `\u0646\u0627\u0633\u0645 \u0639\u0646\u0635\u0631 \u067E\u0647 ${issue2.origin} \u06A9\u06D0`;
      default:
        return `\u0646\u0627\u0633\u0645\u0647 \u0648\u0631\u0648\u062F\u064A`;
    }
  };
};
function ps_default() {
  return {
    localeError: error31()
  };
}

// node_modules/zod/v4/locales/pl.js
var error32 = () => {
  const Sizable = {
    string: { unit: "znak\xF3w", verb: "mie\u0107" },
    file: { unit: "bajt\xF3w", verb: "mie\u0107" },
    array: { unit: "element\xF3w", verb: "mie\u0107" },
    set: { unit: "element\xF3w", verb: "mie\u0107" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "liczba";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "tablica";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "wyra\u017Cenie",
    email: "adres email",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "data i godzina w formacie ISO",
    date: "data w formacie ISO",
    time: "godzina w formacie ISO",
    duration: "czas trwania ISO",
    ipv4: "adres IPv4",
    ipv6: "adres IPv6",
    cidrv4: "zakres IPv4",
    cidrv6: "zakres IPv6",
    base64: "ci\u0105g znak\xF3w zakodowany w formacie base64",
    base64url: "ci\u0105g znak\xF3w zakodowany w formacie base64url",
    json_string: "ci\u0105g znak\xF3w w formacie JSON",
    e164: "liczba E.164",
    jwt: "JWT",
    template_literal: "wej\u015Bcie"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${issue2.expected}, otrzymano ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${stringifyPrimitive(issue2.values[0])}`;
        return `Nieprawid\u0142owa opcja: oczekiwano jednej z warto\u015Bci ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Za du\u017Ca warto\u015B\u0107: oczekiwano, \u017Ce ${issue2.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "element\xF3w"}`;
        }
        return `Zbyt du\u017C(y/a/e): oczekiwano, \u017Ce ${issue2.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Za ma\u0142a warto\u015B\u0107: oczekiwano, \u017Ce ${issue2.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${adj}${issue2.minimum.toString()} ${sizing.unit ?? "element\xF3w"}`;
        }
        return `Zbyt ma\u0142(y/a/e): oczekiwano, \u017Ce ${issue2.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zaczyna\u0107 si\u0119 od "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi ko\u0144czy\u0107 si\u0119 na "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zawiera\u0107 "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi odpowiada\u0107 wzorcowi ${_issue.pattern}`;
        return `Nieprawid\u0142ow(y/a/e) ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Nieprawid\u0142owa liczba: musi by\u0107 wielokrotno\u015Bci\u0105 ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Nierozpoznane klucze${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Nieprawid\u0142owy klucz w ${issue2.origin}`;
      case "invalid_union":
        return "Nieprawid\u0142owe dane wej\u015Bciowe";
      case "invalid_element":
        return `Nieprawid\u0142owa warto\u015B\u0107 w ${issue2.origin}`;
      default:
        return `Nieprawid\u0142owe dane wej\u015Bciowe`;
    }
  };
};
function pl_default() {
  return {
    localeError: error32()
  };
}

// node_modules/zod/v4/locales/pt.js
var error33 = () => {
  const Sizable = {
    string: { unit: "caracteres", verb: "ter" },
    file: { unit: "bytes", verb: "ter" },
    array: { unit: "itens", verb: "ter" },
    set: { unit: "itens", verb: "ter" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "n\xFAmero";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "array";
        }
        if (data === null) {
          return "nulo";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "padr\xE3o",
    email: "endere\xE7o de e-mail",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "data e hora ISO",
    date: "data ISO",
    time: "hora ISO",
    duration: "dura\xE7\xE3o ISO",
    ipv4: "endere\xE7o IPv4",
    ipv6: "endere\xE7o IPv6",
    cidrv4: "faixa de IPv4",
    cidrv6: "faixa de IPv6",
    base64: "texto codificado em base64",
    base64url: "URL codificada em base64",
    json_string: "texto JSON",
    e164: "n\xFAmero E.164",
    jwt: "JWT",
    template_literal: "entrada"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Tipo inv\xE1lido: esperado ${issue2.expected}, recebido ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Entrada inv\xE1lida: esperado ${stringifyPrimitive(issue2.values[0])}`;
        return `Op\xE7\xE3o inv\xE1lida: esperada uma das ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Muito grande: esperado que ${issue2.origin ?? "valor"} tivesse ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementos"}`;
        return `Muito grande: esperado que ${issue2.origin ?? "valor"} fosse ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Muito pequeno: esperado que ${issue2.origin} tivesse ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Muito pequeno: esperado que ${issue2.origin} fosse ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Texto inv\xE1lido: deve come\xE7ar com "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Texto inv\xE1lido: deve terminar com "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Texto inv\xE1lido: deve incluir "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Texto inv\xE1lido: deve corresponder ao padr\xE3o ${_issue.pattern}`;
        return `${Nouns[_issue.format] ?? issue2.format} inv\xE1lido`;
      }
      case "not_multiple_of":
        return `N\xFAmero inv\xE1lido: deve ser m\xFAltiplo de ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Chave${issue2.keys.length > 1 ? "s" : ""} desconhecida${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Chave inv\xE1lida em ${issue2.origin}`;
      case "invalid_union":
        return "Entrada inv\xE1lida";
      case "invalid_element":
        return `Valor inv\xE1lido em ${issue2.origin}`;
      default:
        return `Campo inv\xE1lido`;
    }
  };
};
function pt_default() {
  return {
    localeError: error33()
  };
}

// node_modules/zod/v4/locales/ru.js
function getRussianPlural(count3, one, few, many) {
  const absCount = Math.abs(count3);
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return many;
  }
  if (lastDigit === 1) {
    return one;
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return few;
  }
  return many;
}
var error34 = () => {
  const Sizable = {
    string: {
      unit: {
        one: "\u0441\u0438\u043C\u0432\u043E\u043B",
        few: "\u0441\u0438\u043C\u0432\u043E\u043B\u0430",
        many: "\u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432"
      },
      verb: "\u0438\u043C\u0435\u0442\u044C"
    },
    file: {
      unit: {
        one: "\u0431\u0430\u0439\u0442",
        few: "\u0431\u0430\u0439\u0442\u0430",
        many: "\u0431\u0430\u0439\u0442"
      },
      verb: "\u0438\u043C\u0435\u0442\u044C"
    },
    array: {
      unit: {
        one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
        few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
        many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432"
      },
      verb: "\u0438\u043C\u0435\u0442\u044C"
    },
    set: {
      unit: {
        one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
        few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
        many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432"
      },
      verb: "\u0438\u043C\u0435\u0442\u044C"
    }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "\u0447\u0438\u0441\u043B\u043E";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "\u043C\u0430\u0441\u0441\u0438\u0432";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "\u0432\u0432\u043E\u0434",
    email: "email \u0430\u0434\u0440\u0435\u0441",
    url: "URL",
    emoji: "\u044D\u043C\u043E\u0434\u0437\u0438",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO \u0434\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043C\u044F",
    date: "ISO \u0434\u0430\u0442\u0430",
    time: "ISO \u0432\u0440\u0435\u043C\u044F",
    duration: "ISO \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C",
    ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441",
    ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441",
    cidrv4: "IPv4 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
    cidrv6: "IPv6 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
    base64: "\u0441\u0442\u0440\u043E\u043A\u0430 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 base64",
    base64url: "\u0441\u0442\u0440\u043E\u043A\u0430 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 base64url",
    json_string: "JSON \u0441\u0442\u0440\u043E\u043A\u0430",
    e164: "\u043D\u043E\u043C\u0435\u0440 E.164",
    jwt: "JWT",
    template_literal: "\u0432\u0432\u043E\u0434"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${issue2.expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${stringifyPrimitive(issue2.values[0])}`;
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0430\u0440\u0438\u0430\u043D\u0442: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0434\u043D\u043E \u0438\u0437 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          const maxValue = Number(issue2.maximum);
          const unit = getRussianPlural(maxValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
          return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${adj}${issue2.maximum.toString()} ${unit}`;
        }
        return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          const minValue = Number(issue2.minimum);
          const unit = getRussianPlural(minValue, sizing.unit.one, sizing.unit.few, sizing.unit.many);
          return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${issue2.origin} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${adj}${issue2.minimum.toString()} ${unit}`;
        }
        return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${issue2.origin} \u0431\u0443\u0434\u0435\u0442 ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u043D\u0430\u0447\u0438\u043D\u0430\u0442\u044C\u0441\u044F \u0441 "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0437\u0430\u043A\u0430\u043D\u0447\u0438\u0432\u0430\u0442\u044C\u0441\u044F \u043D\u0430 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${_issue.pattern}`;
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E: \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043A\u0440\u0430\u0442\u043D\u044B\u043C ${issue2.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u043D\u043D${issue2.keys.length > 1 ? "\u044B\u0435" : "\u044B\u0439"} \u043A\u043B\u044E\u0447${issue2.keys.length > 1 ? "\u0438" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u043A\u043B\u044E\u0447 \u0432 ${issue2.origin}`;
      case "invalid_union":
        return "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435";
      case "invalid_element":
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0432 ${issue2.origin}`;
      default:
        return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435`;
    }
  };
};
function ru_default() {
  return {
    localeError: error34()
  };
}

// node_modules/zod/v4/locales/sl.js
var error35 = () => {
  const Sizable = {
    string: { unit: "znakov", verb: "imeti" },
    file: { unit: "bajtov", verb: "imeti" },
    array: { unit: "elementov", verb: "imeti" },
    set: { unit: "elementov", verb: "imeti" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "\u0161tevilo";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "tabela";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "vnos",
    email: "e-po\u0161tni naslov",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO datum in \u010Das",
    date: "ISO datum",
    time: "ISO \u010Das",
    duration: "ISO trajanje",
    ipv4: "IPv4 naslov",
    ipv6: "IPv6 naslov",
    cidrv4: "obseg IPv4",
    cidrv6: "obseg IPv6",
    base64: "base64 kodiran niz",
    base64url: "base64url kodiran niz",
    json_string: "JSON niz",
    e164: "E.164 \u0161tevilka",
    jwt: "JWT",
    template_literal: "vnos"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Neveljaven vnos: pri\u010Dakovano ${issue2.expected}, prejeto ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Neveljaven vnos: pri\u010Dakovano ${stringifyPrimitive(issue2.values[0])}`;
        return `Neveljavna mo\u017Enost: pri\u010Dakovano eno izmed ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Preveliko: pri\u010Dakovano, da bo ${issue2.origin ?? "vrednost"} imelo ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elementov"}`;
        return `Preveliko: pri\u010Dakovano, da bo ${issue2.origin ?? "vrednost"} ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Premajhno: pri\u010Dakovano, da bo ${issue2.origin} imelo ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Premajhno: pri\u010Dakovano, da bo ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `Neveljaven niz: mora se za\u010Deti z "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `Neveljaven niz: mora se kon\u010Dati z "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Neveljaven niz: mora vsebovati "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Neveljaven niz: mora ustrezati vzorcu ${_issue.pattern}`;
        return `Neveljaven ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Neveljavno \u0161tevilo: mora biti ve\u010Dkratnik ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Neprepoznan${issue2.keys.length > 1 ? "i klju\u010Di" : " klju\u010D"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Neveljaven klju\u010D v ${issue2.origin}`;
      case "invalid_union":
        return "Neveljaven vnos";
      case "invalid_element":
        return `Neveljavna vrednost v ${issue2.origin}`;
      default:
        return "Neveljaven vnos";
    }
  };
};
function sl_default() {
  return {
    localeError: error35()
  };
}

// node_modules/zod/v4/locales/sv.js
var error36 = () => {
  const Sizable = {
    string: { unit: "tecken", verb: "att ha" },
    file: { unit: "bytes", verb: "att ha" },
    array: { unit: "objekt", verb: "att inneh\xE5lla" },
    set: { unit: "objekt", verb: "att inneh\xE5lla" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "antal";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "lista";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "regulj\xE4rt uttryck",
    email: "e-postadress",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO-datum och tid",
    date: "ISO-datum",
    time: "ISO-tid",
    duration: "ISO-varaktighet",
    ipv4: "IPv4-intervall",
    ipv6: "IPv6-intervall",
    cidrv4: "IPv4-spektrum",
    cidrv6: "IPv6-spektrum",
    base64: "base64-kodad str\xE4ng",
    base64url: "base64url-kodad str\xE4ng",
    json_string: "JSON-str\xE4ng",
    e164: "E.164-nummer",
    jwt: "JWT",
    template_literal: "mall-literal"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Ogiltig inmatning: f\xF6rv\xE4ntat ${issue2.expected}, fick ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Ogiltig inmatning: f\xF6rv\xE4ntat ${stringifyPrimitive(issue2.values[0])}`;
        return `Ogiltigt val: f\xF6rv\xE4ntade en av ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `F\xF6r stor(t): f\xF6rv\xE4ntade ${issue2.origin ?? "v\xE4rdet"} att ha ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "element"}`;
        }
        return `F\xF6r stor(t): f\xF6rv\xE4ntat ${issue2.origin ?? "v\xE4rdet"} att ha ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `F\xF6r lite(t): f\xF6rv\xE4ntade ${issue2.origin ?? "v\xE4rdet"} att ha ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `F\xF6r lite(t): f\xF6rv\xE4ntade ${issue2.origin ?? "v\xE4rdet"} att ha ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `Ogiltig str\xE4ng: m\xE5ste b\xF6rja med "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `Ogiltig str\xE4ng: m\xE5ste sluta med "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Ogiltig str\xE4ng: m\xE5ste inneh\xE5lla "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Ogiltig str\xE4ng: m\xE5ste matcha m\xF6nstret "${_issue.pattern}"`;
        return `Ogiltig(t) ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Ogiltigt tal: m\xE5ste vara en multipel av ${issue2.divisor}`;
      case "unrecognized_keys":
        return `${issue2.keys.length > 1 ? "Ok\xE4nda nycklar" : "Ok\xE4nd nyckel"}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Ogiltig nyckel i ${issue2.origin ?? "v\xE4rdet"}`;
      case "invalid_union":
        return "Ogiltig input";
      case "invalid_element":
        return `Ogiltigt v\xE4rde i ${issue2.origin ?? "v\xE4rdet"}`;
      default:
        return `Ogiltig input`;
    }
  };
};
function sv_default() {
  return {
    localeError: error36()
  };
}

// node_modules/zod/v4/locales/ta.js
var error37 = () => {
  const Sizable = {
    string: { unit: "\u0B8E\u0BB4\u0BC1\u0BA4\u0BCD\u0BA4\u0BC1\u0B95\u0BCD\u0B95\u0BB3\u0BCD", verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD" },
    file: { unit: "\u0BAA\u0BC8\u0B9F\u0BCD\u0B9F\u0BC1\u0B95\u0BB3\u0BCD", verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD" },
    array: { unit: "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD", verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD" },
    set: { unit: "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD", verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "\u0B8E\u0BA3\u0BCD \u0B85\u0BB2\u0BCD\u0BB2\u0BBE\u0BA4\u0BA4\u0BC1" : "\u0B8E\u0BA3\u0BCD";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "\u0B85\u0BA3\u0BBF";
        }
        if (data === null) {
          return "\u0BB5\u0BC6\u0BB1\u0BC1\u0BAE\u0BC8";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "\u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1",
    email: "\u0BAE\u0BBF\u0BA9\u0BCD\u0BA9\u0B9E\u0BCD\u0B9A\u0BB2\u0BCD \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO \u0BA4\u0BC7\u0BA4\u0BBF \u0BA8\u0BC7\u0BB0\u0BAE\u0BCD",
    date: "ISO \u0BA4\u0BC7\u0BA4\u0BBF",
    time: "ISO \u0BA8\u0BC7\u0BB0\u0BAE\u0BCD",
    duration: "ISO \u0B95\u0BBE\u0BB2 \u0B85\u0BB3\u0BB5\u0BC1",
    ipv4: "IPv4 \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
    ipv6: "IPv6 \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
    cidrv4: "IPv4 \u0BB5\u0BB0\u0BAE\u0BCD\u0BAA\u0BC1",
    cidrv6: "IPv6 \u0BB5\u0BB0\u0BAE\u0BCD\u0BAA\u0BC1",
    base64: "base64-encoded \u0B9A\u0BB0\u0BAE\u0BCD",
    base64url: "base64url-encoded \u0B9A\u0BB0\u0BAE\u0BCD",
    json_string: "JSON \u0B9A\u0BB0\u0BAE\u0BCD",
    e164: "E.164 \u0B8E\u0BA3\u0BCD",
    jwt: "JWT",
    template_literal: "input"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.expected}, \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${stringifyPrimitive(issue2.values[0])}`;
        return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BB5\u0BBF\u0BB0\u0BC1\u0BAA\u0BCD\u0BAA\u0BAE\u0BCD: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${joinValues(issue2.values, "|")} \u0B87\u0BB2\u0BCD \u0B92\u0BA9\u0BCD\u0BB1\u0BC1`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD"} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
        }
        return `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${adj}${issue2.maximum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
        }
        return `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${issue2.origin} ${adj}${issue2.minimum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${_issue.prefix}" \u0B87\u0BB2\u0BCD \u0BA4\u0BCA\u0B9F\u0B99\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
        if (_issue.format === "ends_with")
          return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${_issue.suffix}" \u0B87\u0BB2\u0BCD \u0BAE\u0BC1\u0B9F\u0BBF\u0BB5\u0B9F\u0BC8\u0BAF \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
        if (_issue.format === "includes")
          return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${_issue.includes}" \u0B90 \u0B89\u0BB3\u0BCD\u0BB3\u0B9F\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
        if (_issue.format === "regex")
          return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: ${_issue.pattern} \u0BAE\u0BC1\u0BB1\u0BC8\u0BAA\u0BBE\u0B9F\u0BCD\u0B9F\u0BC1\u0B9F\u0BA9\u0BCD \u0BAA\u0BCA\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
        return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B8E\u0BA3\u0BCD: ${issue2.divisor} \u0B87\u0BA9\u0BCD \u0BAA\u0BB2\u0BAE\u0BBE\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`;
      case "unrecognized_keys":
        return `\u0B85\u0B9F\u0BC8\u0BAF\u0BBE\u0BB3\u0BAE\u0BCD \u0BA4\u0BC6\u0BB0\u0BBF\u0BAF\u0BBE\u0BA4 \u0BB5\u0BBF\u0B9A\u0BC8${issue2.keys.length > 1 ? "\u0B95\u0BB3\u0BCD" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `${issue2.origin} \u0B87\u0BB2\u0BCD \u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BB5\u0BBF\u0B9A\u0BC8`;
      case "invalid_union":
        return "\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1";
      case "invalid_element":
        return `${issue2.origin} \u0B87\u0BB2\u0BCD \u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1`;
      default:
        return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1`;
    }
  };
};
function ta_default() {
  return {
    localeError: error37()
  };
}

// node_modules/zod/v4/locales/th.js
var error38 = () => {
  const Sizable = {
    string: { unit: "\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
    file: { unit: "\u0E44\u0E1A\u0E15\u0E4C", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
    array: { unit: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
    set: { unit: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "\u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02 (NaN)" : "\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "\u0E2D\u0E32\u0E23\u0E4C\u0E40\u0E23\u0E22\u0E4C (Array)";
        }
        if (data === null) {
          return "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E48\u0E32 (null)";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E1B\u0E49\u0E2D\u0E19",
    email: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48\u0E2D\u0E35\u0E40\u0E21\u0E25",
    url: "URL",
    emoji: "\u0E2D\u0E34\u0E42\u0E21\u0E08\u0E34",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
    date: "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1A\u0E1A ISO",
    time: "\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
    duration: "\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
    ipv4: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48 IPv4",
    ipv6: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48 IPv6",
    cidrv4: "\u0E0A\u0E48\u0E27\u0E07 IP \u0E41\u0E1A\u0E1A IPv4",
    cidrv6: "\u0E0A\u0E48\u0E27\u0E07 IP \u0E41\u0E1A\u0E1A IPv6",
    base64: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A Base64",
    base64url: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A Base64 \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A URL",
    json_string: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A JSON",
    e164: "\u0E40\u0E1A\u0E2D\u0E23\u0E4C\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28 (E.164)",
    jwt: "\u0E42\u0E17\u0E40\u0E04\u0E19 JWT",
    template_literal: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E1B\u0E49\u0E2D\u0E19"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${issue2.expected} \u0E41\u0E15\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u0E04\u0E48\u0E32\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${stringifyPrimitive(issue2.values[0])}`;
        return `\u0E15\u0E31\u0E27\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19\u0E2B\u0E19\u0E36\u0E48\u0E07\u0E43\u0E19 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "\u0E44\u0E21\u0E48\u0E40\u0E01\u0E34\u0E19" : "\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${issue2.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${adj} ${issue2.maximum.toString()} ${sizing.unit ?? "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23"}`;
        return `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${issue2.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${adj} ${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? "\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22" : "\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${issue2.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${adj} ${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${issue2.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${adj} ${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E02\u0E36\u0E49\u0E19\u0E15\u0E49\u0E19\u0E14\u0E49\u0E27\u0E22 "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E25\u0E07\u0E17\u0E49\u0E32\u0E22\u0E14\u0E49\u0E27\u0E22 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35 "${_issue.includes}" \u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21`;
        if (_issue.format === "regex")
          return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E17\u0E35\u0E48\u0E01\u0E33\u0E2B\u0E19\u0E14 ${_issue.pattern}`;
        return `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E08\u0E33\u0E19\u0E27\u0E19\u0E17\u0E35\u0E48\u0E2B\u0E32\u0E23\u0E14\u0E49\u0E27\u0E22 ${issue2.divisor} \u0E44\u0E14\u0E49\u0E25\u0E07\u0E15\u0E31\u0E27`;
      case "unrecognized_keys":
        return `\u0E1E\u0E1A\u0E04\u0E35\u0E22\u0E4C\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E23\u0E39\u0E49\u0E08\u0E31\u0E01: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u0E04\u0E35\u0E22\u0E4C\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E19 ${issue2.origin}`;
      case "invalid_union":
        return "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E44\u0E21\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E22\u0E39\u0E40\u0E19\u0E35\u0E22\u0E19\u0E17\u0E35\u0E48\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E44\u0E27\u0E49";
      case "invalid_element":
        return `\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E19 ${issue2.origin}`;
      default:
        return `\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07`;
    }
  };
};
function th_default() {
  return {
    localeError: error38()
  };
}

// node_modules/zod/v4/locales/tr.js
var parsedType7 = (data) => {
  const t2 = typeof data;
  switch (t2) {
    case "number": {
      return Number.isNaN(data) ? "NaN" : "number";
    }
    case "object": {
      if (Array.isArray(data)) {
        return "array";
      }
      if (data === null) {
        return "null";
      }
      if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
        return data.constructor.name;
      }
    }
  }
  return t2;
};
var error39 = () => {
  const Sizable = {
    string: { unit: "karakter", verb: "olmal\u0131" },
    file: { unit: "bayt", verb: "olmal\u0131" },
    array: { unit: "\xF6\u011Fe", verb: "olmal\u0131" },
    set: { unit: "\xF6\u011Fe", verb: "olmal\u0131" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const Nouns = {
    regex: "girdi",
    email: "e-posta adresi",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO tarih ve saat",
    date: "ISO tarih",
    time: "ISO saat",
    duration: "ISO s\xFCre",
    ipv4: "IPv4 adresi",
    ipv6: "IPv6 adresi",
    cidrv4: "IPv4 aral\u0131\u011F\u0131",
    cidrv6: "IPv6 aral\u0131\u011F\u0131",
    base64: "base64 ile \u015Fifrelenmi\u015F metin",
    base64url: "base64url ile \u015Fifrelenmi\u015F metin",
    json_string: "JSON dizesi",
    e164: "E.164 say\u0131s\u0131",
    jwt: "JWT",
    template_literal: "\u015Eablon dizesi"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `Ge\xE7ersiz de\u011Fer: beklenen ${issue2.expected}, al\u0131nan ${parsedType7(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Ge\xE7ersiz de\u011Fer: beklenen ${stringifyPrimitive(issue2.values[0])}`;
        return `Ge\xE7ersiz se\xE7enek: a\u015Fa\u011F\u0131dakilerden biri olmal\u0131: ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\xC7ok b\xFCy\xFCk: beklenen ${issue2.origin ?? "de\u011Fer"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\xF6\u011Fe"}`;
        return `\xC7ok b\xFCy\xFCk: beklenen ${issue2.origin ?? "de\u011Fer"} ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\xC7ok k\xFC\xE7\xFCk: beklenen ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        return `\xC7ok k\xFC\xE7\xFCk: beklenen ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Ge\xE7ersiz metin: "${_issue.prefix}" ile ba\u015Flamal\u0131`;
        if (_issue.format === "ends_with")
          return `Ge\xE7ersiz metin: "${_issue.suffix}" ile bitmeli`;
        if (_issue.format === "includes")
          return `Ge\xE7ersiz metin: "${_issue.includes}" i\xE7ermeli`;
        if (_issue.format === "regex")
          return `Ge\xE7ersiz metin: ${_issue.pattern} desenine uymal\u0131`;
        return `Ge\xE7ersiz ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Ge\xE7ersiz say\u0131: ${issue2.divisor} ile tam b\xF6l\xFCnebilmeli`;
      case "unrecognized_keys":
        return `Tan\u0131nmayan anahtar${issue2.keys.length > 1 ? "lar" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `${issue2.origin} i\xE7inde ge\xE7ersiz anahtar`;
      case "invalid_union":
        return "Ge\xE7ersiz de\u011Fer";
      case "invalid_element":
        return `${issue2.origin} i\xE7inde ge\xE7ersiz de\u011Fer`;
      default:
        return `Ge\xE7ersiz de\u011Fer`;
    }
  };
};
function tr_default() {
  return {
    localeError: error39()
  };
}

// node_modules/zod/v4/locales/uk.js
var error40 = () => {
  const Sizable = {
    string: { unit: "\u0441\u0438\u043C\u0432\u043E\u043B\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" },
    file: { unit: "\u0431\u0430\u0439\u0442\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" },
    array: { unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" },
    set: { unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "\u0447\u0438\u0441\u043B\u043E";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "\u043C\u0430\u0441\u0438\u0432";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "\u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456",
    email: "\u0430\u0434\u0440\u0435\u0441\u0430 \u0435\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0457 \u043F\u043E\u0448\u0442\u0438",
    url: "URL",
    emoji: "\u0435\u043C\u043E\u0434\u0437\u0456",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "\u0434\u0430\u0442\u0430 \u0442\u0430 \u0447\u0430\u0441 ISO",
    date: "\u0434\u0430\u0442\u0430 ISO",
    time: "\u0447\u0430\u0441 ISO",
    duration: "\u0442\u0440\u0438\u0432\u0430\u043B\u0456\u0441\u0442\u044C ISO",
    ipv4: "\u0430\u0434\u0440\u0435\u0441\u0430 IPv4",
    ipv6: "\u0430\u0434\u0440\u0435\u0441\u0430 IPv6",
    cidrv4: "\u0434\u0456\u0430\u043F\u0430\u0437\u043E\u043D IPv4",
    cidrv6: "\u0434\u0456\u0430\u043F\u0430\u0437\u043E\u043D IPv6",
    base64: "\u0440\u044F\u0434\u043E\u043A \u0443 \u043A\u043E\u0434\u0443\u0432\u0430\u043D\u043D\u0456 base64",
    base64url: "\u0440\u044F\u0434\u043E\u043A \u0443 \u043A\u043E\u0434\u0443\u0432\u0430\u043D\u043D\u0456 base64url",
    json_string: "\u0440\u044F\u0434\u043E\u043A JSON",
    e164: "\u043D\u043E\u043C\u0435\u0440 E.164",
    jwt: "JWT",
    template_literal: "\u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${issue2.expected}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E ${parsedType8(issue2.input)}`;
      // return `Неправильні вхідні дані: очікується ${issue.expected}, отримано ${util.getParsedType(issue.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${stringifyPrimitive(issue2.values[0])}`;
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0430 \u043E\u043F\u0446\u0456\u044F: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F \u043E\u0434\u043D\u0435 \u0437 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432"}`;
        return `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${issue2.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} \u0431\u0443\u0434\u0435 ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${issue2.origin} \u0431\u0443\u0434\u0435 ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043F\u043E\u0447\u0438\u043D\u0430\u0442\u0438\u0441\u044F \u0437 "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0437\u0430\u043A\u0456\u043D\u0447\u0443\u0432\u0430\u0442\u0438\u0441\u044F \u043D\u0430 "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043C\u0456\u0441\u0442\u0438\u0442\u0438 "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0430\u0442\u0438 \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${_issue.pattern}`;
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0435 \u0447\u0438\u0441\u043B\u043E: \u043F\u043E\u0432\u0438\u043D\u043D\u043E \u0431\u0443\u0442\u0438 \u043A\u0440\u0430\u0442\u043D\u0438\u043C ${issue2.divisor}`;
      case "unrecognized_keys":
        return `\u041D\u0435\u0440\u043E\u0437\u043F\u0456\u0437\u043D\u0430\u043D\u0438\u0439 \u043A\u043B\u044E\u0447${issue2.keys.length > 1 ? "\u0456" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u043A\u043B\u044E\u0447 \u0443 ${issue2.origin}`;
      case "invalid_union":
        return "\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456";
      case "invalid_element":
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u0443 ${issue2.origin}`;
      default:
        return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456`;
    }
  };
};
function uk_default() {
  return {
    localeError: error40()
  };
}

// node_modules/zod/v4/locales/ua.js
function ua_default() {
  return uk_default();
}

// node_modules/zod/v4/locales/ur.js
var error41 = () => {
  const Sizable = {
    string: { unit: "\u062D\u0631\u0648\u0641", verb: "\u06C1\u0648\u0646\u0627" },
    file: { unit: "\u0628\u0627\u0626\u0679\u0633", verb: "\u06C1\u0648\u0646\u0627" },
    array: { unit: "\u0622\u0626\u0679\u0645\u0632", verb: "\u06C1\u0648\u0646\u0627" },
    set: { unit: "\u0622\u0626\u0679\u0645\u0632", verb: "\u06C1\u0648\u0646\u0627" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "\u0646\u0645\u0628\u0631";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "\u0622\u0631\u06D2";
        }
        if (data === null) {
          return "\u0646\u0644";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "\u0627\u0646 \u067E\u0679",
    email: "\u0627\u06CC \u0645\u06CC\u0644 \u0627\u06CC\u0688\u0631\u06CC\u0633",
    url: "\u06CC\u0648 \u0622\u0631 \u0627\u06CC\u0644",
    emoji: "\u0627\u06CC\u0645\u0648\u062C\u06CC",
    uuid: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
    uuidv4: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC \u0648\u06CC 4",
    uuidv6: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC \u0648\u06CC 6",
    nanoid: "\u0646\u06CC\u0646\u0648 \u0622\u0626\u06CC \u0688\u06CC",
    guid: "\u062C\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
    cuid: "\u0633\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
    cuid2: "\u0633\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC 2",
    ulid: "\u06CC\u0648 \u0627\u06CC\u0644 \u0622\u0626\u06CC \u0688\u06CC",
    xid: "\u0627\u06CC\u06A9\u0633 \u0622\u0626\u06CC \u0688\u06CC",
    ksuid: "\u06A9\u06D2 \u0627\u06CC\u0633 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
    datetime: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0688\u06CC\u0679 \u0679\u0627\u0626\u0645",
    date: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u062A\u0627\u0631\u06CC\u062E",
    time: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0648\u0642\u062A",
    duration: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0645\u062F\u062A",
    ipv4: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 4 \u0627\u06CC\u0688\u0631\u06CC\u0633",
    ipv6: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 6 \u0627\u06CC\u0688\u0631\u06CC\u0633",
    cidrv4: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 4 \u0631\u06CC\u0646\u062C",
    cidrv6: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 6 \u0631\u06CC\u0646\u062C",
    base64: "\u0628\u06CC\u0633 64 \u0627\u0646 \u06A9\u0648\u0688\u0688 \u0633\u0679\u0631\u0646\u06AF",
    base64url: "\u0628\u06CC\u0633 64 \u06CC\u0648 \u0622\u0631 \u0627\u06CC\u0644 \u0627\u0646 \u06A9\u0648\u0688\u0688 \u0633\u0679\u0631\u0646\u06AF",
    json_string: "\u062C\u06D2 \u0627\u06CC\u0633 \u0627\u0648 \u0627\u06CC\u0646 \u0633\u0679\u0631\u0646\u06AF",
    e164: "\u0627\u06CC 164 \u0646\u0645\u0628\u0631",
    jwt: "\u062C\u06D2 \u0688\u0628\u0644\u06CC\u0648 \u0679\u06CC",
    template_literal: "\u0627\u0646 \u067E\u0679"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${issue2.expected} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627\u060C ${parsedType8(issue2.input)} \u0645\u0648\u0635\u0648\u0644 \u06C1\u0648\u0627`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${stringifyPrimitive(issue2.values[0])} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
        return `\u063A\u0644\u0637 \u0622\u067E\u0634\u0646: ${joinValues(issue2.values, "|")} \u0645\u06CC\u06BA \u0633\u06D2 \u0627\u06CC\u06A9 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u0628\u06C1\u062A \u0628\u0691\u0627: ${issue2.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u06D2 ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u0639\u0646\u0627\u0635\u0631"} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`;
        return `\u0628\u06C1\u062A \u0628\u0691\u0627: ${issue2.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u0627 ${adj}${issue2.maximum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${issue2.origin} \u06A9\u06D2 ${adj}${issue2.minimum.toString()} ${sizing.unit} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`;
        }
        return `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${issue2.origin} \u06A9\u0627 ${adj}${issue2.minimum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${_issue.prefix}" \u0633\u06D2 \u0634\u0631\u0648\u0639 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
        }
        if (_issue.format === "ends_with")
          return `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${_issue.suffix}" \u067E\u0631 \u062E\u062A\u0645 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
        if (_issue.format === "includes")
          return `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${_issue.includes}" \u0634\u0627\u0645\u0644 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
        if (_issue.format === "regex")
          return `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: \u067E\u06CC\u0679\u0631\u0646 ${_issue.pattern} \u0633\u06D2 \u0645\u06CC\u0686 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
        return `\u063A\u0644\u0637 ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u063A\u0644\u0637 \u0646\u0645\u0628\u0631: ${issue2.divisor} \u06A9\u0627 \u0645\u0636\u0627\u0639\u0641 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`;
      case "unrecognized_keys":
        return `\u063A\u06CC\u0631 \u062A\u0633\u0644\u06CC\u0645 \u0634\u062F\u06C1 \u06A9\u06CC${issue2.keys.length > 1 ? "\u0632" : ""}: ${joinValues(issue2.keys, "\u060C ")}`;
      case "invalid_key":
        return `${issue2.origin} \u0645\u06CC\u06BA \u063A\u0644\u0637 \u06A9\u06CC`;
      case "invalid_union":
        return "\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679";
      case "invalid_element":
        return `${issue2.origin} \u0645\u06CC\u06BA \u063A\u0644\u0637 \u0648\u06CC\u0644\u06CC\u0648`;
      default:
        return `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679`;
    }
  };
};
function ur_default() {
  return {
    localeError: error41()
  };
}

// node_modules/zod/v4/locales/vi.js
var error42 = () => {
  const Sizable = {
    string: { unit: "k\xFD t\u1EF1", verb: "c\xF3" },
    file: { unit: "byte", verb: "c\xF3" },
    array: { unit: "ph\u1EA7n t\u1EED", verb: "c\xF3" },
    set: { unit: "ph\u1EA7n t\u1EED", verb: "c\xF3" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "s\u1ED1";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "m\u1EA3ng";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "\u0111\u1EA7u v\xE0o",
    email: "\u0111\u1ECBa ch\u1EC9 email",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ng\xE0y gi\u1EDD ISO",
    date: "ng\xE0y ISO",
    time: "gi\u1EDD ISO",
    duration: "kho\u1EA3ng th\u1EDDi gian ISO",
    ipv4: "\u0111\u1ECBa ch\u1EC9 IPv4",
    ipv6: "\u0111\u1ECBa ch\u1EC9 IPv6",
    cidrv4: "d\u1EA3i IPv4",
    cidrv6: "d\u1EA3i IPv6",
    base64: "chu\u1ED7i m\xE3 h\xF3a base64",
    base64url: "chu\u1ED7i m\xE3 h\xF3a base64url",
    json_string: "chu\u1ED7i JSON",
    e164: "s\u1ED1 E.164",
    jwt: "JWT",
    template_literal: "\u0111\u1EA7u v\xE0o"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${issue2.expected}, nh\u1EADn \u0111\u01B0\u1EE3c ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${stringifyPrimitive(issue2.values[0])}`;
        return `T\xF9y ch\u1ECDn kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i m\u1ED9t trong c\xE1c gi\xE1 tr\u1ECB ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${issue2.origin ?? "gi\xE1 tr\u1ECB"} ${sizing.verb} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "ph\u1EA7n t\u1EED"}`;
        return `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${issue2.origin ?? "gi\xE1 tr\u1ECB"} ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i b\u1EAFt \u0111\u1EA7u b\u1EB1ng "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i k\u1EBFt th\xFAc b\u1EB1ng "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i bao g\u1ED3m "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i kh\u1EDBp v\u1EDBi m\u1EABu ${_issue.pattern}`;
        return `${Nouns[_issue.format] ?? issue2.format} kh\xF4ng h\u1EE3p l\u1EC7`;
      }
      case "not_multiple_of":
        return `S\u1ED1 kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i l\xE0 b\u1ED9i s\u1ED1 c\u1EE7a ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Kh\xF3a kh\xF4ng \u0111\u01B0\u1EE3c nh\u1EADn d\u1EA1ng: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Kh\xF3a kh\xF4ng h\u1EE3p l\u1EC7 trong ${issue2.origin}`;
      case "invalid_union":
        return "\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7";
      case "invalid_element":
        return `Gi\xE1 tr\u1ECB kh\xF4ng h\u1EE3p l\u1EC7 trong ${issue2.origin}`;
      default:
        return `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7`;
    }
  };
};
function vi_default() {
  return {
    localeError: error42()
  };
}

// node_modules/zod/v4/locales/zh-CN.js
var error43 = () => {
  const Sizable = {
    string: { unit: "\u5B57\u7B26", verb: "\u5305\u542B" },
    file: { unit: "\u5B57\u8282", verb: "\u5305\u542B" },
    array: { unit: "\u9879", verb: "\u5305\u542B" },
    set: { unit: "\u9879", verb: "\u5305\u542B" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "\u975E\u6570\u5B57(NaN)" : "\u6570\u5B57";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "\u6570\u7EC4";
        }
        if (data === null) {
          return "\u7A7A\u503C(null)";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "\u8F93\u5165",
    email: "\u7535\u5B50\u90AE\u4EF6",
    url: "URL",
    emoji: "\u8868\u60C5\u7B26\u53F7",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO\u65E5\u671F\u65F6\u95F4",
    date: "ISO\u65E5\u671F",
    time: "ISO\u65F6\u95F4",
    duration: "ISO\u65F6\u957F",
    ipv4: "IPv4\u5730\u5740",
    ipv6: "IPv6\u5730\u5740",
    cidrv4: "IPv4\u7F51\u6BB5",
    cidrv6: "IPv6\u7F51\u6BB5",
    base64: "base64\u7F16\u7801\u5B57\u7B26\u4E32",
    base64url: "base64url\u7F16\u7801\u5B57\u7B26\u4E32",
    json_string: "JSON\u5B57\u7B26\u4E32",
    e164: "E.164\u53F7\u7801",
    jwt: "JWT",
    template_literal: "\u8F93\u5165"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${issue2.expected}\uFF0C\u5B9E\u9645\u63A5\u6536 ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${stringifyPrimitive(issue2.values[0])}`;
        return `\u65E0\u6548\u9009\u9879\uFF1A\u671F\u671B\u4EE5\u4E0B\u4E4B\u4E00 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${issue2.origin ?? "\u503C"} ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u4E2A\u5143\u7D20"}`;
        return `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${issue2.origin ?? "\u503C"} ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${issue2.origin} ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${issue2.origin} ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${_issue.prefix}" \u5F00\u5934`;
        if (_issue.format === "ends_with")
          return `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${_issue.suffix}" \u7ED3\u5C3E`;
        if (_issue.format === "includes")
          return `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u5305\u542B "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u6EE1\u8DB3\u6B63\u5219\u8868\u8FBE\u5F0F ${_issue.pattern}`;
        return `\u65E0\u6548${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u65E0\u6548\u6570\u5B57\uFF1A\u5FC5\u987B\u662F ${issue2.divisor} \u7684\u500D\u6570`;
      case "unrecognized_keys":
        return `\u51FA\u73B0\u672A\u77E5\u7684\u952E(key): ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `${issue2.origin} \u4E2D\u7684\u952E(key)\u65E0\u6548`;
      case "invalid_union":
        return "\u65E0\u6548\u8F93\u5165";
      case "invalid_element":
        return `${issue2.origin} \u4E2D\u5305\u542B\u65E0\u6548\u503C(value)`;
      default:
        return `\u65E0\u6548\u8F93\u5165`;
    }
  };
};
function zh_CN_default() {
  return {
    localeError: error43()
  };
}

// node_modules/zod/v4/locales/zh-TW.js
var error44 = () => {
  const Sizable = {
    string: { unit: "\u5B57\u5143", verb: "\u64C1\u6709" },
    file: { unit: "\u4F4D\u5143\u7D44", verb: "\u64C1\u6709" },
    array: { unit: "\u9805\u76EE", verb: "\u64C1\u6709" },
    set: { unit: "\u9805\u76EE", verb: "\u64C1\u6709" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "number";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "array";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "\u8F38\u5165",
    email: "\u90F5\u4EF6\u5730\u5740",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO \u65E5\u671F\u6642\u9593",
    date: "ISO \u65E5\u671F",
    time: "ISO \u6642\u9593",
    duration: "ISO \u671F\u9593",
    ipv4: "IPv4 \u4F4D\u5740",
    ipv6: "IPv6 \u4F4D\u5740",
    cidrv4: "IPv4 \u7BC4\u570D",
    cidrv6: "IPv6 \u7BC4\u570D",
    base64: "base64 \u7DE8\u78BC\u5B57\u4E32",
    base64url: "base64url \u7DE8\u78BC\u5B57\u4E32",
    json_string: "JSON \u5B57\u4E32",
    e164: "E.164 \u6578\u503C",
    jwt: "JWT",
    template_literal: "\u8F38\u5165"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${issue2.expected}\uFF0C\u4F46\u6536\u5230 ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${stringifyPrimitive(issue2.values[0])}`;
        return `\u7121\u6548\u7684\u9078\u9805\uFF1A\u9810\u671F\u70BA\u4EE5\u4E0B\u5176\u4E2D\u4E4B\u4E00 ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${issue2.origin ?? "\u503C"} \u61C9\u70BA ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "\u500B\u5143\u7D20"}`;
        return `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${issue2.origin ?? "\u503C"} \u61C9\u70BA ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${issue2.origin} \u61C9\u70BA ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${issue2.origin} \u61C9\u70BA ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${_issue.prefix}" \u958B\u982D`;
        }
        if (_issue.format === "ends_with")
          return `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${_issue.suffix}" \u7D50\u5C3E`;
        if (_issue.format === "includes")
          return `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u5305\u542B "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u7B26\u5408\u683C\u5F0F ${_issue.pattern}`;
        return `\u7121\u6548\u7684 ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `\u7121\u6548\u7684\u6578\u5B57\uFF1A\u5FC5\u9808\u70BA ${issue2.divisor} \u7684\u500D\u6578`;
      case "unrecognized_keys":
        return `\u7121\u6CD5\u8B58\u5225\u7684\u9375\u503C${issue2.keys.length > 1 ? "\u5011" : ""}\uFF1A${joinValues(issue2.keys, "\u3001")}`;
      case "invalid_key":
        return `${issue2.origin} \u4E2D\u6709\u7121\u6548\u7684\u9375\u503C`;
      case "invalid_union":
        return "\u7121\u6548\u7684\u8F38\u5165\u503C";
      case "invalid_element":
        return `${issue2.origin} \u4E2D\u6709\u7121\u6548\u7684\u503C`;
      default:
        return `\u7121\u6548\u7684\u8F38\u5165\u503C`;
    }
  };
};
function zh_TW_default() {
  return {
    localeError: error44()
  };
}

// node_modules/zod/v4/locales/yo.js
var error45 = () => {
  const Sizable = {
    string: { unit: "\xE0mi", verb: "n\xED" },
    file: { unit: "bytes", verb: "n\xED" },
    array: { unit: "nkan", verb: "n\xED" },
    set: { unit: "nkan", verb: "n\xED" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const parsedType8 = (data) => {
    const t2 = typeof data;
    switch (t2) {
      case "number": {
        return Number.isNaN(data) ? "NaN" : "n\u1ECD\u0301mb\xE0";
      }
      case "object": {
        if (Array.isArray(data)) {
          return "akop\u1ECD";
        }
        if (data === null) {
          return "null";
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name;
        }
      }
    }
    return t2;
  };
  const Nouns = {
    regex: "\u1EB9\u0300r\u1ECD \xECb\xE1w\u1ECDl\xE9",
    email: "\xE0d\xEDr\u1EB9\u0301s\xEC \xECm\u1EB9\u0301l\xEC",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "\xE0k\xF3k\xF2 ISO",
    date: "\u1ECDj\u1ECD\u0301 ISO",
    time: "\xE0k\xF3k\xF2 ISO",
    duration: "\xE0k\xF3k\xF2 t\xF3 p\xE9 ISO",
    ipv4: "\xE0d\xEDr\u1EB9\u0301s\xEC IPv4",
    ipv6: "\xE0d\xEDr\u1EB9\u0301s\xEC IPv6",
    cidrv4: "\xE0gb\xE8gb\xE8 IPv4",
    cidrv6: "\xE0gb\xE8gb\xE8 IPv6",
    base64: "\u1ECD\u0300r\u1ECD\u0300 t\xED a k\u1ECD\u0301 n\xED base64",
    base64url: "\u1ECD\u0300r\u1ECD\u0300 base64url",
    json_string: "\u1ECD\u0300r\u1ECD\u0300 JSON",
    e164: "n\u1ECD\u0301mb\xE0 E.164",
    jwt: "JWT",
    template_literal: "\u1EB9\u0300r\u1ECD \xECb\xE1w\u1ECDl\xE9"
  };
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type":
        return `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi ${issue2.expected}, \xE0m\u1ECD\u0300 a r\xED ${parsedType8(issue2.input)}`;
      case "invalid_value":
        if (issue2.values.length === 1)
          return `\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e: a n\xED l\xE1ti fi ${stringifyPrimitive(issue2.values[0])}`;
        return `\xC0\u1E63\xE0y\xE0n a\u1E63\xEC\u1E63e: yan \u1ECD\u0300kan l\xE1ra ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `T\xF3 p\u1ECD\u0300 j\xF9: a n\xED l\xE1ti j\u1EB9\u0301 p\xE9 ${issue2.origin ?? "iye"} ${sizing.verb} ${adj}${issue2.maximum} ${sizing.unit}`;
        return `T\xF3 p\u1ECD\u0300 j\xF9: a n\xED l\xE1ti j\u1EB9\u0301 ${adj}${issue2.maximum}`;
      }
      case "too_small": {
        const adj = issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `K\xE9r\xE9 ju: a n\xED l\xE1ti j\u1EB9\u0301 p\xE9 ${issue2.origin} ${sizing.verb} ${adj}${issue2.minimum} ${sizing.unit}`;
        return `K\xE9r\xE9 ju: a n\xED l\xE1ti j\u1EB9\u0301 ${adj}${issue2.minimum}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with")
          return `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 b\u1EB9\u0300r\u1EB9\u0300 p\u1EB9\u0300l\xFA "${_issue.prefix}"`;
        if (_issue.format === "ends_with")
          return `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 par\xED p\u1EB9\u0300l\xFA "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 n\xED "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `\u1ECC\u0300r\u1ECD\u0300 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 b\xE1 \xE0p\u1EB9\u1EB9r\u1EB9 mu ${_issue.pattern}`;
        return `A\u1E63\xEC\u1E63e: ${Nouns[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `N\u1ECD\u0301mb\xE0 a\u1E63\xEC\u1E63e: gb\u1ECD\u0301d\u1ECD\u0300 j\u1EB9\u0301 \xE8y\xE0 p\xEDp\xEDn ti ${issue2.divisor}`;
      case "unrecognized_keys":
        return `B\u1ECDt\xECn\xEC \xE0\xECm\u1ECD\u0300: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `B\u1ECDt\xECn\xEC a\u1E63\xEC\u1E63e n\xEDn\xFA ${issue2.origin}`;
      case "invalid_union":
        return "\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e";
      case "invalid_element":
        return `Iye a\u1E63\xEC\u1E63e n\xEDn\xFA ${issue2.origin}`;
      default:
        return "\xCCb\xE1w\u1ECDl\xE9 a\u1E63\xEC\u1E63e";
    }
  };
};
function yo_default() {
  return {
    localeError: error45()
  };
}

// node_modules/zod/v4/core/registries.js
var _a;
var $output = Symbol("ZodOutput");
var $input = Symbol("ZodInput");
var $ZodRegistry = class {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap();
    this._idmap = /* @__PURE__ */ new Map();
  }
  add(schema, ..._meta) {
    const meta3 = _meta[0];
    this._map.set(schema, meta3);
    if (meta3 && typeof meta3 === "object" && "id" in meta3) {
      if (this._idmap.has(meta3.id)) {
        throw new Error(`ID ${meta3.id} already exists in the registry`);
      }
      this._idmap.set(meta3.id, schema);
    }
    return this;
  }
  clear() {
    this._map = /* @__PURE__ */ new WeakMap();
    this._idmap = /* @__PURE__ */ new Map();
    return this;
  }
  remove(schema) {
    const meta3 = this._map.get(schema);
    if (meta3 && typeof meta3 === "object" && "id" in meta3) {
      this._idmap.delete(meta3.id);
    }
    this._map.delete(schema);
    return this;
  }
  get(schema) {
    const p = schema._zod.parent;
    if (p) {
      const pm = { ...this.get(p) ?? {} };
      delete pm.id;
      const f = { ...pm, ...this._map.get(schema) };
      return Object.keys(f).length ? f : void 0;
    }
    return this._map.get(schema);
  }
  has(schema) {
    return this._map.has(schema);
  }
};
function registry() {
  return new $ZodRegistry();
}
(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
var globalRegistry = globalThis.__zod_globalRegistry;

// node_modules/zod/v4/core/api.js
function _string(Class2, params) {
  return new Class2({
    type: "string",
    ...normalizeParams(params)
  });
}
function _coercedString(Class2, params) {
  return new Class2({
    type: "string",
    coerce: true,
    ...normalizeParams(params)
  });
}
function _email(Class2, params) {
  return new Class2({
    type: "string",
    format: "email",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _guid(Class2, params) {
  return new Class2({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _uuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _uuidv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...normalizeParams(params)
  });
}
function _uuidv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v6",
    ...normalizeParams(params)
  });
}
function _uuidv7(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v7",
    ...normalizeParams(params)
  });
}
function _url(Class2, params) {
  return new Class2({
    type: "string",
    format: "url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _emoji2(Class2, params) {
  return new Class2({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _nanoid(Class2, params) {
  return new Class2({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cuid2(Class2, params) {
  return new Class2({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ulid(Class2, params) {
  return new Class2({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _xid(Class2, params) {
  return new Class2({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ksuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ipv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ipv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _mac(Class2, params) {
  return new Class2({
    type: "string",
    format: "mac",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cidrv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cidrv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _base64(Class2, params) {
  return new Class2({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _base64url(Class2, params) {
  return new Class2({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _e164(Class2, params) {
  return new Class2({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _jwt(Class2, params) {
  return new Class2({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
var TimePrecision = {
  Any: null,
  Minute: -1,
  Second: 0,
  Millisecond: 3,
  Microsecond: 6
};
function _isoDateTime(Class2, params) {
  return new Class2({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: false,
    local: false,
    precision: null,
    ...normalizeParams(params)
  });
}
function _isoDate(Class2, params) {
  return new Class2({
    type: "string",
    format: "date",
    check: "string_format",
    ...normalizeParams(params)
  });
}
function _isoTime(Class2, params) {
  return new Class2({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(params)
  });
}
function _isoDuration(Class2, params) {
  return new Class2({
    type: "string",
    format: "duration",
    check: "string_format",
    ...normalizeParams(params)
  });
}
function _number(Class2, params) {
  return new Class2({
    type: "number",
    checks: [],
    ...normalizeParams(params)
  });
}
function _coercedNumber(Class2, params) {
  return new Class2({
    type: "number",
    coerce: true,
    checks: [],
    ...normalizeParams(params)
  });
}
function _int(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "safeint",
    ...normalizeParams(params)
  });
}
function _float32(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "float32",
    ...normalizeParams(params)
  });
}
function _float64(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "float64",
    ...normalizeParams(params)
  });
}
function _int32(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "int32",
    ...normalizeParams(params)
  });
}
function _uint32(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "uint32",
    ...normalizeParams(params)
  });
}
function _boolean(Class2, params) {
  return new Class2({
    type: "boolean",
    ...normalizeParams(params)
  });
}
function _coercedBoolean(Class2, params) {
  return new Class2({
    type: "boolean",
    coerce: true,
    ...normalizeParams(params)
  });
}
function _bigint(Class2, params) {
  return new Class2({
    type: "bigint",
    ...normalizeParams(params)
  });
}
function _coercedBigint(Class2, params) {
  return new Class2({
    type: "bigint",
    coerce: true,
    ...normalizeParams(params)
  });
}
function _int64(Class2, params) {
  return new Class2({
    type: "bigint",
    check: "bigint_format",
    abort: false,
    format: "int64",
    ...normalizeParams(params)
  });
}
function _uint64(Class2, params) {
  return new Class2({
    type: "bigint",
    check: "bigint_format",
    abort: false,
    format: "uint64",
    ...normalizeParams(params)
  });
}
function _symbol(Class2, params) {
  return new Class2({
    type: "symbol",
    ...normalizeParams(params)
  });
}
function _undefined2(Class2, params) {
  return new Class2({
    type: "undefined",
    ...normalizeParams(params)
  });
}
function _null2(Class2, params) {
  return new Class2({
    type: "null",
    ...normalizeParams(params)
  });
}
function _any(Class2) {
  return new Class2({
    type: "any"
  });
}
function _unknown(Class2) {
  return new Class2({
    type: "unknown"
  });
}
function _never(Class2, params) {
  return new Class2({
    type: "never",
    ...normalizeParams(params)
  });
}
function _void(Class2, params) {
  return new Class2({
    type: "void",
    ...normalizeParams(params)
  });
}
function _date(Class2, params) {
  return new Class2({
    type: "date",
    ...normalizeParams(params)
  });
}
function _coercedDate(Class2, params) {
  return new Class2({
    type: "date",
    coerce: true,
    ...normalizeParams(params)
  });
}
function _nan(Class2, params) {
  return new Class2({
    type: "nan",
    ...normalizeParams(params)
  });
}
function _lt(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
function _lte(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
function _gt(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
function _gte(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
function _positive(params) {
  return _gt(0, params);
}
function _negative(params) {
  return _lt(0, params);
}
function _nonpositive(params) {
  return _lte(0, params);
}
function _nonnegative(params) {
  return _gte(0, params);
}
function _multipleOf(value, params) {
  return new $ZodCheckMultipleOf({
    check: "multiple_of",
    ...normalizeParams(params),
    value
  });
}
function _maxSize(maximum, params) {
  return new $ZodCheckMaxSize({
    check: "max_size",
    ...normalizeParams(params),
    maximum
  });
}
function _minSize(minimum, params) {
  return new $ZodCheckMinSize({
    check: "min_size",
    ...normalizeParams(params),
    minimum
  });
}
function _size(size, params) {
  return new $ZodCheckSizeEquals({
    check: "size_equals",
    ...normalizeParams(params),
    size
  });
}
function _maxLength(maximum, params) {
  const ch = new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(params),
    maximum
  });
  return ch;
}
function _minLength(minimum, params) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(params),
    minimum
  });
}
function _length(length, params) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(params),
    length
  });
}
function _regex(pattern, params) {
  return new $ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...normalizeParams(params),
    pattern
  });
}
function _lowercase(params) {
  return new $ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...normalizeParams(params)
  });
}
function _uppercase(params) {
  return new $ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...normalizeParams(params)
  });
}
function _includes(includes, params) {
  return new $ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...normalizeParams(params),
    includes
  });
}
function _startsWith(prefix, params) {
  return new $ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...normalizeParams(params),
    prefix
  });
}
function _endsWith(suffix, params) {
  return new $ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...normalizeParams(params),
    suffix
  });
}
function _property(property, schema, params) {
  return new $ZodCheckProperty({
    check: "property",
    property,
    schema,
    ...normalizeParams(params)
  });
}
function _mime(types, params) {
  return new $ZodCheckMimeType({
    check: "mime_type",
    mime: types,
    ...normalizeParams(params)
  });
}
function _overwrite(tx) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx
  });
}
function _normalize(form) {
  return _overwrite((input) => input.normalize(form));
}
function _trim() {
  return _overwrite((input) => input.trim());
}
function _toLowerCase() {
  return _overwrite((input) => input.toLowerCase());
}
function _toUpperCase() {
  return _overwrite((input) => input.toUpperCase());
}
function _slugify() {
  return _overwrite((input) => slugify(input));
}
function _array(Class2, element, params) {
  return new Class2({
    type: "array",
    element,
    // get element() {
    //   return element;
    // },
    ...normalizeParams(params)
  });
}
function _union(Class2, options, params) {
  return new Class2({
    type: "union",
    options,
    ...normalizeParams(params)
  });
}
function _xor(Class2, options, params) {
  return new Class2({
    type: "union",
    options,
    inclusive: false,
    ...normalizeParams(params)
  });
}
function _discriminatedUnion(Class2, discriminator, options, params) {
  return new Class2({
    type: "union",
    options,
    discriminator,
    ...normalizeParams(params)
  });
}
function _intersection(Class2, left, right) {
  return new Class2({
    type: "intersection",
    left,
    right
  });
}
function _tuple(Class2, items, _paramsOrRest, _params) {
  const hasRest = _paramsOrRest instanceof $ZodType;
  const params = hasRest ? _params : _paramsOrRest;
  const rest = hasRest ? _paramsOrRest : null;
  return new Class2({
    type: "tuple",
    items,
    rest,
    ...normalizeParams(params)
  });
}
function _record(Class2, keyType, valueType, params) {
  return new Class2({
    type: "record",
    keyType,
    valueType,
    ...normalizeParams(params)
  });
}
function _map(Class2, keyType, valueType, params) {
  return new Class2({
    type: "map",
    keyType,
    valueType,
    ...normalizeParams(params)
  });
}
function _set(Class2, valueType, params) {
  return new Class2({
    type: "set",
    valueType,
    ...normalizeParams(params)
  });
}
function _enum(Class2, values, params) {
  const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
  return new Class2({
    type: "enum",
    entries,
    ...normalizeParams(params)
  });
}
function _nativeEnum(Class2, entries, params) {
  return new Class2({
    type: "enum",
    entries,
    ...normalizeParams(params)
  });
}
function _literal(Class2, value, params) {
  return new Class2({
    type: "literal",
    values: Array.isArray(value) ? value : [value],
    ...normalizeParams(params)
  });
}
function _file(Class2, params) {
  return new Class2({
    type: "file",
    ...normalizeParams(params)
  });
}
function _transform(Class2, fn) {
  return new Class2({
    type: "transform",
    transform: fn
  });
}
function _optional(Class2, innerType) {
  return new Class2({
    type: "optional",
    innerType
  });
}
function _nullable(Class2, innerType) {
  return new Class2({
    type: "nullable",
    innerType
  });
}
function _default(Class2, innerType, defaultValue) {
  return new Class2({
    type: "default",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
    }
  });
}
function _nonoptional(Class2, innerType, params) {
  return new Class2({
    type: "nonoptional",
    innerType,
    ...normalizeParams(params)
  });
}
function _success(Class2, innerType) {
  return new Class2({
    type: "success",
    innerType
  });
}
function _catch(Class2, innerType, catchValue) {
  return new Class2({
    type: "catch",
    innerType,
    catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
  });
}
function _pipe(Class2, in_, out) {
  return new Class2({
    type: "pipe",
    in: in_,
    out
  });
}
function _readonly(Class2, innerType) {
  return new Class2({
    type: "readonly",
    innerType
  });
}
function _templateLiteral(Class2, parts, params) {
  return new Class2({
    type: "template_literal",
    parts,
    ...normalizeParams(params)
  });
}
function _lazy(Class2, getter) {
  return new Class2({
    type: "lazy",
    getter
  });
}
function _promise(Class2, innerType) {
  return new Class2({
    type: "promise",
    innerType
  });
}
function _custom(Class2, fn, _params) {
  const norm = normalizeParams(_params);
  norm.abort ?? (norm.abort = true);
  const schema = new Class2({
    type: "custom",
    check: "custom",
    fn,
    ...norm
  });
  return schema;
}
function _refine(Class2, fn, _params) {
  const schema = new Class2({
    type: "custom",
    check: "custom",
    fn,
    ...normalizeParams(_params)
  });
  return schema;
}
function _superRefine(fn) {
  const ch = _check((payload) => {
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, ch._zod.def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = ch);
        _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
        payload.issues.push(issue(_issue));
      }
    };
    return fn(payload.value, payload);
  });
  return ch;
}
function _check(fn, params) {
  const ch = new $ZodCheck({
    check: "custom",
    ...normalizeParams(params)
  });
  ch._zod.check = fn;
  return ch;
}
function describe(description) {
  const ch = new $ZodCheck({ check: "describe" });
  ch._zod.onattach = [
    (inst) => {
      const existing = globalRegistry.get(inst) ?? {};
      globalRegistry.add(inst, { ...existing, description });
    }
  ];
  ch._zod.check = () => {
  };
  return ch;
}
function meta(metadata) {
  const ch = new $ZodCheck({ check: "meta" });
  ch._zod.onattach = [
    (inst) => {
      const existing = globalRegistry.get(inst) ?? {};
      globalRegistry.add(inst, { ...existing, ...metadata });
    }
  ];
  ch._zod.check = () => {
  };
  return ch;
}
function _stringbool(Classes, _params) {
  const params = normalizeParams(_params);
  let truthyArray = params.truthy ?? ["true", "1", "yes", "on", "y", "enabled"];
  let falsyArray = params.falsy ?? ["false", "0", "no", "off", "n", "disabled"];
  if (params.case !== "sensitive") {
    truthyArray = truthyArray.map((v) => typeof v === "string" ? v.toLowerCase() : v);
    falsyArray = falsyArray.map((v) => typeof v === "string" ? v.toLowerCase() : v);
  }
  const truthySet = new Set(truthyArray);
  const falsySet = new Set(falsyArray);
  const _Codec = Classes.Codec ?? $ZodCodec;
  const _Boolean = Classes.Boolean ?? $ZodBoolean;
  const _String = Classes.String ?? $ZodString;
  const stringSchema = new _String({ type: "string", error: params.error });
  const booleanSchema = new _Boolean({ type: "boolean", error: params.error });
  const codec2 = new _Codec({
    type: "pipe",
    in: stringSchema,
    out: booleanSchema,
    transform: ((input, payload) => {
      let data = input;
      if (params.case !== "sensitive")
        data = data.toLowerCase();
      if (truthySet.has(data)) {
        return true;
      } else if (falsySet.has(data)) {
        return false;
      } else {
        payload.issues.push({
          code: "invalid_value",
          expected: "stringbool",
          values: [...truthySet, ...falsySet],
          input: payload.value,
          inst: codec2,
          continue: false
        });
        return {};
      }
    }),
    reverseTransform: ((input, _payload) => {
      if (input === true) {
        return truthyArray[0] || "true";
      } else {
        return falsyArray[0] || "false";
      }
    }),
    error: params.error
  });
  return codec2;
}
function _stringFormat(Class2, format, fnOrRegex, _params = {}) {
  const params = normalizeParams(_params);
  const def = {
    ...normalizeParams(_params),
    check: "string_format",
    type: "string",
    format,
    fn: typeof fnOrRegex === "function" ? fnOrRegex : (val) => fnOrRegex.test(val),
    ...params
  };
  if (fnOrRegex instanceof RegExp) {
    def.pattern = fnOrRegex;
  }
  const inst = new Class2(def);
  return inst;
}

// node_modules/zod/v4/core/to-json-schema.js
function initializeContext(params) {
  let target = params?.target ?? "draft-2020-12";
  if (target === "draft-4")
    target = "draft-04";
  if (target === "draft-7")
    target = "draft-07";
  return {
    processors: params.processors ?? {},
    metadataRegistry: params?.metadata ?? globalRegistry,
    target,
    unrepresentable: params?.unrepresentable ?? "throw",
    override: params?.override ?? (() => {
    }),
    io: params?.io ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    cycles: params?.cycles ?? "ref",
    reused: params?.reused ?? "inline",
    external: params?.external ?? void 0
  };
}
function process2(schema, ctx, _params = { path: [], schemaPath: [] }) {
  var _a2;
  const def = schema._zod.def;
  const seen = ctx.seen.get(schema);
  if (seen) {
    seen.count++;
    const isCycle = _params.schemaPath.includes(schema);
    if (isCycle) {
      seen.cycle = _params.path;
    }
    return seen.schema;
  }
  const result = { schema: {}, count: 1, cycle: void 0, path: _params.path };
  ctx.seen.set(schema, result);
  const overrideSchema = schema._zod.toJSONSchema?.();
  if (overrideSchema) {
    result.schema = overrideSchema;
  } else {
    const params = {
      ..._params,
      schemaPath: [..._params.schemaPath, schema],
      path: _params.path
    };
    const parent = schema._zod.parent;
    if (parent) {
      result.ref = parent;
      process2(parent, ctx, params);
      ctx.seen.get(parent).isParent = true;
    } else if (schema._zod.processJSONSchema) {
      schema._zod.processJSONSchema(ctx, result.schema, params);
    } else {
      const _json = result.schema;
      const processor = ctx.processors[def.type];
      if (!processor) {
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
      }
      processor(schema, ctx, _json, params);
    }
  }
  const meta3 = ctx.metadataRegistry.get(schema);
  if (meta3)
    Object.assign(result.schema, meta3);
  if (ctx.io === "input" && isTransforming(schema)) {
    delete result.schema.examples;
    delete result.schema.default;
  }
  if (ctx.io === "input" && result.schema._prefault)
    (_a2 = result.schema).default ?? (_a2.default = result.schema._prefault);
  delete result.schema._prefault;
  const _result = ctx.seen.get(schema);
  return _result.schema;
}
function extractDefs(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const makeURI = (entry) => {
    const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
    if (ctx.external) {
      const externalId = ctx.external.registry.get(entry[0])?.id;
      const uriGenerator = ctx.external.uri ?? ((id2) => id2);
      if (externalId) {
        return { ref: uriGenerator(externalId) };
      }
      const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
      entry[1].defId = id;
      return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}` };
    }
    if (entry[1] === root) {
      return { ref: "#" };
    }
    const uriPrefix = `#`;
    const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
    const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
    return { defId, ref: defUriPrefix + defId };
  };
  const extractToDef = (entry) => {
    if (entry[1].schema.$ref) {
      return;
    }
    const seen = entry[1];
    const { ref, defId } = makeURI(entry);
    seen.def = { ...seen.schema };
    if (defId)
      seen.defId = defId;
    const schema2 = seen.schema;
    for (const key in schema2) {
      delete schema2[key];
    }
    schema2.$ref = ref;
  };
  if (ctx.cycles === "throw") {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.cycle) {
        throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
      }
    }
  }
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (schema === entry[0]) {
      extractToDef(entry);
      continue;
    }
    if (ctx.external) {
      const ext = ctx.external.registry.get(entry[0])?.id;
      if (schema !== entry[0] && ext) {
        extractToDef(entry);
        continue;
      }
    }
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      extractToDef(entry);
      continue;
    }
    if (seen.cycle) {
      extractToDef(entry);
      continue;
    }
    if (seen.count > 1) {
      if (ctx.reused === "ref") {
        extractToDef(entry);
        continue;
      }
    }
  }
}
function finalize(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const flattenRef = (zodSchema) => {
    const seen = ctx.seen.get(zodSchema);
    const schema2 = seen.def ?? seen.schema;
    const _cached = { ...schema2 };
    if (seen.ref === null) {
      return;
    }
    const ref = seen.ref;
    seen.ref = null;
    if (ref) {
      flattenRef(ref);
      const refSchema = ctx.seen.get(ref).schema;
      if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
        schema2.allOf = schema2.allOf ?? [];
        schema2.allOf.push(refSchema);
      } else {
        Object.assign(schema2, refSchema);
        Object.assign(schema2, _cached);
      }
    }
    if (!seen.isParent)
      ctx.override({
        zodSchema,
        jsonSchema: schema2,
        path: seen.path ?? []
      });
  };
  for (const entry of [...ctx.seen.entries()].reverse()) {
    flattenRef(entry[0]);
  }
  const result = {};
  if (ctx.target === "draft-2020-12") {
    result.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else if (ctx.target === "draft-07") {
    result.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (ctx.target === "draft-04") {
    result.$schema = "http://json-schema.org/draft-04/schema#";
  } else if (ctx.target === "openapi-3.0") {
  } else {
  }
  if (ctx.external?.uri) {
    const id = ctx.external.registry.get(schema)?.id;
    if (!id)
      throw new Error("Schema is missing an `id` property");
    result.$id = ctx.external.uri(id);
  }
  Object.assign(result, root.def ?? root.schema);
  const defs = ctx.external?.defs ?? {};
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (seen.def && seen.defId) {
      defs[seen.defId] = seen.def;
    }
  }
  if (ctx.external) {
  } else {
    if (Object.keys(defs).length > 0) {
      if (ctx.target === "draft-2020-12") {
        result.$defs = defs;
      } else {
        result.definitions = defs;
      }
    }
  }
  try {
    const finalized = JSON.parse(JSON.stringify(result));
    Object.defineProperty(finalized, "~standard", {
      value: {
        ...schema["~standard"],
        jsonSchema: {
          input: createStandardJSONSchemaMethod(schema, "input"),
          output: createStandardJSONSchemaMethod(schema, "output")
        }
      },
      enumerable: false,
      writable: false
    });
    return finalized;
  } catch (_err) {
    throw new Error("Error converting schema to JSON.");
  }
}
function isTransforming(_schema, _ctx) {
  const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
  if (ctx.seen.has(_schema))
    return false;
  ctx.seen.add(_schema);
  const def = _schema._zod.def;
  if (def.type === "transform")
    return true;
  if (def.type === "array")
    return isTransforming(def.element, ctx);
  if (def.type === "set")
    return isTransforming(def.valueType, ctx);
  if (def.type === "lazy")
    return isTransforming(def.getter(), ctx);
  if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") {
    return isTransforming(def.innerType, ctx);
  }
  if (def.type === "intersection") {
    return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
  }
  if (def.type === "record" || def.type === "map") {
    return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
  }
  if (def.type === "pipe") {
    return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
  }
  if (def.type === "object") {
    for (const key in def.shape) {
      if (isTransforming(def.shape[key], ctx))
        return true;
    }
    return false;
  }
  if (def.type === "union") {
    for (const option of def.options) {
      if (isTransforming(option, ctx))
        return true;
    }
    return false;
  }
  if (def.type === "tuple") {
    for (const item of def.items) {
      if (isTransforming(item, ctx))
        return true;
    }
    if (def.rest && isTransforming(def.rest, ctx))
      return true;
    return false;
  }
  return false;
}
var createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
  const ctx = initializeContext({ ...params, processors });
  process2(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
var createStandardJSONSchemaMethod = (schema, io) => (params) => {
  const { libraryOptions, target } = params ?? {};
  const ctx = initializeContext({ ...libraryOptions ?? {}, target, io, processors: {} });
  process2(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};

// node_modules/zod/v4/core/json-schema-processors.js
var formatMap = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
};
var stringProcessor = (schema, ctx, _json, _params) => {
  const json6 = _json;
  json6.type = "string";
  const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
  if (typeof minimum === "number")
    json6.minLength = minimum;
  if (typeof maximum === "number")
    json6.maxLength = maximum;
  if (format) {
    json6.format = formatMap[format] ?? format;
    if (json6.format === "")
      delete json6.format;
  }
  if (contentEncoding)
    json6.contentEncoding = contentEncoding;
  if (patterns && patterns.size > 0) {
    const regexes = [...patterns];
    if (regexes.length === 1)
      json6.pattern = regexes[0].source;
    else if (regexes.length > 1) {
      json6.allOf = [
        ...regexes.map((regex) => ({
          ...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
          pattern: regex.source
        }))
      ];
    }
  }
};
var numberProcessor = (schema, ctx, _json, _params) => {
  const json6 = _json;
  const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
  if (typeof format === "string" && format.includes("int"))
    json6.type = "integer";
  else
    json6.type = "number";
  if (typeof exclusiveMinimum === "number") {
    if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
      json6.minimum = exclusiveMinimum;
      json6.exclusiveMinimum = true;
    } else {
      json6.exclusiveMinimum = exclusiveMinimum;
    }
  }
  if (typeof minimum === "number") {
    json6.minimum = minimum;
    if (typeof exclusiveMinimum === "number" && ctx.target !== "draft-04") {
      if (exclusiveMinimum >= minimum)
        delete json6.minimum;
      else
        delete json6.exclusiveMinimum;
    }
  }
  if (typeof exclusiveMaximum === "number") {
    if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
      json6.maximum = exclusiveMaximum;
      json6.exclusiveMaximum = true;
    } else {
      json6.exclusiveMaximum = exclusiveMaximum;
    }
  }
  if (typeof maximum === "number") {
    json6.maximum = maximum;
    if (typeof exclusiveMaximum === "number" && ctx.target !== "draft-04") {
      if (exclusiveMaximum <= maximum)
        delete json6.maximum;
      else
        delete json6.exclusiveMaximum;
    }
  }
  if (typeof multipleOf === "number")
    json6.multipleOf = multipleOf;
};
var booleanProcessor = (_schema, _ctx, json6, _params) => {
  json6.type = "boolean";
};
var bigintProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("BigInt cannot be represented in JSON Schema");
  }
};
var symbolProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Symbols cannot be represented in JSON Schema");
  }
};
var nullProcessor = (_schema, ctx, json6, _params) => {
  if (ctx.target === "openapi-3.0") {
    json6.type = "string";
    json6.nullable = true;
    json6.enum = [null];
  } else {
    json6.type = "null";
  }
};
var undefinedProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Undefined cannot be represented in JSON Schema");
  }
};
var voidProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Void cannot be represented in JSON Schema");
  }
};
var neverProcessor = (_schema, _ctx, json6, _params) => {
  json6.not = {};
};
var anyProcessor = (_schema, _ctx, _json, _params) => {
};
var unknownProcessor = (_schema, _ctx, _json, _params) => {
};
var dateProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Date cannot be represented in JSON Schema");
  }
};
var enumProcessor = (schema, _ctx, json6, _params) => {
  const def = schema._zod.def;
  const values = getEnumValues(def.entries);
  if (values.every((v) => typeof v === "number"))
    json6.type = "number";
  if (values.every((v) => typeof v === "string"))
    json6.type = "string";
  json6.enum = values;
};
var literalProcessor = (schema, ctx, json6, _params) => {
  const def = schema._zod.def;
  const vals = [];
  for (const val of def.values) {
    if (val === void 0) {
      if (ctx.unrepresentable === "throw") {
        throw new Error("Literal `undefined` cannot be represented in JSON Schema");
      } else {
      }
    } else if (typeof val === "bigint") {
      if (ctx.unrepresentable === "throw") {
        throw new Error("BigInt literals cannot be represented in JSON Schema");
      } else {
        vals.push(Number(val));
      }
    } else {
      vals.push(val);
    }
  }
  if (vals.length === 0) {
  } else if (vals.length === 1) {
    const val = vals[0];
    json6.type = val === null ? "null" : typeof val;
    if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
      json6.enum = [val];
    } else {
      json6.const = val;
    }
  } else {
    if (vals.every((v) => typeof v === "number"))
      json6.type = "number";
    if (vals.every((v) => typeof v === "string"))
      json6.type = "string";
    if (vals.every((v) => typeof v === "boolean"))
      json6.type = "boolean";
    if (vals.every((v) => v === null))
      json6.type = "null";
    json6.enum = vals;
  }
};
var nanProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("NaN cannot be represented in JSON Schema");
  }
};
var templateLiteralProcessor = (schema, _ctx, json6, _params) => {
  const _json = json6;
  const pattern = schema._zod.pattern;
  if (!pattern)
    throw new Error("Pattern not found in template literal");
  _json.type = "string";
  _json.pattern = pattern.source;
};
var fileProcessor = (schema, _ctx, json6, _params) => {
  const _json = json6;
  const file2 = {
    type: "string",
    format: "binary",
    contentEncoding: "binary"
  };
  const { minimum, maximum, mime } = schema._zod.bag;
  if (minimum !== void 0)
    file2.minLength = minimum;
  if (maximum !== void 0)
    file2.maxLength = maximum;
  if (mime) {
    if (mime.length === 1) {
      file2.contentMediaType = mime[0];
      Object.assign(_json, file2);
    } else {
      _json.anyOf = mime.map((m) => {
        const mFile = { ...file2, contentMediaType: m };
        return mFile;
      });
    }
  } else {
    Object.assign(_json, file2);
  }
};
var successProcessor = (_schema, _ctx, json6, _params) => {
  json6.type = "boolean";
};
var customProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Custom types cannot be represented in JSON Schema");
  }
};
var functionProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Function types cannot be represented in JSON Schema");
  }
};
var transformProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Transforms cannot be represented in JSON Schema");
  }
};
var mapProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Map cannot be represented in JSON Schema");
  }
};
var setProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Set cannot be represented in JSON Schema");
  }
};
var arrayProcessor = (schema, ctx, _json, params) => {
  const json6 = _json;
  const def = schema._zod.def;
  const { minimum, maximum } = schema._zod.bag;
  if (typeof minimum === "number")
    json6.minItems = minimum;
  if (typeof maximum === "number")
    json6.maxItems = maximum;
  json6.type = "array";
  json6.items = process2(def.element, ctx, { ...params, path: [...params.path, "items"] });
};
var objectProcessor = (schema, ctx, _json, params) => {
  const json6 = _json;
  const def = schema._zod.def;
  json6.type = "object";
  json6.properties = {};
  const shape = def.shape;
  for (const key in shape) {
    json6.properties[key] = process2(shape[key], ctx, {
      ...params,
      path: [...params.path, "properties", key]
    });
  }
  const allKeys = new Set(Object.keys(shape));
  const requiredKeys = new Set([...allKeys].filter((key) => {
    const v = def.shape[key]._zod;
    if (ctx.io === "input") {
      return v.optin === void 0;
    } else {
      return v.optout === void 0;
    }
  }));
  if (requiredKeys.size > 0) {
    json6.required = Array.from(requiredKeys);
  }
  if (def.catchall?._zod.def.type === "never") {
    json6.additionalProperties = false;
  } else if (!def.catchall) {
    if (ctx.io === "output")
      json6.additionalProperties = false;
  } else if (def.catchall) {
    json6.additionalProperties = process2(def.catchall, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
};
var unionProcessor = (schema, ctx, json6, params) => {
  const def = schema._zod.def;
  const isExclusive = def.inclusive === false;
  const options = def.options.map((x, i) => process2(x, ctx, {
    ...params,
    path: [...params.path, isExclusive ? "oneOf" : "anyOf", i]
  }));
  if (isExclusive) {
    json6.oneOf = options;
  } else {
    json6.anyOf = options;
  }
};
var intersectionProcessor = (schema, ctx, json6, params) => {
  const def = schema._zod.def;
  const a = process2(def.left, ctx, {
    ...params,
    path: [...params.path, "allOf", 0]
  });
  const b = process2(def.right, ctx, {
    ...params,
    path: [...params.path, "allOf", 1]
  });
  const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
  const allOf = [
    ...isSimpleIntersection(a) ? a.allOf : [a],
    ...isSimpleIntersection(b) ? b.allOf : [b]
  ];
  json6.allOf = allOf;
};
var tupleProcessor = (schema, ctx, _json, params) => {
  const json6 = _json;
  const def = schema._zod.def;
  json6.type = "array";
  const prefixPath = ctx.target === "draft-2020-12" ? "prefixItems" : "items";
  const restPath = ctx.target === "draft-2020-12" ? "items" : ctx.target === "openapi-3.0" ? "items" : "additionalItems";
  const prefixItems = def.items.map((x, i) => process2(x, ctx, {
    ...params,
    path: [...params.path, prefixPath, i]
  }));
  const rest = def.rest ? process2(def.rest, ctx, {
    ...params,
    path: [...params.path, restPath, ...ctx.target === "openapi-3.0" ? [def.items.length] : []]
  }) : null;
  if (ctx.target === "draft-2020-12") {
    json6.prefixItems = prefixItems;
    if (rest) {
      json6.items = rest;
    }
  } else if (ctx.target === "openapi-3.0") {
    json6.items = {
      anyOf: prefixItems
    };
    if (rest) {
      json6.items.anyOf.push(rest);
    }
    json6.minItems = prefixItems.length;
    if (!rest) {
      json6.maxItems = prefixItems.length;
    }
  } else {
    json6.items = prefixItems;
    if (rest) {
      json6.additionalItems = rest;
    }
  }
  const { minimum, maximum } = schema._zod.bag;
  if (typeof minimum === "number")
    json6.minItems = minimum;
  if (typeof maximum === "number")
    json6.maxItems = maximum;
};
var recordProcessor = (schema, ctx, _json, params) => {
  const json6 = _json;
  const def = schema._zod.def;
  json6.type = "object";
  if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
    json6.propertyNames = process2(def.keyType, ctx, {
      ...params,
      path: [...params.path, "propertyNames"]
    });
  }
  json6.additionalProperties = process2(def.valueType, ctx, {
    ...params,
    path: [...params.path, "additionalProperties"]
  });
};
var nullableProcessor = (schema, ctx, json6, params) => {
  const def = schema._zod.def;
  const inner = process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  if (ctx.target === "openapi-3.0") {
    seen.ref = def.innerType;
    json6.nullable = true;
  } else {
    json6.anyOf = [inner, { type: "null" }];
  }
};
var nonoptionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
var defaultProcessor = (schema, ctx, json6, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json6.default = JSON.parse(JSON.stringify(def.defaultValue));
};
var prefaultProcessor = (schema, ctx, json6, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  if (ctx.io === "input")
    json6._prefault = JSON.parse(JSON.stringify(def.defaultValue));
};
var catchProcessor = (schema, ctx, json6, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  let catchValue;
  try {
    catchValue = def.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  json6.default = catchValue;
};
var pipeProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  const innerType = ctx.io === "input" ? def.in._zod.def.type === "transform" ? def.out : def.in : def.out;
  process2(innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = innerType;
};
var readonlyProcessor = (schema, ctx, json6, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json6.readOnly = true;
};
var promiseProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
var optionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
var lazyProcessor = (schema, ctx, _json, params) => {
  const innerType = schema._zod.innerType;
  process2(innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = innerType;
};
var allProcessors = {
  string: stringProcessor,
  number: numberProcessor,
  boolean: booleanProcessor,
  bigint: bigintProcessor,
  symbol: symbolProcessor,
  null: nullProcessor,
  undefined: undefinedProcessor,
  void: voidProcessor,
  never: neverProcessor,
  any: anyProcessor,
  unknown: unknownProcessor,
  date: dateProcessor,
  enum: enumProcessor,
  literal: literalProcessor,
  nan: nanProcessor,
  template_literal: templateLiteralProcessor,
  file: fileProcessor,
  success: successProcessor,
  custom: customProcessor,
  function: functionProcessor,
  transform: transformProcessor,
  map: mapProcessor,
  set: setProcessor,
  array: arrayProcessor,
  object: objectProcessor,
  union: unionProcessor,
  intersection: intersectionProcessor,
  tuple: tupleProcessor,
  record: recordProcessor,
  nullable: nullableProcessor,
  nonoptional: nonoptionalProcessor,
  default: defaultProcessor,
  prefault: prefaultProcessor,
  catch: catchProcessor,
  pipe: pipeProcessor,
  readonly: readonlyProcessor,
  promise: promiseProcessor,
  optional: optionalProcessor,
  lazy: lazyProcessor
};
function toJSONSchema(input, params) {
  if ("_idmap" in input) {
    const registry2 = input;
    const ctx2 = initializeContext({ ...params, processors: allProcessors });
    const defs = {};
    for (const entry of registry2._idmap.entries()) {
      const [_, schema] = entry;
      process2(schema, ctx2);
    }
    const schemas = {};
    const external = {
      registry: registry2,
      uri: params?.uri,
      defs
    };
    ctx2.external = external;
    for (const entry of registry2._idmap.entries()) {
      const [key, schema] = entry;
      extractDefs(ctx2, schema);
      schemas[key] = finalize(ctx2, schema);
    }
    if (Object.keys(defs).length > 0) {
      const defsSegment = ctx2.target === "draft-2020-12" ? "$defs" : "definitions";
      schemas.__shared = {
        [defsSegment]: defs
      };
    }
    return { schemas };
  }
  const ctx = initializeContext({ ...params, processors: allProcessors });
  process2(input, ctx);
  extractDefs(ctx, input);
  return finalize(ctx, input);
}

// node_modules/zod/v4/core/json-schema-generator.js
var JSONSchemaGenerator = class {
  /** @deprecated Access via ctx instead */
  get metadataRegistry() {
    return this.ctx.metadataRegistry;
  }
  /** @deprecated Access via ctx instead */
  get target() {
    return this.ctx.target;
  }
  /** @deprecated Access via ctx instead */
  get unrepresentable() {
    return this.ctx.unrepresentable;
  }
  /** @deprecated Access via ctx instead */
  get override() {
    return this.ctx.override;
  }
  /** @deprecated Access via ctx instead */
  get io() {
    return this.ctx.io;
  }
  /** @deprecated Access via ctx instead */
  get counter() {
    return this.ctx.counter;
  }
  set counter(value) {
    this.ctx.counter = value;
  }
  /** @deprecated Access via ctx instead */
  get seen() {
    return this.ctx.seen;
  }
  constructor(params) {
    let normalizedTarget = params?.target ?? "draft-2020-12";
    if (normalizedTarget === "draft-4")
      normalizedTarget = "draft-04";
    if (normalizedTarget === "draft-7")
      normalizedTarget = "draft-07";
    this.ctx = initializeContext({
      processors: allProcessors,
      target: normalizedTarget,
      ...params?.metadata && { metadata: params.metadata },
      ...params?.unrepresentable && { unrepresentable: params.unrepresentable },
      ...params?.override && { override: params.override },
      ...params?.io && { io: params.io }
    });
  }
  /**
   * Process a schema to prepare it for JSON Schema generation.
   * This must be called before emit().
   */
  process(schema, _params = { path: [], schemaPath: [] }) {
    return process2(schema, this.ctx, _params);
  }
  /**
   * Emit the final JSON Schema after processing.
   * Must call process() first.
   */
  emit(schema, _params) {
    if (_params) {
      if (_params.cycles)
        this.ctx.cycles = _params.cycles;
      if (_params.reused)
        this.ctx.reused = _params.reused;
      if (_params.external)
        this.ctx.external = _params.external;
    }
    extractDefs(this.ctx, schema);
    const result = finalize(this.ctx, schema);
    const { "~standard": _, ...plainResult } = result;
    return plainResult;
  }
};

// node_modules/zod/v4/core/json-schema.js
var json_schema_exports = {};

// node_modules/zod/v4/classic/schemas.js
var schemas_exports2 = {};
__export(schemas_exports2, {
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBase64: () => ZodBase64,
  ZodBase64URL: () => ZodBase64URL,
  ZodBigInt: () => ZodBigInt,
  ZodBigIntFormat: () => ZodBigIntFormat,
  ZodBoolean: () => ZodBoolean,
  ZodCIDRv4: () => ZodCIDRv4,
  ZodCIDRv6: () => ZodCIDRv6,
  ZodCUID: () => ZodCUID,
  ZodCUID2: () => ZodCUID2,
  ZodCatch: () => ZodCatch,
  ZodCodec: () => ZodCodec,
  ZodCustom: () => ZodCustom,
  ZodCustomStringFormat: () => ZodCustomStringFormat,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodE164: () => ZodE164,
  ZodEmail: () => ZodEmail,
  ZodEmoji: () => ZodEmoji,
  ZodEnum: () => ZodEnum,
  ZodFile: () => ZodFile,
  ZodFunction: () => ZodFunction,
  ZodGUID: () => ZodGUID,
  ZodIPv4: () => ZodIPv4,
  ZodIPv6: () => ZodIPv6,
  ZodIntersection: () => ZodIntersection,
  ZodJWT: () => ZodJWT,
  ZodKSUID: () => ZodKSUID,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMAC: () => ZodMAC,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNanoID: () => ZodNanoID,
  ZodNever: () => ZodNever,
  ZodNonOptional: () => ZodNonOptional,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodNumberFormat: () => ZodNumberFormat,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodPipe: () => ZodPipe,
  ZodPrefault: () => ZodPrefault,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodStringFormat: () => ZodStringFormat,
  ZodSuccess: () => ZodSuccess,
  ZodSymbol: () => ZodSymbol,
  ZodTemplateLiteral: () => ZodTemplateLiteral,
  ZodTransform: () => ZodTransform,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodULID: () => ZodULID,
  ZodURL: () => ZodURL,
  ZodUUID: () => ZodUUID,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  ZodXID: () => ZodXID,
  ZodXor: () => ZodXor,
  _ZodString: () => _ZodString,
  _default: () => _default2,
  _function: () => _function,
  any: () => any,
  array: () => array,
  base64: () => base642,
  base64url: () => base64url2,
  bigint: () => bigint2,
  boolean: () => boolean10,
  catch: () => _catch2,
  check: () => check,
  cidrv4: () => cidrv42,
  cidrv6: () => cidrv62,
  codec: () => codec,
  cuid: () => cuid3,
  cuid2: () => cuid22,
  custom: () => custom,
  date: () => date3,
  describe: () => describe2,
  discriminatedUnion: () => discriminatedUnion,
  e164: () => e1642,
  email: () => email2,
  emoji: () => emoji2,
  enum: () => _enum2,
  file: () => file,
  float32: () => float32,
  float64: () => float64,
  function: () => _function,
  guid: () => guid2,
  hash: () => hash,
  hex: () => hex2,
  hostname: () => hostname2,
  httpUrl: () => httpUrl,
  instanceof: () => _instanceof,
  int: () => int12,
  int32: () => int32,
  int64: () => int64,
  intersection: () => intersection,
  ipv4: () => ipv42,
  ipv6: () => ipv62,
  json: () => json5,
  jwt: () => jwt,
  keyof: () => keyof,
  ksuid: () => ksuid2,
  lazy: () => lazy,
  literal: () => literal,
  looseObject: () => looseObject,
  looseRecord: () => looseRecord,
  mac: () => mac2,
  map: () => map,
  meta: () => meta2,
  nan: () => nan,
  nanoid: () => nanoid2,
  nativeEnum: () => nativeEnum,
  never: () => never,
  nonoptional: () => nonoptional,
  null: () => _null3,
  nullable: () => nullable,
  nullish: () => nullish2,
  number: () => number2,
  object: () => object,
  optional: () => optional,
  partialRecord: () => partialRecord,
  pipe: () => pipe,
  prefault: () => prefault,
  preprocess: () => preprocess,
  promise: () => promise,
  readonly: () => readonly,
  record: () => record,
  refine: () => refine,
  set: () => set,
  strictObject: () => strictObject,
  string: () => string2,
  stringFormat: () => stringFormat,
  stringbool: () => stringbool,
  success: () => success,
  superRefine: () => superRefine,
  symbol: () => symbol,
  templateLiteral: () => templateLiteral,
  transform: () => transform,
  tuple: () => tuple,
  uint32: () => uint32,
  uint64: () => uint64,
  ulid: () => ulid2,
  undefined: () => _undefined3,
  union: () => union,
  unknown: () => unknown,
  url: () => url,
  uuid: () => uuid2,
  uuidv4: () => uuidv4,
  uuidv6: () => uuidv6,
  uuidv7: () => uuidv7,
  void: () => _void2,
  xid: () => xid2,
  xor: () => xor
});

// node_modules/zod/v4/classic/checks.js
var checks_exports2 = {};
__export(checks_exports2, {
  endsWith: () => _endsWith,
  gt: () => _gt,
  gte: () => _gte,
  includes: () => _includes,
  length: () => _length,
  lowercase: () => _lowercase,
  lt: () => _lt,
  lte: () => _lte,
  maxLength: () => _maxLength,
  maxSize: () => _maxSize,
  mime: () => _mime,
  minLength: () => _minLength,
  minSize: () => _minSize,
  multipleOf: () => _multipleOf,
  negative: () => _negative,
  nonnegative: () => _nonnegative,
  nonpositive: () => _nonpositive,
  normalize: () => _normalize,
  overwrite: () => _overwrite,
  positive: () => _positive,
  property: () => _property,
  regex: () => _regex,
  size: () => _size,
  slugify: () => _slugify,
  startsWith: () => _startsWith,
  toLowerCase: () => _toLowerCase,
  toUpperCase: () => _toUpperCase,
  trim: () => _trim,
  uppercase: () => _uppercase
});

// node_modules/zod/v4/classic/iso.js
var iso_exports = {};
__export(iso_exports, {
  ZodISODate: () => ZodISODate,
  ZodISODateTime: () => ZodISODateTime,
  ZodISODuration: () => ZodISODuration,
  ZodISOTime: () => ZodISOTime,
  date: () => date2,
  datetime: () => datetime2,
  duration: () => duration2,
  time: () => time2
});
var ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
  $ZodISODateTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function datetime2(params) {
  return _isoDateTime(ZodISODateTime, params);
}
var ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
  $ZodISODate.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function date2(params) {
  return _isoDate(ZodISODate, params);
}
var ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
  $ZodISOTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function time2(params) {
  return _isoTime(ZodISOTime, params);
}
var ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
  $ZodISODuration.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function duration2(params) {
  return _isoDuration(ZodISODuration, params);
}

// node_modules/zod/v4/classic/errors.js
var initializer2 = (inst, issues) => {
  $ZodError.init(inst, issues);
  inst.name = "ZodError";
  Object.defineProperties(inst, {
    format: {
      value: (mapper) => formatError(inst, mapper)
      // enumerable: false,
    },
    flatten: {
      value: (mapper) => flattenError(inst, mapper)
      // enumerable: false,
    },
    addIssue: {
      value: (issue2) => {
        inst.issues.push(issue2);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (issues2) => {
        inst.issues.push(...issues2);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return inst.issues.length === 0;
      }
      // enumerable: false,
    }
  });
};
var ZodError = $constructor("ZodError", initializer2);
var ZodRealError = $constructor("ZodError", initializer2, {
  Parent: Error
});

// node_modules/zod/v4/classic/parse.js
var parse2 = /* @__PURE__ */ _parse(ZodRealError);
var parseAsync2 = /* @__PURE__ */ _parseAsync(ZodRealError);
var safeParse2 = /* @__PURE__ */ _safeParse(ZodRealError);
var safeParseAsync2 = /* @__PURE__ */ _safeParseAsync(ZodRealError);
var encode2 = /* @__PURE__ */ _encode(ZodRealError);
var decode2 = /* @__PURE__ */ _decode(ZodRealError);
var encodeAsync2 = /* @__PURE__ */ _encodeAsync(ZodRealError);
var decodeAsync2 = /* @__PURE__ */ _decodeAsync(ZodRealError);
var safeEncode2 = /* @__PURE__ */ _safeEncode(ZodRealError);
var safeDecode2 = /* @__PURE__ */ _safeDecode(ZodRealError);
var safeEncodeAsync2 = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
var safeDecodeAsync2 = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);

// node_modules/zod/v4/classic/schemas.js
var ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
  $ZodType.init(inst, def);
  Object.assign(inst["~standard"], {
    jsonSchema: {
      input: createStandardJSONSchemaMethod(inst, "input"),
      output: createStandardJSONSchemaMethod(inst, "output")
    }
  });
  inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
  inst.def = def;
  inst.type = def.type;
  Object.defineProperty(inst, "_def", { value: def });
  inst.check = (...checks) => {
    return inst.clone(util_exports.mergeDefs(def, {
      checks: [
        ...def.checks ?? [],
        ...checks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch)
      ]
    }));
  };
  inst.clone = (def2, params) => clone(inst, def2, params);
  inst.brand = () => inst;
  inst.register = ((reg, meta3) => {
    reg.add(inst, meta3);
    return inst;
  });
  inst.parse = (data, params) => parse2(inst, data, params, { callee: inst.parse });
  inst.safeParse = (data, params) => safeParse2(inst, data, params);
  inst.parseAsync = async (data, params) => parseAsync2(inst, data, params, { callee: inst.parseAsync });
  inst.safeParseAsync = async (data, params) => safeParseAsync2(inst, data, params);
  inst.spa = inst.safeParseAsync;
  inst.encode = (data, params) => encode2(inst, data, params);
  inst.decode = (data, params) => decode2(inst, data, params);
  inst.encodeAsync = async (data, params) => encodeAsync2(inst, data, params);
  inst.decodeAsync = async (data, params) => decodeAsync2(inst, data, params);
  inst.safeEncode = (data, params) => safeEncode2(inst, data, params);
  inst.safeDecode = (data, params) => safeDecode2(inst, data, params);
  inst.safeEncodeAsync = async (data, params) => safeEncodeAsync2(inst, data, params);
  inst.safeDecodeAsync = async (data, params) => safeDecodeAsync2(inst, data, params);
  inst.refine = (check2, params) => inst.check(refine(check2, params));
  inst.superRefine = (refinement) => inst.check(superRefine(refinement));
  inst.overwrite = (fn) => inst.check(_overwrite(fn));
  inst.optional = () => optional(inst);
  inst.nullable = () => nullable(inst);
  inst.nullish = () => optional(nullable(inst));
  inst.nonoptional = (params) => nonoptional(inst, params);
  inst.array = () => array(inst);
  inst.or = (arg) => union([inst, arg]);
  inst.and = (arg) => intersection(inst, arg);
  inst.transform = (tx) => pipe(inst, transform(tx));
  inst.default = (def2) => _default2(inst, def2);
  inst.prefault = (def2) => prefault(inst, def2);
  inst.catch = (params) => _catch2(inst, params);
  inst.pipe = (target) => pipe(inst, target);
  inst.readonly = () => readonly(inst);
  inst.describe = (description) => {
    const cl = inst.clone();
    globalRegistry.add(cl, { description });
    return cl;
  };
  Object.defineProperty(inst, "description", {
    get() {
      return globalRegistry.get(inst)?.description;
    },
    configurable: true
  });
  inst.meta = (...args) => {
    if (args.length === 0) {
      return globalRegistry.get(inst);
    }
    const cl = inst.clone();
    globalRegistry.add(cl, args[0]);
    return cl;
  };
  inst.isOptional = () => inst.safeParse(void 0).success;
  inst.isNullable = () => inst.safeParse(null).success;
  return inst;
});
var _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => stringProcessor(inst, ctx, json6, params);
  const bag = inst._zod.bag;
  inst.format = bag.format ?? null;
  inst.minLength = bag.minimum ?? null;
  inst.maxLength = bag.maximum ?? null;
  inst.regex = (...args) => inst.check(_regex(...args));
  inst.includes = (...args) => inst.check(_includes(...args));
  inst.startsWith = (...args) => inst.check(_startsWith(...args));
  inst.endsWith = (...args) => inst.check(_endsWith(...args));
  inst.min = (...args) => inst.check(_minLength(...args));
  inst.max = (...args) => inst.check(_maxLength(...args));
  inst.length = (...args) => inst.check(_length(...args));
  inst.nonempty = (...args) => inst.check(_minLength(1, ...args));
  inst.lowercase = (params) => inst.check(_lowercase(params));
  inst.uppercase = (params) => inst.check(_uppercase(params));
  inst.trim = () => inst.check(_trim());
  inst.normalize = (...args) => inst.check(_normalize(...args));
  inst.toLowerCase = () => inst.check(_toLowerCase());
  inst.toUpperCase = () => inst.check(_toUpperCase());
  inst.slugify = () => inst.check(_slugify());
});
var ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  _ZodString.init(inst, def);
  inst.email = (params) => inst.check(_email(ZodEmail, params));
  inst.url = (params) => inst.check(_url(ZodURL, params));
  inst.jwt = (params) => inst.check(_jwt(ZodJWT, params));
  inst.emoji = (params) => inst.check(_emoji2(ZodEmoji, params));
  inst.guid = (params) => inst.check(_guid(ZodGUID, params));
  inst.uuid = (params) => inst.check(_uuid(ZodUUID, params));
  inst.uuidv4 = (params) => inst.check(_uuidv4(ZodUUID, params));
  inst.uuidv6 = (params) => inst.check(_uuidv6(ZodUUID, params));
  inst.uuidv7 = (params) => inst.check(_uuidv7(ZodUUID, params));
  inst.nanoid = (params) => inst.check(_nanoid(ZodNanoID, params));
  inst.guid = (params) => inst.check(_guid(ZodGUID, params));
  inst.cuid = (params) => inst.check(_cuid(ZodCUID, params));
  inst.cuid2 = (params) => inst.check(_cuid2(ZodCUID2, params));
  inst.ulid = (params) => inst.check(_ulid(ZodULID, params));
  inst.base64 = (params) => inst.check(_base64(ZodBase64, params));
  inst.base64url = (params) => inst.check(_base64url(ZodBase64URL, params));
  inst.xid = (params) => inst.check(_xid(ZodXID, params));
  inst.ksuid = (params) => inst.check(_ksuid(ZodKSUID, params));
  inst.ipv4 = (params) => inst.check(_ipv4(ZodIPv4, params));
  inst.ipv6 = (params) => inst.check(_ipv6(ZodIPv6, params));
  inst.cidrv4 = (params) => inst.check(_cidrv4(ZodCIDRv4, params));
  inst.cidrv6 = (params) => inst.check(_cidrv6(ZodCIDRv6, params));
  inst.e164 = (params) => inst.check(_e164(ZodE164, params));
  inst.datetime = (params) => inst.check(datetime2(params));
  inst.date = (params) => inst.check(date2(params));
  inst.time = (params) => inst.check(time2(params));
  inst.duration = (params) => inst.check(duration2(params));
});
function string2(params) {
  return _string(ZodString, params);
}
var ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  _ZodString.init(inst, def);
});
var ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
  $ZodEmail.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function email2(params) {
  return _email(ZodEmail, params);
}
var ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
  $ZodGUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function guid2(params) {
  return _guid(ZodGUID, params);
}
var ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
  $ZodUUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function uuid2(params) {
  return _uuid(ZodUUID, params);
}
function uuidv4(params) {
  return _uuidv4(ZodUUID, params);
}
function uuidv6(params) {
  return _uuidv6(ZodUUID, params);
}
function uuidv7(params) {
  return _uuidv7(ZodUUID, params);
}
var ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
  $ZodURL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function url(params) {
  return _url(ZodURL, params);
}
function httpUrl(params) {
  return _url(ZodURL, {
    protocol: /^https?$/,
    hostname: regexes_exports.domain,
    ...util_exports.normalizeParams(params)
  });
}
var ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
  $ZodEmoji.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function emoji2(params) {
  return _emoji2(ZodEmoji, params);
}
var ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
  $ZodNanoID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function nanoid2(params) {
  return _nanoid(ZodNanoID, params);
}
var ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
  $ZodCUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function cuid3(params) {
  return _cuid(ZodCUID, params);
}
var ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
  $ZodCUID2.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function cuid22(params) {
  return _cuid2(ZodCUID2, params);
}
var ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
  $ZodULID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function ulid2(params) {
  return _ulid(ZodULID, params);
}
var ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
  $ZodXID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function xid2(params) {
  return _xid(ZodXID, params);
}
var ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
  $ZodKSUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function ksuid2(params) {
  return _ksuid(ZodKSUID, params);
}
var ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
  $ZodIPv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function ipv42(params) {
  return _ipv4(ZodIPv4, params);
}
var ZodMAC = /* @__PURE__ */ $constructor("ZodMAC", (inst, def) => {
  $ZodMAC.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function mac2(params) {
  return _mac(ZodMAC, params);
}
var ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
  $ZodIPv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function ipv62(params) {
  return _ipv6(ZodIPv6, params);
}
var ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
  $ZodCIDRv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function cidrv42(params) {
  return _cidrv4(ZodCIDRv4, params);
}
var ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
  $ZodCIDRv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function cidrv62(params) {
  return _cidrv6(ZodCIDRv6, params);
}
var ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
  $ZodBase64.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function base642(params) {
  return _base64(ZodBase64, params);
}
var ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
  $ZodBase64URL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function base64url2(params) {
  return _base64url(ZodBase64URL, params);
}
var ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
  $ZodE164.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function e1642(params) {
  return _e164(ZodE164, params);
}
var ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
  $ZodJWT.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function jwt(params) {
  return _jwt(ZodJWT, params);
}
var ZodCustomStringFormat = /* @__PURE__ */ $constructor("ZodCustomStringFormat", (inst, def) => {
  $ZodCustomStringFormat.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function stringFormat(format, fnOrRegex, _params = {}) {
  return _stringFormat(ZodCustomStringFormat, format, fnOrRegex, _params);
}
function hostname2(_params) {
  return _stringFormat(ZodCustomStringFormat, "hostname", regexes_exports.hostname, _params);
}
function hex2(_params) {
  return _stringFormat(ZodCustomStringFormat, "hex", regexes_exports.hex, _params);
}
function hash(alg, params) {
  const enc = params?.enc ?? "hex";
  const format = `${alg}_${enc}`;
  const regex = regexes_exports[format];
  if (!regex)
    throw new Error(`Unrecognized hash format: ${format}`);
  return _stringFormat(ZodCustomStringFormat, format, regex, params);
}
var ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
  $ZodNumber.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => numberProcessor(inst, ctx, json6, params);
  inst.gt = (value, params) => inst.check(_gt(value, params));
  inst.gte = (value, params) => inst.check(_gte(value, params));
  inst.min = (value, params) => inst.check(_gte(value, params));
  inst.lt = (value, params) => inst.check(_lt(value, params));
  inst.lte = (value, params) => inst.check(_lte(value, params));
  inst.max = (value, params) => inst.check(_lte(value, params));
  inst.int = (params) => inst.check(int12(params));
  inst.safe = (params) => inst.check(int12(params));
  inst.positive = (params) => inst.check(_gt(0, params));
  inst.nonnegative = (params) => inst.check(_gte(0, params));
  inst.negative = (params) => inst.check(_lt(0, params));
  inst.nonpositive = (params) => inst.check(_lte(0, params));
  inst.multipleOf = (value, params) => inst.check(_multipleOf(value, params));
  inst.step = (value, params) => inst.check(_multipleOf(value, params));
  inst.finite = () => inst;
  const bag = inst._zod.bag;
  inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
  inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
  inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? 0.5);
  inst.isFinite = true;
  inst.format = bag.format ?? null;
});
function number2(params) {
  return _number(ZodNumber, params);
}
var ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
  $ZodNumberFormat.init(inst, def);
  ZodNumber.init(inst, def);
});
function int12(params) {
  return _int(ZodNumberFormat, params);
}
function float32(params) {
  return _float32(ZodNumberFormat, params);
}
function float64(params) {
  return _float64(ZodNumberFormat, params);
}
function int32(params) {
  return _int32(ZodNumberFormat, params);
}
function uint32(params) {
  return _uint32(ZodNumberFormat, params);
}
var ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (inst, def) => {
  $ZodBoolean.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => booleanProcessor(inst, ctx, json6, params);
});
function boolean10(params) {
  return _boolean(ZodBoolean, params);
}
var ZodBigInt = /* @__PURE__ */ $constructor("ZodBigInt", (inst, def) => {
  $ZodBigInt.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => bigintProcessor(inst, ctx, json6, params);
  inst.gte = (value, params) => inst.check(_gte(value, params));
  inst.min = (value, params) => inst.check(_gte(value, params));
  inst.gt = (value, params) => inst.check(_gt(value, params));
  inst.gte = (value, params) => inst.check(_gte(value, params));
  inst.min = (value, params) => inst.check(_gte(value, params));
  inst.lt = (value, params) => inst.check(_lt(value, params));
  inst.lte = (value, params) => inst.check(_lte(value, params));
  inst.max = (value, params) => inst.check(_lte(value, params));
  inst.positive = (params) => inst.check(_gt(BigInt(0), params));
  inst.negative = (params) => inst.check(_lt(BigInt(0), params));
  inst.nonpositive = (params) => inst.check(_lte(BigInt(0), params));
  inst.nonnegative = (params) => inst.check(_gte(BigInt(0), params));
  inst.multipleOf = (value, params) => inst.check(_multipleOf(value, params));
  const bag = inst._zod.bag;
  inst.minValue = bag.minimum ?? null;
  inst.maxValue = bag.maximum ?? null;
  inst.format = bag.format ?? null;
});
function bigint2(params) {
  return _bigint(ZodBigInt, params);
}
var ZodBigIntFormat = /* @__PURE__ */ $constructor("ZodBigIntFormat", (inst, def) => {
  $ZodBigIntFormat.init(inst, def);
  ZodBigInt.init(inst, def);
});
function int64(params) {
  return _int64(ZodBigIntFormat, params);
}
function uint64(params) {
  return _uint64(ZodBigIntFormat, params);
}
var ZodSymbol = /* @__PURE__ */ $constructor("ZodSymbol", (inst, def) => {
  $ZodSymbol.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => symbolProcessor(inst, ctx, json6, params);
});
function symbol(params) {
  return _symbol(ZodSymbol, params);
}
var ZodUndefined = /* @__PURE__ */ $constructor("ZodUndefined", (inst, def) => {
  $ZodUndefined.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => undefinedProcessor(inst, ctx, json6, params);
});
function _undefined3(params) {
  return _undefined2(ZodUndefined, params);
}
var ZodNull = /* @__PURE__ */ $constructor("ZodNull", (inst, def) => {
  $ZodNull.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => nullProcessor(inst, ctx, json6, params);
});
function _null3(params) {
  return _null2(ZodNull, params);
}
var ZodAny = /* @__PURE__ */ $constructor("ZodAny", (inst, def) => {
  $ZodAny.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => anyProcessor(inst, ctx, json6, params);
});
function any() {
  return _any(ZodAny);
}
var ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
  $ZodUnknown.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => unknownProcessor(inst, ctx, json6, params);
});
function unknown() {
  return _unknown(ZodUnknown);
}
var ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
  $ZodNever.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => neverProcessor(inst, ctx, json6, params);
});
function never(params) {
  return _never(ZodNever, params);
}
var ZodVoid = /* @__PURE__ */ $constructor("ZodVoid", (inst, def) => {
  $ZodVoid.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => voidProcessor(inst, ctx, json6, params);
});
function _void2(params) {
  return _void(ZodVoid, params);
}
var ZodDate = /* @__PURE__ */ $constructor("ZodDate", (inst, def) => {
  $ZodDate.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => dateProcessor(inst, ctx, json6, params);
  inst.min = (value, params) => inst.check(_gte(value, params));
  inst.max = (value, params) => inst.check(_lte(value, params));
  const c = inst._zod.bag;
  inst.minDate = c.minimum ? new Date(c.minimum) : null;
  inst.maxDate = c.maximum ? new Date(c.maximum) : null;
});
function date3(params) {
  return _date(ZodDate, params);
}
var ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
  $ZodArray.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => arrayProcessor(inst, ctx, json6, params);
  inst.element = def.element;
  inst.min = (minLength, params) => inst.check(_minLength(minLength, params));
  inst.nonempty = (params) => inst.check(_minLength(1, params));
  inst.max = (maxLength, params) => inst.check(_maxLength(maxLength, params));
  inst.length = (len, params) => inst.check(_length(len, params));
  inst.unwrap = () => inst.element;
});
function array(element, params) {
  return _array(ZodArray, element, params);
}
function keyof(schema) {
  const shape = schema._zod.def.shape;
  return _enum2(Object.keys(shape));
}
var ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
  $ZodObjectJIT.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => objectProcessor(inst, ctx, json6, params);
  util_exports.defineLazy(inst, "shape", () => {
    return def.shape;
  });
  inst.keyof = () => _enum2(Object.keys(inst._zod.def.shape));
  inst.catchall = (catchall) => inst.clone({ ...inst._zod.def, catchall });
  inst.passthrough = () => inst.clone({ ...inst._zod.def, catchall: unknown() });
  inst.loose = () => inst.clone({ ...inst._zod.def, catchall: unknown() });
  inst.strict = () => inst.clone({ ...inst._zod.def, catchall: never() });
  inst.strip = () => inst.clone({ ...inst._zod.def, catchall: void 0 });
  inst.extend = (incoming) => {
    return util_exports.extend(inst, incoming);
  };
  inst.safeExtend = (incoming) => {
    return util_exports.safeExtend(inst, incoming);
  };
  inst.merge = (other) => util_exports.merge(inst, other);
  inst.pick = (mask) => util_exports.pick(inst, mask);
  inst.omit = (mask) => util_exports.omit(inst, mask);
  inst.partial = (...args) => util_exports.partial(ZodOptional, inst, args[0]);
  inst.required = (...args) => util_exports.required(ZodNonOptional, inst, args[0]);
});
function object(shape, params) {
  const def = {
    type: "object",
    shape: shape ?? {},
    ...util_exports.normalizeParams(params)
  };
  return new ZodObject(def);
}
function strictObject(shape, params) {
  return new ZodObject({
    type: "object",
    shape,
    catchall: never(),
    ...util_exports.normalizeParams(params)
  });
}
function looseObject(shape, params) {
  return new ZodObject({
    type: "object",
    shape,
    catchall: unknown(),
    ...util_exports.normalizeParams(params)
  });
}
var ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
  $ZodUnion.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => unionProcessor(inst, ctx, json6, params);
  inst.options = def.options;
});
function union(options, params) {
  return new ZodUnion({
    type: "union",
    options,
    ...util_exports.normalizeParams(params)
  });
}
var ZodXor = /* @__PURE__ */ $constructor("ZodXor", (inst, def) => {
  ZodUnion.init(inst, def);
  $ZodXor.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => unionProcessor(inst, ctx, json6, params);
  inst.options = def.options;
});
function xor(options, params) {
  return new ZodXor({
    type: "union",
    options,
    inclusive: false,
    ...util_exports.normalizeParams(params)
  });
}
var ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("ZodDiscriminatedUnion", (inst, def) => {
  ZodUnion.init(inst, def);
  $ZodDiscriminatedUnion.init(inst, def);
});
function discriminatedUnion(discriminator, options, params) {
  return new ZodDiscriminatedUnion({
    type: "union",
    options,
    discriminator,
    ...util_exports.normalizeParams(params)
  });
}
var ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
  $ZodIntersection.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => intersectionProcessor(inst, ctx, json6, params);
});
function intersection(left, right) {
  return new ZodIntersection({
    type: "intersection",
    left,
    right
  });
}
var ZodTuple = /* @__PURE__ */ $constructor("ZodTuple", (inst, def) => {
  $ZodTuple.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => tupleProcessor(inst, ctx, json6, params);
  inst.rest = (rest) => inst.clone({
    ...inst._zod.def,
    rest
  });
});
function tuple(items, _paramsOrRest, _params) {
  const hasRest = _paramsOrRest instanceof $ZodType;
  const params = hasRest ? _params : _paramsOrRest;
  const rest = hasRest ? _paramsOrRest : null;
  return new ZodTuple({
    type: "tuple",
    items,
    rest,
    ...util_exports.normalizeParams(params)
  });
}
var ZodRecord = /* @__PURE__ */ $constructor("ZodRecord", (inst, def) => {
  $ZodRecord.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => recordProcessor(inst, ctx, json6, params);
  inst.keyType = def.keyType;
  inst.valueType = def.valueType;
});
function record(keyType, valueType, params) {
  return new ZodRecord({
    type: "record",
    keyType,
    valueType,
    ...util_exports.normalizeParams(params)
  });
}
function partialRecord(keyType, valueType, params) {
  const k = clone(keyType);
  k._zod.values = void 0;
  return new ZodRecord({
    type: "record",
    keyType: k,
    valueType,
    ...util_exports.normalizeParams(params)
  });
}
function looseRecord(keyType, valueType, params) {
  return new ZodRecord({
    type: "record",
    keyType,
    valueType,
    mode: "loose",
    ...util_exports.normalizeParams(params)
  });
}
var ZodMap = /* @__PURE__ */ $constructor("ZodMap", (inst, def) => {
  $ZodMap.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => mapProcessor(inst, ctx, json6, params);
  inst.keyType = def.keyType;
  inst.valueType = def.valueType;
});
function map(keyType, valueType, params) {
  return new ZodMap({
    type: "map",
    keyType,
    valueType,
    ...util_exports.normalizeParams(params)
  });
}
var ZodSet = /* @__PURE__ */ $constructor("ZodSet", (inst, def) => {
  $ZodSet.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => setProcessor(inst, ctx, json6, params);
  inst.min = (...args) => inst.check(_minSize(...args));
  inst.nonempty = (params) => inst.check(_minSize(1, params));
  inst.max = (...args) => inst.check(_maxSize(...args));
  inst.size = (...args) => inst.check(_size(...args));
});
function set(valueType, params) {
  return new ZodSet({
    type: "set",
    valueType,
    ...util_exports.normalizeParams(params)
  });
}
var ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
  $ZodEnum.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => enumProcessor(inst, ctx, json6, params);
  inst.enum = def.entries;
  inst.options = Object.values(def.entries);
  const keys = new Set(Object.keys(def.entries));
  inst.extract = (values, params) => {
    const newEntries = {};
    for (const value of values) {
      if (keys.has(value)) {
        newEntries[value] = def.entries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...util_exports.normalizeParams(params),
      entries: newEntries
    });
  };
  inst.exclude = (values, params) => {
    const newEntries = { ...def.entries };
    for (const value of values) {
      if (keys.has(value)) {
        delete newEntries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...util_exports.normalizeParams(params),
      entries: newEntries
    });
  };
});
function _enum2(values, params) {
  const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
  return new ZodEnum({
    type: "enum",
    entries,
    ...util_exports.normalizeParams(params)
  });
}
function nativeEnum(entries, params) {
  return new ZodEnum({
    type: "enum",
    entries,
    ...util_exports.normalizeParams(params)
  });
}
var ZodLiteral = /* @__PURE__ */ $constructor("ZodLiteral", (inst, def) => {
  $ZodLiteral.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => literalProcessor(inst, ctx, json6, params);
  inst.values = new Set(def.values);
  Object.defineProperty(inst, "value", {
    get() {
      if (def.values.length > 1) {
        throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
      }
      return def.values[0];
    }
  });
});
function literal(value, params) {
  return new ZodLiteral({
    type: "literal",
    values: Array.isArray(value) ? value : [value],
    ...util_exports.normalizeParams(params)
  });
}
var ZodFile = /* @__PURE__ */ $constructor("ZodFile", (inst, def) => {
  $ZodFile.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => fileProcessor(inst, ctx, json6, params);
  inst.min = (size, params) => inst.check(_minSize(size, params));
  inst.max = (size, params) => inst.check(_maxSize(size, params));
  inst.mime = (types, params) => inst.check(_mime(Array.isArray(types) ? types : [types], params));
});
function file(params) {
  return _file(ZodFile, params);
}
var ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
  $ZodTransform.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => transformProcessor(inst, ctx, json6, params);
  inst._zod.parse = (payload, _ctx) => {
    if (_ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(util_exports.issue(issue2, payload.value, def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = inst);
        payload.issues.push(util_exports.issue(_issue));
      }
    };
    const output = def.transform(payload.value, payload);
    if (output instanceof Promise) {
      return output.then((output2) => {
        payload.value = output2;
        return payload;
      });
    }
    payload.value = output;
    return payload;
  };
});
function transform(fn) {
  return new ZodTransform({
    type: "transform",
    transform: fn
  });
}
var ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => optionalProcessor(inst, ctx, json6, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
  return new ZodOptional({
    type: "optional",
    innerType
  });
}
var ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
  $ZodNullable.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => nullableProcessor(inst, ctx, json6, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
  return new ZodNullable({
    type: "nullable",
    innerType
  });
}
function nullish2(innerType) {
  return optional(nullable(innerType));
}
var ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
  $ZodDefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => defaultProcessor(inst, ctx, json6, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeDefault = inst.unwrap;
});
function _default2(innerType, defaultValue) {
  return new ZodDefault({
    type: "default",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
    }
  });
}
var ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
  $ZodPrefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => prefaultProcessor(inst, ctx, json6, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
  return new ZodPrefault({
    type: "prefault",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : util_exports.shallowClone(defaultValue);
    }
  });
}
var ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
  $ZodNonOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => nonoptionalProcessor(inst, ctx, json6, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType,
    ...util_exports.normalizeParams(params)
  });
}
var ZodSuccess = /* @__PURE__ */ $constructor("ZodSuccess", (inst, def) => {
  $ZodSuccess.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => successProcessor(inst, ctx, json6, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function success(innerType) {
  return new ZodSuccess({
    type: "success",
    innerType
  });
}
var ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
  $ZodCatch.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => catchProcessor(inst, ctx, json6, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeCatch = inst.unwrap;
});
function _catch2(innerType, catchValue) {
  return new ZodCatch({
    type: "catch",
    innerType,
    catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
  });
}
var ZodNaN = /* @__PURE__ */ $constructor("ZodNaN", (inst, def) => {
  $ZodNaN.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => nanProcessor(inst, ctx, json6, params);
});
function nan(params) {
  return _nan(ZodNaN, params);
}
var ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
  $ZodPipe.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => pipeProcessor(inst, ctx, json6, params);
  inst.in = def.in;
  inst.out = def.out;
});
function pipe(in_, out) {
  return new ZodPipe({
    type: "pipe",
    in: in_,
    out
    // ...util.normalizeParams(params),
  });
}
var ZodCodec = /* @__PURE__ */ $constructor("ZodCodec", (inst, def) => {
  ZodPipe.init(inst, def);
  $ZodCodec.init(inst, def);
});
function codec(in_, out, params) {
  return new ZodCodec({
    type: "pipe",
    in: in_,
    out,
    transform: params.decode,
    reverseTransform: params.encode
  });
}
var ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
  $ZodReadonly.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => readonlyProcessor(inst, ctx, json6, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
  return new ZodReadonly({
    type: "readonly",
    innerType
  });
}
var ZodTemplateLiteral = /* @__PURE__ */ $constructor("ZodTemplateLiteral", (inst, def) => {
  $ZodTemplateLiteral.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => templateLiteralProcessor(inst, ctx, json6, params);
});
function templateLiteral(parts, params) {
  return new ZodTemplateLiteral({
    type: "template_literal",
    parts,
    ...util_exports.normalizeParams(params)
  });
}
var ZodLazy = /* @__PURE__ */ $constructor("ZodLazy", (inst, def) => {
  $ZodLazy.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => lazyProcessor(inst, ctx, json6, params);
  inst.unwrap = () => inst._zod.def.getter();
});
function lazy(getter) {
  return new ZodLazy({
    type: "lazy",
    getter
  });
}
var ZodPromise = /* @__PURE__ */ $constructor("ZodPromise", (inst, def) => {
  $ZodPromise.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => promiseProcessor(inst, ctx, json6, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function promise(innerType) {
  return new ZodPromise({
    type: "promise",
    innerType
  });
}
var ZodFunction = /* @__PURE__ */ $constructor("ZodFunction", (inst, def) => {
  $ZodFunction.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => functionProcessor(inst, ctx, json6, params);
});
function _function(params) {
  return new ZodFunction({
    type: "function",
    input: Array.isArray(params?.input) ? tuple(params?.input) : params?.input ?? array(unknown()),
    output: params?.output ?? unknown()
  });
}
var ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
  $ZodCustom.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json6, params) => customProcessor(inst, ctx, json6, params);
});
function check(fn) {
  const ch = new $ZodCheck({
    check: "custom"
    // ...util.normalizeParams(params),
  });
  ch._zod.check = fn;
  return ch;
}
function custom(fn, _params) {
  return _custom(ZodCustom, fn ?? (() => true), _params);
}
function refine(fn, _params = {}) {
  return _refine(ZodCustom, fn, _params);
}
function superRefine(fn) {
  return _superRefine(fn);
}
var describe2 = describe;
var meta2 = meta;
function _instanceof(cls, params = {
  error: `Input not instance of ${cls.name}`
}) {
  const inst = new ZodCustom({
    type: "custom",
    check: "custom",
    fn: (data) => data instanceof cls,
    abort: true,
    ...util_exports.normalizeParams(params)
  });
  inst._zod.bag.Class = cls;
  return inst;
}
var stringbool = (...args) => _stringbool({
  Codec: ZodCodec,
  Boolean: ZodBoolean,
  String: ZodString
}, ...args);
function json5(params) {
  const jsonSchema = lazy(() => {
    return union([string2(params), number2(), boolean10(), _null3(), array(jsonSchema), record(string2(), jsonSchema)]);
  });
  return jsonSchema;
}
function preprocess(fn, schema) {
  return pipe(transform(fn), schema);
}

// node_modules/zod/v4/classic/compat.js
var ZodIssueCode = {
  invalid_type: "invalid_type",
  too_big: "too_big",
  too_small: "too_small",
  invalid_format: "invalid_format",
  not_multiple_of: "not_multiple_of",
  unrecognized_keys: "unrecognized_keys",
  invalid_union: "invalid_union",
  invalid_key: "invalid_key",
  invalid_element: "invalid_element",
  invalid_value: "invalid_value",
  custom: "custom"
};
function setErrorMap(map2) {
  config({
    customError: map2
  });
}
function getErrorMap() {
  return config().customError;
}
var ZodFirstPartyTypeKind;
/* @__PURE__ */ (function(ZodFirstPartyTypeKind2) {
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));

// node_modules/zod/v4/classic/from-json-schema.js
var z = {
  ...schemas_exports2,
  ...checks_exports2,
  iso: iso_exports
};
function detectVersion(schema, defaultTarget) {
  const $schema = schema.$schema;
  if ($schema === "https://json-schema.org/draft/2020-12/schema") {
    return "draft-2020-12";
  }
  if ($schema === "http://json-schema.org/draft-07/schema#") {
    return "draft-7";
  }
  if ($schema === "http://json-schema.org/draft-04/schema#") {
    return "draft-4";
  }
  return defaultTarget ?? "draft-2020-12";
}
function resolveRef(ref, ctx) {
  if (!ref.startsWith("#")) {
    throw new Error("External $ref is not supported, only local refs (#/...) are allowed");
  }
  const path3 = ref.slice(1).split("/").filter(Boolean);
  if (path3.length === 0) {
    return ctx.rootSchema;
  }
  const defsKey = ctx.version === "draft-2020-12" ? "$defs" : "definitions";
  if (path3[0] === defsKey) {
    const key = path3[1];
    if (!key || !ctx.defs[key]) {
      throw new Error(`Reference not found: ${ref}`);
    }
    return ctx.defs[key];
  }
  throw new Error(`Reference not found: ${ref}`);
}
function convertBaseSchema(schema, ctx) {
  if (schema.not !== void 0) {
    if (typeof schema.not === "object" && Object.keys(schema.not).length === 0) {
      return z.never();
    }
    throw new Error("not is not supported in Zod (except { not: {} } for never)");
  }
  if (schema.unevaluatedItems !== void 0) {
    throw new Error("unevaluatedItems is not supported");
  }
  if (schema.unevaluatedProperties !== void 0) {
    throw new Error("unevaluatedProperties is not supported");
  }
  if (schema.if !== void 0 || schema.then !== void 0 || schema.else !== void 0) {
    throw new Error("Conditional schemas (if/then/else) are not supported");
  }
  if (schema.dependentSchemas !== void 0 || schema.dependentRequired !== void 0) {
    throw new Error("dependentSchemas and dependentRequired are not supported");
  }
  if (schema.$ref) {
    const refPath = schema.$ref;
    if (ctx.refs.has(refPath)) {
      return ctx.refs.get(refPath);
    }
    if (ctx.processing.has(refPath)) {
      return z.lazy(() => {
        if (!ctx.refs.has(refPath)) {
          throw new Error(`Circular reference not resolved: ${refPath}`);
        }
        return ctx.refs.get(refPath);
      });
    }
    ctx.processing.add(refPath);
    const resolved = resolveRef(refPath, ctx);
    const zodSchema2 = convertSchema(resolved, ctx);
    ctx.refs.set(refPath, zodSchema2);
    ctx.processing.delete(refPath);
    return zodSchema2;
  }
  if (schema.enum !== void 0) {
    const enumValues = schema.enum;
    if (ctx.version === "openapi-3.0" && schema.nullable === true && enumValues.length === 1 && enumValues[0] === null) {
      return z.null();
    }
    if (enumValues.length === 0) {
      return z.never();
    }
    if (enumValues.length === 1) {
      return z.literal(enumValues[0]);
    }
    if (enumValues.every((v) => typeof v === "string")) {
      return z.enum(enumValues);
    }
    const literalSchemas = enumValues.map((v) => z.literal(v));
    if (literalSchemas.length < 2) {
      return literalSchemas[0];
    }
    return z.union([literalSchemas[0], literalSchemas[1], ...literalSchemas.slice(2)]);
  }
  if (schema.const !== void 0) {
    return z.literal(schema.const);
  }
  const type = schema.type;
  if (Array.isArray(type)) {
    const typeSchemas = type.map((t2) => {
      const typeSchema = { ...schema, type: t2 };
      return convertBaseSchema(typeSchema, ctx);
    });
    if (typeSchemas.length === 0) {
      return z.never();
    }
    if (typeSchemas.length === 1) {
      return typeSchemas[0];
    }
    return z.union(typeSchemas);
  }
  if (!type) {
    return z.any();
  }
  let zodSchema;
  switch (type) {
    case "string": {
      let stringSchema = z.string();
      if (schema.format) {
        const format = schema.format;
        if (format === "email") {
          stringSchema = stringSchema.check(z.email());
        } else if (format === "uri" || format === "uri-reference") {
          stringSchema = stringSchema.check(z.url());
        } else if (format === "uuid" || format === "guid") {
          stringSchema = stringSchema.check(z.uuid());
        } else if (format === "date-time") {
          stringSchema = stringSchema.check(z.iso.datetime());
        } else if (format === "date") {
          stringSchema = stringSchema.check(z.iso.date());
        } else if (format === "time") {
          stringSchema = stringSchema.check(z.iso.time());
        } else if (format === "duration") {
          stringSchema = stringSchema.check(z.iso.duration());
        } else if (format === "ipv4") {
          stringSchema = stringSchema.check(z.ipv4());
        } else if (format === "ipv6") {
          stringSchema = stringSchema.check(z.ipv6());
        } else if (format === "mac") {
          stringSchema = stringSchema.check(z.mac());
        } else if (format === "cidr") {
          stringSchema = stringSchema.check(z.cidrv4());
        } else if (format === "cidr-v6") {
          stringSchema = stringSchema.check(z.cidrv6());
        } else if (format === "base64") {
          stringSchema = stringSchema.check(z.base64());
        } else if (format === "base64url") {
          stringSchema = stringSchema.check(z.base64url());
        } else if (format === "e164") {
          stringSchema = stringSchema.check(z.e164());
        } else if (format === "jwt") {
          stringSchema = stringSchema.check(z.jwt());
        } else if (format === "emoji") {
          stringSchema = stringSchema.check(z.emoji());
        } else if (format === "nanoid") {
          stringSchema = stringSchema.check(z.nanoid());
        } else if (format === "cuid") {
          stringSchema = stringSchema.check(z.cuid());
        } else if (format === "cuid2") {
          stringSchema = stringSchema.check(z.cuid2());
        } else if (format === "ulid") {
          stringSchema = stringSchema.check(z.ulid());
        } else if (format === "xid") {
          stringSchema = stringSchema.check(z.xid());
        } else if (format === "ksuid") {
          stringSchema = stringSchema.check(z.ksuid());
        }
      }
      if (typeof schema.minLength === "number") {
        stringSchema = stringSchema.min(schema.minLength);
      }
      if (typeof schema.maxLength === "number") {
        stringSchema = stringSchema.max(schema.maxLength);
      }
      if (schema.pattern) {
        stringSchema = stringSchema.regex(new RegExp(schema.pattern));
      }
      zodSchema = stringSchema;
      break;
    }
    case "number":
    case "integer": {
      let numberSchema = type === "integer" ? z.number().int() : z.number();
      if (typeof schema.minimum === "number") {
        numberSchema = numberSchema.min(schema.minimum);
      }
      if (typeof schema.maximum === "number") {
        numberSchema = numberSchema.max(schema.maximum);
      }
      if (typeof schema.exclusiveMinimum === "number") {
        numberSchema = numberSchema.gt(schema.exclusiveMinimum);
      } else if (schema.exclusiveMinimum === true && typeof schema.minimum === "number") {
        numberSchema = numberSchema.gt(schema.minimum);
      }
      if (typeof schema.exclusiveMaximum === "number") {
        numberSchema = numberSchema.lt(schema.exclusiveMaximum);
      } else if (schema.exclusiveMaximum === true && typeof schema.maximum === "number") {
        numberSchema = numberSchema.lt(schema.maximum);
      }
      if (typeof schema.multipleOf === "number") {
        numberSchema = numberSchema.multipleOf(schema.multipleOf);
      }
      zodSchema = numberSchema;
      break;
    }
    case "boolean": {
      zodSchema = z.boolean();
      break;
    }
    case "null": {
      zodSchema = z.null();
      break;
    }
    case "object": {
      const shape = {};
      const properties = schema.properties || {};
      const requiredSet = new Set(schema.required || []);
      for (const [key, propSchema] of Object.entries(properties)) {
        const propZodSchema = convertSchema(propSchema, ctx);
        shape[key] = requiredSet.has(key) ? propZodSchema : propZodSchema.optional();
      }
      if (schema.propertyNames) {
        const keySchema = convertSchema(schema.propertyNames, ctx);
        const valueSchema = schema.additionalProperties && typeof schema.additionalProperties === "object" ? convertSchema(schema.additionalProperties, ctx) : z.any();
        if (Object.keys(shape).length === 0) {
          zodSchema = z.record(keySchema, valueSchema);
          break;
        }
        const objectSchema2 = z.object(shape).passthrough();
        const recordSchema = z.looseRecord(keySchema, valueSchema);
        zodSchema = z.intersection(objectSchema2, recordSchema);
        break;
      }
      if (schema.patternProperties) {
        const patternProps = schema.patternProperties;
        const patternKeys = Object.keys(patternProps);
        const looseRecords = [];
        for (const pattern of patternKeys) {
          const patternValue = convertSchema(patternProps[pattern], ctx);
          const keySchema = z.string().regex(new RegExp(pattern));
          looseRecords.push(z.looseRecord(keySchema, patternValue));
        }
        const schemasToIntersect = [];
        if (Object.keys(shape).length > 0) {
          schemasToIntersect.push(z.object(shape).passthrough());
        }
        schemasToIntersect.push(...looseRecords);
        if (schemasToIntersect.length === 0) {
          zodSchema = z.object({}).passthrough();
        } else if (schemasToIntersect.length === 1) {
          zodSchema = schemasToIntersect[0];
        } else {
          let result = z.intersection(schemasToIntersect[0], schemasToIntersect[1]);
          for (let i = 2; i < schemasToIntersect.length; i++) {
            result = z.intersection(result, schemasToIntersect[i]);
          }
          zodSchema = result;
        }
        break;
      }
      const objectSchema = z.object(shape);
      if (schema.additionalProperties === false) {
        zodSchema = objectSchema.strict();
      } else if (typeof schema.additionalProperties === "object") {
        zodSchema = objectSchema.catchall(convertSchema(schema.additionalProperties, ctx));
      } else {
        zodSchema = objectSchema.passthrough();
      }
      break;
    }
    case "array": {
      const prefixItems = schema.prefixItems;
      const items = schema.items;
      if (prefixItems && Array.isArray(prefixItems)) {
        const tupleItems = prefixItems.map((item) => convertSchema(item, ctx));
        const rest = items && typeof items === "object" && !Array.isArray(items) ? convertSchema(items, ctx) : void 0;
        if (rest) {
          zodSchema = z.tuple(tupleItems).rest(rest);
        } else {
          zodSchema = z.tuple(tupleItems);
        }
        if (typeof schema.minItems === "number") {
          zodSchema = zodSchema.check(z.minLength(schema.minItems));
        }
        if (typeof schema.maxItems === "number") {
          zodSchema = zodSchema.check(z.maxLength(schema.maxItems));
        }
      } else if (Array.isArray(items)) {
        const tupleItems = items.map((item) => convertSchema(item, ctx));
        const rest = schema.additionalItems && typeof schema.additionalItems === "object" ? convertSchema(schema.additionalItems, ctx) : void 0;
        if (rest) {
          zodSchema = z.tuple(tupleItems).rest(rest);
        } else {
          zodSchema = z.tuple(tupleItems);
        }
        if (typeof schema.minItems === "number") {
          zodSchema = zodSchema.check(z.minLength(schema.minItems));
        }
        if (typeof schema.maxItems === "number") {
          zodSchema = zodSchema.check(z.maxLength(schema.maxItems));
        }
      } else if (items !== void 0) {
        const element = convertSchema(items, ctx);
        let arraySchema = z.array(element);
        if (typeof schema.minItems === "number") {
          arraySchema = arraySchema.min(schema.minItems);
        }
        if (typeof schema.maxItems === "number") {
          arraySchema = arraySchema.max(schema.maxItems);
        }
        zodSchema = arraySchema;
      } else {
        zodSchema = z.array(z.any());
      }
      break;
    }
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
  if (schema.description) {
    zodSchema = zodSchema.describe(schema.description);
  }
  if (schema.default !== void 0) {
    zodSchema = zodSchema.default(schema.default);
  }
  return zodSchema;
}
function convertSchema(schema, ctx) {
  if (typeof schema === "boolean") {
    return schema ? z.any() : z.never();
  }
  let baseSchema = convertBaseSchema(schema, ctx);
  const hasExplicitType = schema.type || schema.enum !== void 0 || schema.const !== void 0;
  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    const options = schema.anyOf.map((s) => convertSchema(s, ctx));
    const anyOfUnion = z.union(options);
    baseSchema = hasExplicitType ? z.intersection(baseSchema, anyOfUnion) : anyOfUnion;
  }
  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    const options = schema.oneOf.map((s) => convertSchema(s, ctx));
    const oneOfUnion = z.xor(options);
    baseSchema = hasExplicitType ? z.intersection(baseSchema, oneOfUnion) : oneOfUnion;
  }
  if (schema.allOf && Array.isArray(schema.allOf)) {
    if (schema.allOf.length === 0) {
      baseSchema = hasExplicitType ? baseSchema : z.any();
    } else {
      let result = hasExplicitType ? baseSchema : convertSchema(schema.allOf[0], ctx);
      const startIdx = hasExplicitType ? 0 : 1;
      for (let i = startIdx; i < schema.allOf.length; i++) {
        result = z.intersection(result, convertSchema(schema.allOf[i], ctx));
      }
      baseSchema = result;
    }
  }
  if (schema.nullable === true && ctx.version === "openapi-3.0") {
    baseSchema = z.nullable(baseSchema);
  }
  if (schema.readOnly === true) {
    baseSchema = z.readonly(baseSchema);
  }
  return baseSchema;
}
function fromJSONSchema(schema, params) {
  if (typeof schema === "boolean") {
    return schema ? z.any() : z.never();
  }
  const version2 = detectVersion(schema, params?.defaultTarget);
  const defs = schema.$defs || schema.definitions || {};
  const ctx = {
    version: version2,
    defs,
    refs: /* @__PURE__ */ new Map(),
    processing: /* @__PURE__ */ new Set(),
    rootSchema: schema
  };
  return convertSchema(schema, ctx);
}

// node_modules/zod/v4/classic/coerce.js
var coerce_exports = {};
__export(coerce_exports, {
  bigint: () => bigint3,
  boolean: () => boolean11,
  date: () => date4,
  number: () => number3,
  string: () => string3
});
function string3(params) {
  return _coercedString(ZodString, params);
}
function number3(params) {
  return _coercedNumber(ZodNumber, params);
}
function boolean11(params) {
  return _coercedBoolean(ZodBoolean, params);
}
function bigint3(params) {
  return _coercedBigint(ZodBigInt, params);
}
function date4(params) {
  return _coercedDate(ZodDate, params);
}

// node_modules/zod/v4/classic/external.js
config(en_default());

// server/routers/events.ts
init_db2();
var eventsRouter = router({
  // 公開イベント一覧取得
  list: publicProcedure.query(async () => {
    return getAllEvents();
  }),
  // ページネーション対応のイベント一覧取得
  listPaginated: publicProcedure.input(external_exports.object({
    cursor: external_exports.number().optional(),
    limit: external_exports.number().min(1).max(50).default(20),
    filter: external_exports.enum(["all", "solo", "group"]).optional(),
    search: external_exports.string().optional()
  })).query(async ({ input }) => {
    const { cursor = 0, limit, filter, search } = input;
    const allEvents = await getAllEvents();
    let filteredEvents = allEvents;
    if (filter && filter !== "all") {
      filteredEvents = filteredEvents.filter((e) => e.eventType === filter);
    }
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filteredEvents = filteredEvents.filter((e) => {
        const title = (e.title || "").toLowerCase();
        const description = (e.description || "").toLowerCase();
        const venue = (e.venue || "").toLowerCase();
        const hostName = (e.hostName || "").toLowerCase();
        return title.includes(searchLower) || description.includes(searchLower) || venue.includes(searchLower) || hostName.includes(searchLower);
      });
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
  getById: publicProcedure.input(external_exports.object({ id: external_exports.number() })).query(async ({ input }) => {
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
    } catch (error46) {
      console.error(`[events.getById] requestId=${requestId} id=${input.id} ERROR:`, error46);
      throw error46;
    }
  }),
  // 自分が作成したイベント一覧
  myEvents: protectedProcedure.query(async ({ ctx }) => {
    return getEventsByHostTwitterId(ctx.user.openId);
  }),
  // イベント作成
  create: publicProcedure.input(external_exports.object({
    title: external_exports.string().min(1).max(255),
    description: external_exports.string().optional(),
    eventDate: external_exports.string(),
    venue: external_exports.string().optional(),
    hostTwitterId: external_exports.string(),
    hostName: external_exports.string(),
    hostUsername: external_exports.string().optional(),
    hostProfileImage: external_exports.string().optional(),
    hostFollowersCount: external_exports.number().optional(),
    hostDescription: external_exports.string().optional(),
    goalType: external_exports.enum(["attendance", "followers", "viewers", "points", "custom"]).optional(),
    goalValue: external_exports.number().optional(),
    goalUnit: external_exports.string().optional(),
    eventType: external_exports.enum(["solo", "group"]).optional(),
    categoryId: external_exports.number().optional(),
    externalUrl: external_exports.string().optional(),
    ticketPresale: external_exports.number().optional(),
    ticketDoor: external_exports.number().optional(),
    ticketUrl: external_exports.string().optional()
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
    } catch (error46) {
      console.error("[Challenge Create] Error:", error46);
      const errorMessage = error46 instanceof Error ? error46.message : String(error46);
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
  update: protectedProcedure.input(external_exports.object({
    id: external_exports.number(),
    title: external_exports.string().min(1).max(255).optional(),
    description: external_exports.string().optional(),
    eventDate: external_exports.string().optional(),
    venue: external_exports.string().optional(),
    isPublic: external_exports.boolean().optional(),
    goalValue: external_exports.number().optional(),
    goalUnit: external_exports.string().optional(),
    goalType: external_exports.enum(["attendance", "followers", "viewers", "points", "custom"]).optional(),
    eventType: external_exports.enum(["solo", "group"]).optional(),
    categoryId: external_exports.number().optional(),
    externalUrl: external_exports.string().optional(),
    ticketPresale: external_exports.number().optional(),
    ticketDoor: external_exports.number().optional(),
    ticketUrl: external_exports.string().optional()
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
  delete: protectedProcedure.input(external_exports.object({ id: external_exports.number() })).mutation(async ({ ctx, input }) => {
    const event = await getEventById(input.id);
    if (!event || event.hostTwitterId !== ctx.user.openId) {
      throw new Error("Unauthorized");
    }
    await deleteEvent(input.id);
    return { success: true };
  })
});

// server/routers/participations.ts
init_db2();
init_schema2();
var participationsRouter = router({
  // イベントの参加者一覧
  listByEvent: publicProcedure.input(external_exports.object({ eventId: external_exports.number() })).query(async ({ input }) => {
    return getParticipationsByEventId(input.eventId);
  }),
  // 参加方法別集計
  getAttendanceTypeCounts: publicProcedure.input(external_exports.object({ eventId: external_exports.number() })).query(async ({ input }) => {
    return getAttendanceTypeCounts(input.eventId);
  }),
  // 自分の参加一覧
  myParticipations: protectedProcedure.query(async ({ ctx }) => {
    return getParticipationsByUserId(ctx.user.id);
  }),
  // 参加登録
  create: publicProcedure.input(external_exports.object({
    challengeId: external_exports.number(),
    message: external_exports.string().optional(),
    companionCount: external_exports.number().default(0),
    prefecture: external_exports.string().optional(),
    gender: external_exports.enum(["male", "female", "unspecified"]).optional(),
    attendanceType: external_exports.enum(["venue", "streaming", "both"]).default("venue"),
    twitterId: external_exports.string().optional(),
    displayName: external_exports.string(),
    username: external_exports.string().optional(),
    profileImage: external_exports.string().optional(),
    followersCount: external_exports.number().optional(),
    companions: external_exports.array(external_exports.object({
      displayName: external_exports.string(),
      twitterUsername: external_exports.string().optional(),
      twitterId: external_exports.string().optional(),
      profileImage: external_exports.string().optional()
    })).optional(),
    invitationCode: external_exports.string().optional()
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
      if (ctx.user?.id && input.gender) {
        await upsertUser({
          openId: ctx.user.openId,
          gender: input.gender
        });
      }
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
    } catch (error46) {
      console.error("[Participation Create] Error:", error46);
      const errorMessage = error46 instanceof Error ? error46.message : String(error46);
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
  createAnonymous: publicProcedure.input(external_exports.object({
    challengeId: external_exports.number(),
    displayName: external_exports.string(),
    message: external_exports.string().optional(),
    companionCount: external_exports.number().default(0),
    prefecture: external_exports.string().optional(),
    companions: external_exports.array(external_exports.object({
      displayName: external_exports.string(),
      twitterUsername: external_exports.string().optional(),
      twitterId: external_exports.string().optional(),
      profileImage: external_exports.string().optional()
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
  update: protectedProcedure.input(external_exports.object({
    id: external_exports.number(),
    message: external_exports.string().optional(),
    prefecture: external_exports.string().optional(),
    gender: external_exports.enum(["male", "female", "unspecified"]).optional(),
    companionCount: external_exports.number().default(0),
    companions: external_exports.array(external_exports.object({
      displayName: external_exports.string(),
      twitterUsername: external_exports.string().optional(),
      twitterId: external_exports.string().optional(),
      profileImage: external_exports.string().optional()
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
  delete: protectedProcedure.input(external_exports.object({ id: external_exports.number() })).mutation(async ({ ctx, input }) => {
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
  softDelete: protectedProcedure.input(external_exports.object({ id: external_exports.number() })).mutation(async ({ ctx, input }) => {
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
  cancel: protectedProcedure.input(external_exports.object({
    participationId: external_exports.number(),
    createTransfer: external_exports.boolean().default(false),
    transferComment: external_exports.string().max(500).optional(),
    userUsername: external_exports.string().optional()
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
init_db2();
var notificationsRouter = router({
  // 通知設定取得
  getSettings: protectedProcedure.input(external_exports.object({ challengeId: external_exports.number() })).query(async ({ ctx, input }) => {
    const settings = await getNotificationSettings(ctx.user.id);
    return settings;
  }),
  // 通知設定更新
  updateSettings: protectedProcedure.input(external_exports.object({
    challengeId: external_exports.number(),
    onGoalReached: external_exports.boolean().optional(),
    onMilestone25: external_exports.boolean().optional(),
    onMilestone50: external_exports.boolean().optional(),
    onMilestone75: external_exports.boolean().optional(),
    onNewParticipant: external_exports.boolean().optional(),
    expoPushToken: external_exports.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const { challengeId, ...settings } = input;
    await upsertNotificationSettings(ctx.user.id, challengeId, settings);
    return { success: true };
  }),
  // 通知履歴取得
  list: protectedProcedure.input(external_exports.object({
    limit: external_exports.number().optional().default(20),
    cursor: external_exports.number().optional()
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
  markAsRead: protectedProcedure.input(external_exports.object({ id: external_exports.number() })).mutation(async ({ input }) => {
    await markNotificationAsRead(input.id);
    return { success: true };
  }),
  // 全ての通知を既読にする
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await markAllNotificationsAsRead(ctx.user.id);
    return { success: true };
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
  const url2 = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url2.searchParams.set("path", normalizeKey(relKey));
  return url2;
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
  const url2 = (await response.json()).url;
  return { key, url: url2 };
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
  const { url: url2 } = await storagePut(`generated/${Date.now()}.png`, buffer, result.image.mimeType);
  return {
    url: url2
  };
}

// server/routers/ogp.ts
init_db2();
var ogpRouter = router({
  // チャレンジのシェア用OGP画像を生成
  generateChallengeOgp: publicProcedure.input(external_exports.object({ challengeId: external_exports.number() })).mutation(async ({ input }) => {
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
    } catch (error46) {
      console.error("OGP image generation failed:", error46);
      throw new Error("Failed to generate OGP image");
    }
  }),
  // 招待リンク用OGP画像を生成
  generateInviteOgp: publicProcedure.input(external_exports.object({ code: external_exports.string() })).mutation(async ({ input }) => {
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
    } catch (error46) {
      console.error("Invite OGP image generation failed:", error46);
      throw new Error("Failed to generate invite OGP image");
    }
  }),
  // 招待リンクのOGP情報を取得（画像生成なし、メタデータのみ）
  getInviteOgpMeta: publicProcedure.input(external_exports.object({ code: external_exports.string() })).query(async ({ input }) => {
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
  award: protectedProcedure.input(external_exports.object({
    userId: external_exports.number(),
    badgeId: external_exports.number(),
    challengeId: external_exports.number().optional()
  })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Admin access required");
    }
    const result = await awardBadge(input.userId, input.badgeId, input.challengeId);
    return { success: !!result, id: result };
  })
});

// server/routers/picked-comments.ts
init_db2();
var pickedCommentsRouter = router({
  // チャレンジのピックアップコメント一覧
  list: publicProcedure.input(external_exports.object({ challengeId: external_exports.number() })).query(async ({ input }) => {
    return getPickedCommentsWithParticipation(input.challengeId);
  }),
  // コメントをピックアップ（管理者/ホスト用）
  pick: protectedProcedure.input(external_exports.object({
    participationId: external_exports.number(),
    challengeId: external_exports.number(),
    reason: external_exports.string().optional()
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
  unpick: protectedProcedure.input(external_exports.object({ participationId: external_exports.number(), challengeId: external_exports.number() })).mutation(async ({ ctx, input }) => {
    const challenge = await getEventById(input.challengeId);
    if (!challenge) throw new Error("Challenge not found");
    if (challenge.hostUserId !== ctx.user.id && ctx.user.role !== "admin") {
      throw new Error("Permission denied");
    }
    await unpickComment(input.participationId);
    return { success: true };
  }),
  // 動画使用済みにマーク
  markAsUsed: protectedProcedure.input(external_exports.object({ id: external_exports.number(), challengeId: external_exports.number() })).mutation(async ({ ctx, input }) => {
    const challenge = await getEventById(input.challengeId);
    if (!challenge) throw new Error("Challenge not found");
    if (challenge.hostUserId !== ctx.user.id && ctx.user.role !== "admin") {
      throw new Error("Permission denied");
    }
    await markCommentAsUsedInVideo(input.id);
    return { success: true };
  }),
  // コメントがピックアップされているかチェック
  isPicked: publicProcedure.input(external_exports.object({ participationId: external_exports.number() })).query(async ({ input }) => {
    return isCommentPicked(input.participationId);
  })
});

// server/routers/prefectures.ts
init_db2();
var prefecturesRouter = router({
  // 地域ランキング
  ranking: publicProcedure.input(external_exports.object({ challengeId: external_exports.number() })).query(async ({ input }) => {
    return getPrefectureRanking(input.challengeId);
  }),
  // 地域フィルター付き参加者一覧
  participations: publicProcedure.input(external_exports.object({ challengeId: external_exports.number(), prefecture: external_exports.string() })).query(async ({ input }) => {
    return getParticipationsByPrefectureFilter(input.challengeId, input.prefecture);
  })
});

// server/routers/cheers.ts
init_db2();
var cheersRouter = router({
  // エールを送る
  send: protectedProcedure.input(external_exports.object({
    toParticipationId: external_exports.number(),
    toUserId: external_exports.number().optional(),
    challengeId: external_exports.number(),
    message: external_exports.string().optional(),
    emoji: external_exports.string().default("\u{1F44F}")
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
  forParticipation: publicProcedure.input(external_exports.object({ participationId: external_exports.number() })).query(async ({ input }) => {
    return getCheersForParticipation(input.participationId);
  }),
  // チャレンジのエール一覧
  forChallenge: publicProcedure.input(external_exports.object({ challengeId: external_exports.number() })).query(async ({ input }) => {
    return getCheersForChallenge(input.challengeId);
  }),
  // エール数を取得
  count: publicProcedure.input(external_exports.object({ participationId: external_exports.number() })).query(async ({ input }) => {
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
init_db2();
var achievementsRouter = router({
  // 達成記念ページを作成
  create: protectedProcedure.input(external_exports.object({
    challengeId: external_exports.number(),
    title: external_exports.string(),
    message: external_exports.string().optional()
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
  get: publicProcedure.input(external_exports.object({ challengeId: external_exports.number() })).query(async ({ input }) => {
    return getAchievementPage(input.challengeId);
  }),
  // 達成記念ページを更新
  update: protectedProcedure.input(external_exports.object({
    challengeId: external_exports.number(),
    title: external_exports.string().optional(),
    message: external_exports.string().optional(),
    isPublic: external_exports.boolean().optional()
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
init_db2();
var remindersRouter = router({
  // リマインダーを作成
  create: protectedProcedure.input(external_exports.object({
    challengeId: external_exports.number(),
    reminderType: external_exports.enum(["day_before", "day_of", "hour_before", "custom"]),
    customTime: external_exports.string().optional()
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
  getForChallenge: protectedProcedure.input(external_exports.object({ challengeId: external_exports.number() })).query(async ({ ctx, input }) => {
    return getUserReminderForChallenge(ctx.user.id, input.challengeId);
  }),
  // リマインダーを更新
  update: protectedProcedure.input(external_exports.object({
    id: external_exports.number(),
    reminderType: external_exports.enum(["day_before", "day_of", "hour_before", "custom"]).optional(),
    customTime: external_exports.string().optional()
  })).mutation(async ({ input }) => {
    await updateReminder(input.id, {
      reminderType: input.reminderType,
      customTime: input.customTime ? new Date(input.customTime) : void 0
    });
    return { success: true };
  }),
  // リマインダーを削除
  delete: protectedProcedure.input(external_exports.object({ id: external_exports.number() })).mutation(async ({ input }) => {
    await deleteReminder(input.id);
    return { success: true };
  })
});

// server/routers/dm.ts
init_db2();
var dmRouter = router({
  // DMを送信
  send: protectedProcedure.input(external_exports.object({
    toUserId: external_exports.number(),
    challengeId: external_exports.number(),
    message: external_exports.string().min(1).max(1e3)
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
  conversations: protectedProcedure.input(external_exports.object({
    limit: external_exports.number().optional().default(20),
    cursor: external_exports.number().optional()
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
  getConversation: protectedProcedure.input(external_exports.object({
    partnerId: external_exports.number(),
    challengeId: external_exports.number()
  })).query(async ({ ctx, input }) => {
    return getConversation(ctx.user.id, input.partnerId, input.challengeId);
  }),
  // 未読メッセージ数を取得
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return getUnreadMessageCount(ctx.user.id);
  }),
  // メッセージを既読にする
  markAsRead: protectedProcedure.input(external_exports.object({ id: external_exports.number() })).mutation(async ({ input }) => {
    await markMessageAsRead(input.id);
    return { success: true };
  }),
  // 特定の相手からのメッセージを全て既読にする
  markAllAsRead: protectedProcedure.input(external_exports.object({ fromUserId: external_exports.number() })).mutation(async ({ ctx, input }) => {
    await markAllMessagesAsRead(ctx.user.id, input.fromUserId);
    return { success: true };
  })
});

// server/routers/templates.ts
init_db2();
var templatesRouter = router({
  // テンプレートを作成
  create: protectedProcedure.input(external_exports.object({
    name: external_exports.string().min(1).max(100),
    description: external_exports.string().optional(),
    goalType: external_exports.enum(["attendance", "followers", "viewers", "points", "custom"]),
    goalValue: external_exports.number().min(1),
    goalUnit: external_exports.string().default("\u4EBA"),
    eventType: external_exports.enum(["solo", "group"]),
    ticketPresale: external_exports.number().optional(),
    ticketDoor: external_exports.number().optional(),
    isPublic: external_exports.boolean().default(false)
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
  get: publicProcedure.input(external_exports.object({ id: external_exports.number() })).query(async ({ input }) => {
    return getChallengeTemplateById(input.id);
  }),
  // テンプレートを更新
  update: protectedProcedure.input(external_exports.object({
    id: external_exports.number(),
    name: external_exports.string().min(1).max(100).optional(),
    description: external_exports.string().optional(),
    goalType: external_exports.enum(["attendance", "followers", "viewers", "points", "custom"]).optional(),
    goalValue: external_exports.number().min(1).optional(),
    goalUnit: external_exports.string().optional(),
    eventType: external_exports.enum(["solo", "group"]).optional(),
    ticketPresale: external_exports.number().optional(),
    ticketDoor: external_exports.number().optional(),
    isPublic: external_exports.boolean().optional()
  })).mutation(async ({ ctx, input }) => {
    const template = await getChallengeTemplateById(input.id);
    if (!template) throw new Error("Template not found");
    if (template.userId !== ctx.user.id) throw new Error("Permission denied");
    await updateChallengeTemplate(input.id, input);
    return { success: true };
  }),
  // テンプレートを削除
  delete: protectedProcedure.input(external_exports.object({ id: external_exports.number() })).mutation(async ({ ctx, input }) => {
    const template = await getChallengeTemplateById(input.id);
    if (!template) throw new Error("Template not found");
    if (template.userId !== ctx.user.id) throw new Error("Permission denied");
    await deleteChallengeTemplate(input.id);
    return { success: true };
  }),
  // テンプレートの使用回数をインクリメント
  incrementUseCount: protectedProcedure.input(external_exports.object({ id: external_exports.number() })).mutation(async ({ input }) => {
    await incrementTemplateUseCount(input.id);
    return { success: true };
  })
});

// server/routers/search.ts
init_db2();
var searchRouter = router({
  // チャレンジを検索
  challenges: publicProcedure.input(external_exports.object({ query: external_exports.string().min(1) })).query(async ({ input }) => {
    return searchChallenges(input.query);
  }),
  // ページネーション対応の検索
  challengesPaginated: publicProcedure.input(external_exports.object({
    query: external_exports.string().min(1),
    cursor: external_exports.number().optional(),
    limit: external_exports.number().min(1).max(50).default(20)
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
  saveHistory: protectedProcedure.input(external_exports.object({ query: external_exports.string(), resultCount: external_exports.number() })).mutation(async ({ ctx, input }) => {
    const result = await saveSearchHistory({
      userId: ctx.user.id,
      query: input.query,
      resultCount: input.resultCount
    });
    return { success: !!result, id: result };
  }),
  // 検索履歴を取得
  history: protectedProcedure.input(external_exports.object({ limit: external_exports.number().optional() })).query(async ({ ctx, input }) => {
    return getSearchHistoryForUser(ctx.user.id, input.limit || 10);
  }),
  // 検索履歴をクリア
  clearHistory: protectedProcedure.mutation(async ({ ctx }) => {
    await clearSearchHistoryForUser(ctx.user.id);
    return { success: true };
  }),
  // ユーザーを検索
  users: publicProcedure.input(external_exports.object({ query: external_exports.string().min(1) })).query(async ({ input }) => {
    const allUsers = await getAllUsers();
    const queryLower = input.query.toLowerCase();
    const results = allUsers.filter((user) => {
      const name = (user.name || "").toLowerCase();
      const username = (user.username || "").toLowerCase();
      const description = (user.description || "").toLowerCase();
      return name.includes(queryLower) || username.includes(queryLower) || description.includes(queryLower);
    });
    return results;
  }),
  // ページネーション対応のユーザー検索
  usersPaginated: publicProcedure.input(external_exports.object({
    query: external_exports.string().min(1),
    cursor: external_exports.number().optional(),
    limit: external_exports.number().min(1).max(50).default(20)
  })).query(async ({ input }) => {
    const { query, cursor = 0, limit } = input;
    const allUsers = await getAllUsers();
    const queryLower = query.toLowerCase();
    const allResults = allUsers.filter((user) => {
      const name = (user.name || "").toLowerCase();
      const username = (user.username || "").toLowerCase();
      const description = (user.description || "").toLowerCase();
      return name.includes(queryLower) || username.includes(queryLower) || description.includes(queryLower);
    });
    const items = allResults.slice(cursor, cursor + limit);
    const nextCursor = cursor + limit < allResults.length ? cursor + limit : void 0;
    return {
      items,
      nextCursor,
      totalCount: allResults.length
    };
  }),
  // メッセージを検索
  messages: protectedProcedure.input(external_exports.object({ query: external_exports.string().min(1) })).query(async ({ ctx, input }) => {
    const allMessages = await getDirectMessagesForUser(ctx.user.id);
    const queryLower = input.query.toLowerCase();
    const results = allMessages.filter((msg) => {
      const message = (msg.message || "").toLowerCase();
      const fromUserName = (msg.fromUserName || "").toLowerCase();
      return message.includes(queryLower) || fromUserName.includes(queryLower);
    });
    return results;
  }),
  // ページネーション対応のメッセージ検索
  messagesPaginated: protectedProcedure.input(external_exports.object({
    query: external_exports.string().min(1),
    cursor: external_exports.number().optional(),
    limit: external_exports.number().min(1).max(50).default(20)
  })).query(async ({ ctx, input }) => {
    const { query, cursor = 0, limit } = input;
    const allMessages = await getDirectMessagesForUser(ctx.user.id);
    const queryLower = query.toLowerCase();
    const allResults = allMessages.filter((msg) => {
      const message = (msg.message || "").toLowerCase();
      const fromUserName = (msg.fromUserName || "").toLowerCase();
      return message.includes(queryLower) || fromUserName.includes(queryLower);
    });
    const items = allResults.slice(cursor, cursor + limit);
    const nextCursor = cursor + limit < allResults.length ? cursor + limit : void 0;
    return {
      items,
      nextCursor,
      totalCount: allResults.length
    };
  })
});

// server/routers/follows.ts
init_db2();
var followsRouter = router({
  // フォローする
  follow: protectedProcedure.input(external_exports.object({
    followeeId: external_exports.number(),
    followeeName: external_exports.string().optional(),
    followeeImage: external_exports.string().optional()
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
  unfollow: protectedProcedure.input(external_exports.object({ followeeId: external_exports.number() })).mutation(async ({ ctx, input }) => {
    await unfollowUser(ctx.user.id, input.followeeId);
    return { success: true };
  }),
  // フォロー中のユーザー一覧
  following: protectedProcedure.query(async ({ ctx }) => {
    return getFollowingForUser(ctx.user.id);
  }),
  // フォロワー一覧（特定ユーザーまたは自分）
  followers: publicProcedure.input(external_exports.object({ userId: external_exports.number().optional() }).optional()).query(async ({ ctx, input }) => {
    const targetUserId = input?.userId || ctx.user?.id;
    if (!targetUserId) return [];
    return getFollowersForUser(targetUserId);
  }),
  // フォローしているかチェック
  isFollowing: protectedProcedure.input(external_exports.object({ followeeId: external_exports.number() })).query(async ({ ctx, input }) => {
    return isFollowing(ctx.user.id, input.followeeId);
  }),
  // フォロワー数を取得
  followerCount: publicProcedure.input(external_exports.object({ userId: external_exports.number() })).query(async ({ input }) => {
    return getFollowerCount(input.userId);
  }),
  // 特定ユーザーのフォロワーID一覧を取得（ランキング優先表示用）
  followerIds: publicProcedure.input(external_exports.object({ userId: external_exports.number() })).query(async ({ input }) => {
    return getFollowerIdsForUser(input.userId);
  }),
  // フォロー中の数を取得
  followingCount: publicProcedure.input(external_exports.object({ userId: external_exports.number() })).query(async ({ input }) => {
    return getFollowingCount(input.userId);
  }),
  // 新着チャレンジ通知設定を更新
  updateNotification: protectedProcedure.input(external_exports.object({ followeeId: external_exports.number(), notify: external_exports.boolean() })).mutation(async ({ ctx, input }) => {
    await updateFollowNotification(ctx.user.id, input.followeeId, input.notify);
    return { success: true };
  })
});

// server/routers/rankings.ts
init_db2();
var rankingsRouter = router({
  // 貢献度ランキング
  contribution: publicProcedure.input(external_exports.object({
    period: external_exports.enum(["weekly", "monthly", "all"]).optional(),
    limit: external_exports.number().optional()
  })).query(async ({ input }) => {
    return getGlobalContributionRanking(input.period || "all", input.limit || 50);
  }),
  // チャレンジ達成率ランキング
  challengeAchievement: publicProcedure.input(external_exports.object({ limit: external_exports.number().optional() })).query(async ({ input }) => {
    return getChallengeAchievementRanking(input.limit || 50);
  }),
  // ホストランキング
  hosts: publicProcedure.input(external_exports.object({ limit: external_exports.number().optional() })).query(async ({ input }) => {
    return getHostRanking(input.limit || 50);
  }),
  // 自分のランキング位置を取得
  myPosition: protectedProcedure.input(external_exports.object({ period: external_exports.enum(["weekly", "monthly", "all"]).optional() })).query(async ({ ctx, input }) => {
    return getUserRankingPosition(ctx.user.id, input.period || "all");
  })
});

// server/routers/categories.ts
init_db2();
var categoriesRouter = router({
  // カテゴリ一覧を取得
  list: publicProcedure.query(async () => {
    return getAllCategories();
  }),
  // カテゴリ詳細を取得
  get: publicProcedure.input(external_exports.object({ id: external_exports.number() })).query(async ({ input }) => {
    return getCategoryById(input.id);
  }),
  // カテゴリ別チャレンジ一覧
  challenges: publicProcedure.input(external_exports.object({ categoryId: external_exports.number() })).query(async ({ input }) => {
    return getChallengesByCategory(input.categoryId);
  }),
  // カテゴリ作成（管理者のみ）
  create: protectedProcedure.input(external_exports.object({
    name: external_exports.string().min(1).max(100),
    slug: external_exports.string().min(1).max(100),
    description: external_exports.string().optional(),
    icon: external_exports.string().optional(),
    sortOrder: external_exports.number().optional()
  })).mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    return createCategory(input);
  }),
  // カテゴリ更新（管理者のみ）
  update: protectedProcedure.input(external_exports.object({
    id: external_exports.number(),
    name: external_exports.string().min(1).max(100).optional(),
    slug: external_exports.string().min(1).max(100).optional(),
    description: external_exports.string().optional(),
    icon: external_exports.string().optional(),
    sortOrder: external_exports.number().optional(),
    isActive: external_exports.boolean().optional()
  })).mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    const { id, ...data } = input;
    return updateCategory(id, data);
  }),
  // カテゴリ削除（管理者のみ）
  delete: protectedProcedure.input(external_exports.object({ id: external_exports.number() })).mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    return deleteCategory(input.id);
  })
});

// server/routers/invitations.ts
init_db2();
var invitationsRouter = router({
  // 招待リンクを作成
  create: protectedProcedure.input(external_exports.object({
    challengeId: external_exports.number(),
    maxUses: external_exports.number().optional(),
    expiresAt: external_exports.string().optional(),
    customMessage: external_exports.string().max(500).optional(),
    customTitle: external_exports.string().max(100).optional()
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
  getByCode: publicProcedure.input(external_exports.object({ code: external_exports.string() })).query(async ({ input }) => {
    return getInvitationByCode(input.code);
  }),
  // チャレンジの招待一覧
  forChallenge: protectedProcedure.input(external_exports.object({ challengeId: external_exports.number() })).query(async ({ input }) => {
    return getInvitationsForChallenge(input.challengeId);
  }),
  // 自分が作成した招待一覧
  mine: protectedProcedure.query(async ({ ctx }) => {
    return getInvitationsForUser(ctx.user.id);
  }),
  // 招待を使用
  use: protectedProcedure.input(external_exports.object({ code: external_exports.string() })).mutation(async ({ ctx, input }) => {
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
  deactivate: protectedProcedure.input(external_exports.object({ id: external_exports.number() })).mutation(async ({ input }) => {
    await deactivateInvitation(input.id);
    return { success: true };
  }),
  // 招待の統計を取得
  stats: protectedProcedure.input(external_exports.object({ invitationId: external_exports.number() })).query(async ({ input }) => {
    return getInvitationStats(input.invitationId);
  }),
  // ユーザーの招待実績を取得
  myStats: protectedProcedure.query(async ({ ctx }) => {
    return getUserInvitationStats(ctx.user.id);
  }),
  // チャレンジの招待経由参加者一覧
  invitedParticipants: protectedProcedure.input(external_exports.object({ challengeId: external_exports.number() })).query(async ({ ctx, input }) => {
    return getInvitedParticipants(input.challengeId, ctx.user.id);
  })
});

// server/routers/profiles.ts
init_db2();
var genderSchema = external_exports.enum(["male", "female", "unspecified"]);
var profilesRouter = router({
  // 認証中ユーザーの自分用プロフィール取得（auth.me と同様だが profiles 名前空間）
  me: publicProcedure.query((opts) => opts.ctx.user),
  // 自分のプロフィール（都道府県・性別）を更新
  updateMyProfile: protectedProcedure.input(
    external_exports.object({
      prefecture: external_exports.string().max(32).nullable().optional(),
      gender: genderSchema.optional()
    })
  ).mutation(async ({ ctx, input }) => {
    await upsertUser({
      openId: ctx.user.openId,
      ...input.prefecture !== void 0 && { prefecture: input.prefecture },
      ...input.gender !== void 0 && { gender: input.gender }
    });
    const updated = await getUserByOpenId(ctx.user.openId);
    return { user: updated ?? null };
  }),
  // ユーザーの公開プロフィールを取得
  get: publicProcedure.input(external_exports.object({ userId: external_exports.number() })).query(async ({ input }) => {
    return getUserPublicProfile(input.userId);
  }),
  // twitterIdでユーザーを取得（外部共有URL用）
  getByTwitterId: publicProcedure.input(external_exports.object({ twitterId: external_exports.string() })).query(async ({ input }) => {
    return getUserByTwitterId(input.twitterId);
  }),
  // 推し活状況を取得
  getOshikatsuStats: publicProcedure.input(external_exports.object({
    userId: external_exports.number().optional(),
    twitterId: external_exports.string().optional()
  })).query(async ({ input }) => {
    return getOshikatsuStats(input.userId, input.twitterId);
  }),
  // おすすめホスト（同じカテゴリのチャレンジを開催しているホスト）
  recommendedHosts: publicProcedure.input(external_exports.object({
    categoryId: external_exports.number().optional(),
    limit: external_exports.number().min(1).max(10).default(5)
  })).query(async ({ ctx, input }) => {
    const userId = ctx.user?.id;
    return getRecommendedHosts(userId, input.categoryId, input.limit);
  })
});

// server/routers/companions.ts
init_db2();
var companionsRouter = router({
  // 参加者の友人一覧を取得
  forParticipation: publicProcedure.input(external_exports.object({ participationId: external_exports.number() })).query(async ({ input }) => {
    return getCompanionsForParticipation(input.participationId);
  }),
  // チャレンジの友人一覧を取得
  forChallenge: publicProcedure.input(external_exports.object({ challengeId: external_exports.number() })).query(async ({ input }) => {
    return getCompanionsForChallenge(input.challengeId);
  }),
  // 自分が招待した友人の統計
  myInviteStats: protectedProcedure.query(async ({ ctx }) => {
    return getCompanionInviteStats(ctx.user.id);
  }),
  // 友人を削除
  delete: protectedProcedure.input(external_exports.object({ id: external_exports.number() })).mutation(async ({ ctx, input }) => {
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
init_db2();
var aiRouter = router({
  // AI向けチャレンジ詳細取得（JOINなし・1ホップ）
  getChallenge: publicProcedure.input(external_exports.object({ id: external_exports.number() })).query(async ({ input }) => {
    return getChallengeForAI(input.id);
  }),
  // AI向け検索（意図タグベース）
  searchByTags: publicProcedure.input(external_exports.object({
    tags: external_exports.array(external_exports.string()),
    limit: external_exports.number().optional()
  })).query(async ({ input }) => {
    return searchChallengesForAI(input.tags, input.limit || 20);
  }),
  // チャレンジサマリーを手動更新
  refreshSummary: protectedProcedure.input(external_exports.object({ challengeId: external_exports.number() })).mutation(async ({ input }) => {
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
init_db2();
var devRouter = router({
  // サンプルチャレンジを生成
  generateSampleChallenges: publicProcedure.input(external_exports.object({ count: external_exports.number().min(1).max(20).default(6) })).mutation(async ({ input }) => {
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
    const count3 = Math.min(input.count, sampleChallenges.length);
    for (let i = 0; i < count3; i++) {
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
init_db2();
var ticketTransferRouter = router({
  // 譲渡投稿を作成
  create: protectedProcedure.input(external_exports.object({
    challengeId: external_exports.number(),
    ticketCount: external_exports.number().min(1).max(10).default(1),
    priceType: external_exports.enum(["face_value", "negotiable", "free"]).default("face_value"),
    comment: external_exports.string().max(500).optional(),
    userUsername: external_exports.string().optional()
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
  listByChallenge: publicProcedure.input(external_exports.object({ challengeId: external_exports.number() })).query(async ({ input }) => {
    return getTicketTransfersForChallenge(input.challengeId);
  }),
  // 自分の譲渡投稿一覧を取得
  myTransfers: protectedProcedure.query(async ({ ctx }) => {
    return getTicketTransfersForUser(ctx.user.id);
  }),
  // 譲渡投稿のステータスを更新
  updateStatus: protectedProcedure.input(external_exports.object({
    id: external_exports.number(),
    status: external_exports.enum(["available", "reserved", "completed", "cancelled"])
  })).mutation(async ({ ctx, input }) => {
    await updateTicketTransferStatus(input.id, input.status);
    return { success: true };
  }),
  // 譲渡投稿をキャンセル
  cancel: protectedProcedure.input(external_exports.object({ id: external_exports.number() })).mutation(async ({ ctx, input }) => {
    const result = await cancelTicketTransfer(input.id, ctx.user.id);
    return { success: result };
  })
});

// server/routers/ticket-waitlist.ts
init_db2();
var ticketWaitlistRouter = router({
  // 待機リストに登録
  add: protectedProcedure.input(external_exports.object({
    challengeId: external_exports.number(),
    desiredCount: external_exports.number().min(1).max(10).default(1),
    userUsername: external_exports.string().optional()
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
  remove: protectedProcedure.input(external_exports.object({ challengeId: external_exports.number() })).mutation(async ({ ctx, input }) => {
    const result = await removeFromTicketWaitlist(input.challengeId, ctx.user.id);
    return { success: result };
  }),
  // チャレンジの待機リストを取得
  listByChallenge: publicProcedure.input(external_exports.object({ challengeId: external_exports.number() })).query(async ({ input }) => {
    return getTicketWaitlistForChallenge(input.challengeId);
  }),
  // 自分の待機リストを取得
  myWaitlist: protectedProcedure.query(async ({ ctx }) => {
    return getTicketWaitlistForUser(ctx.user.id);
  }),
  // 待機リストに登録しているかチェック
  isInWaitlist: protectedProcedure.input(external_exports.object({ challengeId: external_exports.number() })).query(async ({ ctx, input }) => {
    return isUserInWaitlist(input.challengeId, ctx.user.id);
  })
});

// server/routers/admin.ts
init_db2();

// server/routers/admin-participations.ts
init_db2();
var adminParticipationsRouter = router({
  // 削除済み参加一覧取得
  listDeleted: protectedProcedure.input(external_exports.object({
    challengeId: external_exports.number().optional(),
    userId: external_exports.number().optional(),
    limit: external_exports.number().optional().default(100)
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
  restore: protectedProcedure.input(external_exports.object({ id: external_exports.number() })).mutation(async ({ ctx, input }) => {
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
  bulkDelete: protectedProcedure.input(external_exports.object({
    challengeId: external_exports.number().optional(),
    userId: external_exports.number().optional()
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
  bulkRestore: protectedProcedure.input(external_exports.object({
    challengeId: external_exports.number().optional(),
    userId: external_exports.number().optional()
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
  getAuditLogs: protectedProcedure.input(external_exports.object({
    entityType: external_exports.string().optional(),
    targetId: external_exports.number().optional(),
    limit: external_exports.number().optional().default(50)
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
  updateUserRole: protectedProcedure.input(external_exports.object({
    userId: external_exports.number(),
    role: external_exports.enum(["user", "admin"])
  })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    await updateUserRole(input.userId, input.role);
    return { success: true };
  }),
  // ユーザー詳細取得
  getUser: protectedProcedure.input(external_exports.object({ userId: external_exports.number() })).query(async ({ ctx, input }) => {
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
  participations: adminParticipationsRouter,
  // APIコスト設定取得
  getApiCostSettings: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    const { getCostSettings: getCostSettings2 } = await Promise.resolve().then(() => (init_api_usage_db(), api_usage_db_exports));
    return getCostSettings2();
  }),
  // APIコスト設定更新
  updateApiCostSettings: protectedProcedure.input(external_exports.object({
    monthlyLimit: external_exports.number().optional(),
    alertThreshold: external_exports.number().optional(),
    alertEmail: external_exports.string().email().nullable().optional(),
    autoStop: external_exports.boolean().optional()
  })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    const { upsertCostSettings: upsertCostSettings2 } = await Promise.resolve().then(() => (init_api_usage_db(), api_usage_db_exports));
    await upsertCostSettings2({
      monthlyLimit: input.monthlyLimit?.toFixed(2),
      alertThreshold: input.alertThreshold?.toFixed(2),
      alertEmail: input.alertEmail ?? void 0,
      autoStop: input.autoStop ? 1 : 0
    });
    return { success: true };
  })
});

// server/routers/stats.ts
init_connection();
init_schema2();
import { eq as eq7, and as and4, gte as gte3, desc as desc5, sql as sql4, count as count2 } from "drizzle-orm";
var statsRouter = router({
  /**
   * ユーザー統計を取得
   */
  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u306B\u63A5\u7D9A\u3067\u304D\u307E\u305B\u3093");
    const userId = ctx.user.id;
    const totalParticipations = await db.select({ count: count2() }).from(participations).where(eq7(participations.userId, userId));
    const completedParticipations = await db.select({ count: count2() }).from(participations).where(eq7(participations.userId, userId));
    const total = totalParticipations[0]?.count || 0;
    const completed = completedParticipations[0]?.count || 0;
    const completionRate = total > 0 ? completed / total * 100 : 0;
    const recentActivity = await db.select({
      id: participations.id,
      challengeId: participations.challengeId,
      createdAt: participations.createdAt,
      updatedAt: participations.updatedAt,
      eventTitle: challenges.title
    }).from(participations).leftJoin(challenges, eq7(participations.challengeId, challenges.id)).where(eq7(participations.userId, userId)).orderBy(desc5(participations.createdAt)).limit(10);
    const sixMonthsAgo = /* @__PURE__ */ new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyStats = await db.select({
      month: sql4`DATE_FORMAT(${participations.createdAt}, '%Y-%m')`,
      count: count2()
    }).from(participations).where(
      and4(
        eq7(participations.userId, userId),
        gte3(participations.createdAt, sixMonthsAgo)
      )
    ).groupBy(sql4`DATE_FORMAT(${participations.createdAt}, '%Y-%m')`).orderBy(sql4`DATE_FORMAT(${participations.createdAt}, '%Y-%m')`);
    const fourWeeksAgo = /* @__PURE__ */ new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const weeklyActivity = await db.select({
      week: sql4`DATE_FORMAT(${participations.createdAt}, '%Y-W%u')`,
      count: count2()
    }).from(participations).where(
      and4(
        eq7(participations.userId, userId),
        gte3(participations.createdAt, fourWeeksAgo)
      )
    ).groupBy(sql4`DATE_FORMAT(${participations.createdAt}, '%Y-W%u')`).orderBy(sql4`DATE_FORMAT(${participations.createdAt}, '%Y-W%u')`);
    return {
      summary: {
        totalChallenges: total,
        completedChallenges: completed,
        completionRate: Math.round(completionRate * 100) / 100
      },
      recentActivity: recentActivity.map((activity) => ({
        id: activity.id,
        eventTitle: activity.eventTitle || "\u4E0D\u660E\u306A\u30A4\u30D9\u30F3\u30C8",
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt
      })),
      monthlyStats: monthlyStats.map((stat) => ({
        month: stat.month,
        count: stat.count
      })),
      weeklyActivity: weeklyActivity.map((activity) => ({
        week: activity.week,
        count: activity.count
      }))
    };
  }),
  /**
   * 管理者統計を取得
   */
  getAdminStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u306B\u63A5\u7D9A\u3067\u304D\u307E\u305B\u3093");
    const totalUsers = await db.select({ count: count2() }).from(users);
    const totalParticipations = await db.select({ count: count2() }).from(participations);
    const completedParticipations = await db.select({ count: count2() }).from(participations);
    const total = totalParticipations[0]?.count || 0;
    const completed = completedParticipations[0]?.count || 0;
    const averageCompletionRate = total > 0 ? completed / total * 100 : 0;
    const topUsers = await db.select({
      userId: participations.userId,
      userName: users.name,
      completedChallenges: count2()
    }).from(participations).leftJoin(users, eq7(participations.userId, users.id)).groupBy(participations.userId, users.name).orderBy(desc5(count2())).limit(10);
    const eventStats = await db.select({
      challengeId: participations.challengeId,
      eventTitle: challenges.title,
      totalAttempts: count2(),
      completedAttempts: count2()
      // 全ての参加を達成とみなす
    }).from(participations).leftJoin(challenges, eq7(participations.challengeId, challenges.id)).groupBy(participations.challengeId, challenges.title).orderBy(desc5(count2()));
    const thirtyDaysAgo = /* @__PURE__ */ new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyActivity = await db.select({
      date: sql4`DATE(${participations.createdAt})`,
      count: count2()
    }).from(participations).where(gte3(participations.createdAt, thirtyDaysAgo)).groupBy(sql4`DATE(${participations.createdAt})`).orderBy(sql4`DATE(${participations.createdAt})`);
    return {
      summary: {
        totalUsers: totalUsers[0]?.count || 0,
        totalChallenges: total,
        averageCompletionRate: Math.round(averageCompletionRate * 100) / 100
      },
      topUsers: topUsers.map((u) => ({
        userId: u.userId,
        name: u.userName || "\u4E0D\u660E\u306A\u30E6\u30FC\u30B6\u30FC",
        completedChallenges: u.completedChallenges
      })),
      eventStats: eventStats.map((s) => ({
        challengeId: s.challengeId,
        eventTitle: s.eventTitle || "\u4E0D\u660E\u306A\u30A4\u30D9\u30F3\u30C8",
        totalAttempts: s.totalAttempts,
        completedAttempts: s.completedAttempts,
        completionRate: s.totalAttempts > 0 ? Math.round(
          s.completedAttempts / s.totalAttempts * 1e4
        ) / 100 : 0
      })),
      dailyActivity: dailyActivity.map((a) => ({
        date: a.date,
        count: a.count
      }))
    };
  })
});

// server/routers/release-notes.ts
init_connection();
init_schema2();
var releaseNotesRouter = router({
  // すべてのリリースノートを取得
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(releaseNotes).orderBy(desc(releaseNotes.date));
  }),
  // 最新のリリースノートを取得
  getLatest: publicProcedure.input(external_exports.object({ limit: external_exports.number().min(1).max(10).default(5) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(releaseNotes).orderBy(desc(releaseNotes.date)).limit(input.limit);
  }),
  // リリースノートを追加（管理者のみ）
  add: protectedProcedure.input(external_exports.object({
    version: external_exports.string(),
    date: external_exports.string(),
    title: external_exports.string(),
    changes: external_exports.array(external_exports.object({
      type: external_exports.enum(["new", "improve", "fix", "change"]),
      text: external_exports.string()
    }))
  })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059");
    }
    const db = await getDb();
    if (!db) {
      throw new Error("\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u63A5\u7D9A\u306B\u5931\u6557\u3057\u307E\u3057\u305F");
    }
    await db.insert(releaseNotes).values(input);
    return { success: true };
  })
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
  admin: adminRouter,
  stats: statsRouter,
  releaseNotes: releaseNotesRouter
});

// server/_core/context.ts
var ADMIN_SESSION_COOKIE = "admin_session";
function parseCookies(cookieHeader) {
  const cookies = /* @__PURE__ */ new Map();
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies.set(name, decodeURIComponent(value));
    }
  });
  return cookies;
}
function hasAdminSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  return cookies.get(ADMIN_SESSION_COOKIE) === "authenticated";
}
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error46) {
    user = null;
  }
  if (!user && hasAdminSession(opts.req)) {
    user = {
      id: 0,
      openId: "admin_password_auth",
      name: "\u7BA1\u7406\u8005\uFF08\u30D1\u30B9\u30EF\u30FC\u30C9\u8A8D\u8A3C\uFF09",
      email: null,
      loginMethod: "password",
      role: "admin",
      gender: "unspecified",
      prefecture: null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      lastSignedIn: /* @__PURE__ */ new Date()
    };
  } else if (user && hasAdminSession(opts.req)) {
    user = {
      ...user,
      role: "admin"
    };
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/index.ts
init_api_usage_tracker();

// server/ai-error-analyzer.ts
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
  const count3 = errorLogs.filter((l) => !l.resolved).length;
  errorLogs.forEach((log) => log.resolved = true);
  return count3;
}
function clearErrorLogs() {
  const count3 = errorLogs.length;
  errorLogs = [];
  return count3;
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
  version: "0027",
  // 最新のマイグレーション番号（api_usage 含む）
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
    },
    // api_usage: X API 使用量記録（0027）
    api_usage: {
      requiredColumns: [
        "id",
        "endpoint",
        "method",
        "success",
        "cost",
        "rateLimitInfo",
        "month",
        "createdAt"
      ]
    },
    // api_cost_settings: コスト上限設定（0027）
    api_cost_settings: {
      requiredColumns: [
        "id",
        "monthlyLimit",
        "alertThreshold",
        "alertEmail",
        "autoStop",
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
          sql`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ${tableName}`
        );
        const raw = columnsResult;
        const rows = Array.isArray(raw) ? raw[0] : raw?.rows ?? raw;
        const existingColumns = new Set(
          rows.map((c) => (c.column_name || c.COLUMN_NAME || "").toLowerCase())
        );
        for (const requiredColumn of tableSpec.requiredColumns) {
          if (!existingColumns.has(requiredColumn.toLowerCase())) {
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
      const migrationsResult = await db.execute(
        sql`SELECT hash FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 1`
      );
      const migRaw = migrationsResult;
      const migRows = Array.isArray(migRaw) ? migRaw[0] : migRaw?.rows ?? migRaw;
      const migList = Array.isArray(migRows) ? migRows : [migRows];
      if (migList.length > 0) {
        result.actualVersion = migList[0].hash?.slice(0, 8) || "unknown";
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
  } catch (error46) {
    result.status = "error";
    result.errors.push(
      `Schema check failed: ${error46 instanceof Error ? error46.message : String(error46)}`
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
  } catch (error46) {
    console.error("[schema-check] Failed to send notification:", error46);
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

// server/_core/sentry.ts
import * as Sentry from "@sentry/node";
var SENTRY_DSN = process.env.SENTRY_DSN;
function initSentry() {
  if (!SENTRY_DSN) {
    console.warn("Sentry DSN not configured. Error tracking is disabled.");
    return;
  }
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
    // Set profilesSampleRate to 1.0 to profile every transaction.
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
    // Gate 1: 3種類の通知のみに絞る（ノイズ抑制）
    beforeSend(event, hint) {
      if (process.env.NODE_ENV === "development") {
        console.log("Sentry event (dev mode):", event);
      }
      const error46 = hint.originalException;
      const message = error46 && typeof error46 === "object" && "message" in error46 ? String(error46.message) : "";
      const statusCode = event.contexts?.response?.status_code;
      const isOAuthError = message.includes("OAuth") || message.includes("callback") || message.includes("state parameter") || event.request?.url?.includes("/api/auth/callback");
      const is5xxError = statusCode && statusCode >= 500 && statusCode < 600;
      const isUnknownVersion = message.includes("unknown version") || event.extra?.version === "unknown";
      if (isOAuthError || is5xxError || isUnknownVersion) {
        return event;
      }
      return null;
    }
  });
  console.log("Sentry initialized for backend");
}

// server/_core/rate-limiter.ts
var rateLimitStore = /* @__PURE__ */ new Map();
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1e3);
var DEFAULT_CONFIG = {
  windowMs: 60 * 1e3,
  // 1分
  maxRequests: 100
  // 100リクエスト
};
var PATH_CONFIGS = {
  "/api/auth": {
    windowMs: 60 * 1e3,
    // 1分
    maxRequests: 5
    // 5リクエスト（ログイン保護）
  },
  "/api/trpc": {
    windowMs: 10 * 1e3,
    // 10秒
    maxRequests: 10
    // 10リクエスト
  }
};
function checkRateLimit(ip, path3) {
  let config2 = DEFAULT_CONFIG;
  for (const [pathPrefix, pathConfig] of Object.entries(PATH_CONFIGS)) {
    if (path3.startsWith(pathPrefix)) {
      config2 = pathConfig;
      break;
    }
  }
  const key = `${ip}:${path3}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetTime < now) {
    const newEntry = {
      count: 1,
      resetTime: now + config2.windowMs
    };
    rateLimitStore.set(key, newEntry);
    return {
      allowed: true,
      remaining: config2.maxRequests - 1,
      resetTime: newEntry.resetTime
    };
  }
  entry.count++;
  if (entry.count > config2.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }
  return {
    allowed: true,
    remaining: config2.maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}
function getClientIp2(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0].split(",") : forwardedFor.split(",");
    const clientIp = ips[0]?.trim();
    if (clientIp && /^[\d.:]+$/.test(clientIp)) {
      return clientIp;
    }
  }
  return req.ip || req.connection?.remoteAddress || "unknown";
}
function rateLimiterMiddleware(req, res, next) {
  const ip = getClientIp2(req);
  const path3 = req.path || req.url;
  const result = checkRateLimit(ip, path3);
  res.setHeader("X-RateLimit-Limit", result.remaining + (result.allowed ? 1 : 0));
  res.setHeader("X-RateLimit-Remaining", result.remaining);
  res.setHeader("X-RateLimit-Reset", new Date(result.resetTime).toISOString());
  if (!result.allowed) {
    console.warn(`[RateLimit] Blocked request from ${ip} to ${path3}`, {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      userAgent: req.headers["user-agent"]?.substring(0, 100)
      // 長すぎる場合は切り詰め
    });
    return res.status(429).json({
      error: "Too many requests",
      message: "\u30EA\u30AF\u30A8\u30B9\u30C8\u304C\u591A\u3059\u304E\u307E\u3059\u3002\u3057\u3070\u3089\u304F\u5F85\u3063\u3066\u304B\u3089\u518D\u8A66\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1e3)
    });
  }
  next();
}

// server/admin-password-auth.ts
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "pass304130";
function verifyAdminPassword(password) {
  return password === ADMIN_PASSWORD;
}

// server/_core/index.ts
var __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
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
function isAllowedOrigin(origin) {
  if (!origin) return false;
  const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (process.env.NODE_ENV !== "production") {
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return true;
    }
  }
  if (ALLOWED_ORIGINS.length > 0) {
    return ALLOWED_ORIGINS.some((allowed) => {
      if (origin === allowed) return true;
      if (allowed.startsWith(".")) {
        try {
          const url2 = new URL(origin);
          return url2.hostname === allowed.slice(1) || url2.hostname.endsWith(allowed);
        } catch {
          return origin.endsWith(allowed) || origin === allowed.slice(1);
        }
      }
      try {
        const originUrl = new URL(origin);
        const allowedUrl = allowed.startsWith("http") ? new URL(allowed) : null;
        if (allowedUrl) {
          return originUrl.origin === allowedUrl.origin;
        } else {
          return originUrl.hostname === allowed || originUrl.hostname.endsWith(`.${allowed}`);
        }
      } catch {
        return origin === allowed || origin.endsWith(allowed);
      }
    });
  }
  try {
    const url2 = new URL(origin);
    const hostname3 = url2.hostname;
    return hostname3 === "doin-challenge.com" || hostname3.endsWith(".doin-challenge.com");
  } catch {
    return origin.includes("doin-challenge.com") && !origin.includes("doin-challenge.com.evil") && !origin.includes("evil-doin-challenge.com");
  }
}
async function startServer() {
  initSentry();
  const app = express();
  const server = createServer(app);
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && isAllowedOrigin(origin)) {
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
  app.use((_req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });
  app.use(rateLimiterMiddleware);
  registerOAuthRoutes(app);
  registerTwitterRoutes(app);
  app.get("/api/health", async (_req, res) => {
    try {
      const buildInfo = readBuildInfo();
      const nodeEnv = process.env.NODE_ENV || "development";
      const displayVersion = APP_VERSION || buildInfo.version || "unknown";
      if (!buildInfo.ok && Sentry) {
        Sentry.captureException(new Error("unknown version in /api/health"), {
          extra: { commitSha: buildInfo.commitSha, env: nodeEnv }
        });
        console.error("[CRITICAL] unknown version detected:", buildInfo);
      }
      const baseInfo = {
        ...buildInfo,
        version: displayVersion,
        // Override/Ensure version is set
        nodeEnv,
        timestamp: Date.now()
      };
      let dbStatus = { connected: false, latency: 0, error: "" };
      try {
        const { getDb: getDb2, sql: sql5 } = await Promise.resolve().then(() => (init_db2(), db_exports));
        const startTime = Date.now();
        const db = await getDb2();
        if (db) {
          try {
            const queryPromise = db.execute(sql5`SELECT 1`);
            const timeoutPromise = new Promise(
              (_, reject) => setTimeout(() => reject(new Error("Query timeout after 10 seconds")), 1e4)
            );
            await Promise.race([queryPromise, timeoutPromise]);
            let challengesCount = 0;
            try {
              const r = await db.execute(sql5`SELECT COUNT(*) AS c FROM challenges WHERE "isPublic" = true`);
              const rows = r?.rows ?? (Array.isArray(r) ? r : []);
              challengesCount = rows.length ? Number(rows[0]?.c ?? 0) : 0;
            } catch (countErr) {
              console.warn("[health] Failed to count challenges:", countErr);
            }
            dbStatus = {
              connected: true,
              latency: Date.now() - startTime,
              error: "",
              challengesCount
            };
          } catch (queryErr) {
            const errorMessage = queryErr instanceof Error ? queryErr.message : String(queryErr);
            const cleanMessage = errorMessage.replace(/\nparam.*$/g, "").replace(/params:.*$/g, "").replace(/Failed query:.*$/g, "\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u30AF\u30A8\u30EA\u306E\u5B9F\u884C\u306B\u5931\u6557\u3057\u307E\u3057\u305F").trim();
            console.error("[health] Database query failed:", {
              error: cleanMessage,
              originalError: errorMessage,
              stack: queryErr instanceof Error ? queryErr.stack : void 0
            });
            dbStatus = {
              connected: false,
              latency: Date.now() - startTime,
              error: cleanMessage || "\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u30AF\u30A8\u30EA\u306E\u5B9F\u884C\u306B\u5931\u6557\u3057\u307E\u3057\u305F"
            };
          }
        } else {
          const hasDatabaseUrl = !!process.env.DATABASE_URL;
          dbStatus.error = hasDatabaseUrl ? "\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u63A5\u7D9A\u306E\u78BA\u7ACB\u306B\u5931\u6557\u3057\u307E\u3057\u305F" : "DATABASE_URL\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093";
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("[health] Unexpected database error:", {
          error: errorMessage,
          stack: err instanceof Error ? err.stack : void 0
        });
        dbStatus.error = errorMessage || "\u63A5\u7D9A\u30A8\u30E9\u30FC";
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
        } catch (error46) {
          console.error("[health] Schema check failed:", error46);
          schemaCheck = {
            status: "error",
            expectedVersion: "unknown",
            missingColumns: [],
            errors: [error46 instanceof Error ? error46.message : String(error46)],
            checkedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
        }
      }
      const overallOk = dbStatus.connected && buildInfo.ok && (!checkCritical || Object.values(criticalApis).every((api) => typeof api === "object" && "ok" in api && api.ok));
      const statusCode = dbStatus.connected ? 200 : 500;
      res.status(statusCode).json({
        ...baseInfo,
        // 後方互換性のため、commitsha（小文字）も含める
        commitsha: baseInfo.commitSha,
        ok: overallOk,
        db: dbStatus,
        ...checkCritical && { critical: criticalApis },
        ...schemaCheck && { schema: schemaCheck }
      });
    } catch (err) {
      console.error("[health] Unhandled error:", err);
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({
        ok: false,
        commitSha: "unknown",
        commitsha: "unknown",
        // 後方互換性のため
        version: "unknown",
        builtAt: "unknown",
        timestamp: Date.now(),
        error: message,
        db: { connected: false, latency: 0, error: message }
      });
    }
  });
  app.get("/api/debug/env", (_req, res) => {
    const maskSecret = (value) => {
      if (!value) return void 0;
      if (value.length <= 8) return "***";
      return value.substring(0, 4) + "***" + value.substring(value.length - 4);
    };
    res.json({
      RAILWAY_GIT_COMMIT_SHA: process.env.RAILWAY_GIT_COMMIT_SHA,
      APP_VERSION: process.env.APP_VERSION,
      GIT_SHA: process.env.GIT_SHA,
      NODE_ENV: process.env.NODE_ENV,
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      RAILWAY_SERVICE_NAME: process.env.RAILWAY_SERVICE_NAME,
      // 機密情報はマスク
      DATABASE_URL: maskSecret(process.env.DATABASE_URL),
      JWT_SECRET: maskSecret(process.env.JWT_SECRET)
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
  app.get("/api/admin/api-usage", async (_req, res) => {
    try {
      const summary = await getDashboardSummary();
      res.json(summary);
    } catch (error46) {
      console.error("[Admin] API usage error:", error46);
      res.status(500).json({ error: "API\u4F7F\u7528\u91CF\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F" });
    }
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
    const success2 = resolveError(req.params.id);
    res.json({ success: success2 });
  });
  app.post("/api/admin/errors/resolve-all", (_req, res) => {
    const count3 = resolveAllErrors();
    res.json({ success: true, count: count3 });
  });
  app.delete("/api/admin/errors", (_req, res) => {
    const count3 = clearErrorLogs();
    res.json({ success: true, count: count3 });
  });
  app.post("/api/admin/verify-password", async (req, res) => {
    try {
      const { password } = req.body;
      if (!password) {
        res.status(400).json({ error: "\u30D1\u30B9\u30EF\u30FC\u30C9\u304C\u5FC5\u8981\u3067\u3059" });
        return;
      }
      if (verifyAdminPassword(password)) {
        const ADMIN_SESSION_COOKIE2 = "admin_session";
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(ADMIN_SESSION_COOKIE2, "authenticated", {
          ...cookieOptions,
          maxAge: SESSION_MAX_AGE_MS
        });
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "\u30D1\u30B9\u30EF\u30FC\u30C9\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093" });
      }
    } catch (error46) {
      console.error("[Admin] Password verification error:", error46);
      res.status(500).json({ error: "\u8A8D\u8A3C\u306B\u5931\u6557\u3057\u307E\u3057\u305F" });
    }
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.SENTRY_DSN) {
    app.use(Sentry.expressErrorHandler());
  }
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
export {
  isAllowedOrigin
};
