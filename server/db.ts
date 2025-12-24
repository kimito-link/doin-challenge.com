import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, challenges, participations, InsertChallenge, InsertParticipation, notificationSettings, notifications, InsertNotificationSetting, InsertNotification, badges, userBadges, pickedComments, InsertBadge, InsertUserBadge, InsertPickedComment, cheers, achievementPages, InsertCheer, InsertAchievementPage, reminders, directMessages, challengeTemplates, InsertReminder, InsertDirectMessage, InsertChallengeTemplate, follows, searchHistory, InsertFollow, InsertSearchHistory, categories, invitations, invitationUses, InsertCategory, InsertInvitation, InsertInvitationUse } from "../drizzle/schema";

// 後方互換性のためのエイリアス
const events = challenges;
type InsertEvent = InsertChallenge;
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== Events ==========

export async function getAllEvents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).where(eq(events.isPublic, true)).orderBy(desc(events.eventDate));
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(events).where(eq(events.id, id));
  return result[0] || null;
}

export async function getEventsByHostUserId(hostUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).where(eq(events.hostUserId, hostUserId)).orderBy(desc(events.eventDate));
}

export async function createEvent(data: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(events).values(data);
  return result[0].insertId;
}

export async function updateEvent(id: number, data: Partial<InsertEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(events).set(data).where(eq(events.id, id));
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(events).where(eq(events.id, id));
}

// ========== Participations ==========

export async function getParticipationsByEventId(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(participations).where(eq(participations.challengeId, eventId)).orderBy(desc(participations.createdAt));
}

export async function getParticipationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(participations).where(eq(participations.userId, userId)).orderBy(desc(participations.createdAt));
}

export async function createParticipation(data: InsertParticipation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(participations).values(data);
  return result[0].insertId;
}

export async function updateParticipation(id: number, data: Partial<InsertParticipation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(participations).set(data).where(eq(participations.id, id));
}

export async function deleteParticipation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(participations).where(eq(participations.id, id));
}

export async function getParticipationCountByEventId(eventId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(participations).where(eq(participations.challengeId, eventId));
  return result.length;
}

export async function getTotalCompanionCountByEventId(eventId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(participations).where(eq(participations.challengeId, eventId));
  return result.reduce((sum, p) => sum + (p.contribution || 1), 0);
}

// 地域別の参加者数を取得
export async function getParticipationsByPrefecture(challengeId: number) {
  const db = await getDb();
  if (!db) return {};
  
  const result = await db.select().from(participations).where(eq(participations.challengeId, challengeId));
  
  const prefectureMap: Record<string, number> = {};
  result.forEach(p => {
    const pref = p.prefecture || "未設定";
    prefectureMap[pref] = (prefectureMap[pref] || 0) + (p.contribution || 1);
  });
  
  return prefectureMap;
}

// 貢献度ランキングを取得
export async function getContributionRanking(challengeId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(participations)
    .where(eq(participations.challengeId, challengeId))
    .orderBy(desc(participations.contribution));
  
  return result.slice(0, limit).map((p, index) => ({
    rank: index + 1,
    displayName: p.displayName,
    username: p.username,
    profileImage: p.profileImage,
    contribution: p.contribution || 1,
    isAnonymous: p.isAnonymous,
  }));
}

// ========== Notification Settings ==========

export async function getNotificationSettings(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId));
  return result[0] || null;
}

export async function upsertNotificationSettings(userId: number, challengeId: number, data: Partial<InsertNotificationSetting>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(notificationSettings)
    .where(and(eq(notificationSettings.userId, userId), eq(notificationSettings.challengeId, challengeId)));
  
  if (existing.length > 0) {
    await db.update(notificationSettings).set(data)
      .where(and(eq(notificationSettings.userId, userId), eq(notificationSettings.challengeId, challengeId)));
  } else {
    await db.insert(notificationSettings).values({ userId, challengeId, ...data });
  }
}

export async function getUsersWithNotificationEnabled(challengeId: number, notificationType: "goal" | "milestone" | "participant") {
  const db = await getDb();
  if (!db) return [];
  
  // チャレンジの通知設定を取得
  const settingsList = await db.select().from(notificationSettings)
    .where(eq(notificationSettings.challengeId, challengeId));
  
  return settingsList.filter(s => {
    if (notificationType === "goal") return s.onGoalReached;
    if (notificationType === "milestone") return s.onMilestone25 || s.onMilestone50 || s.onMilestone75;
    if (notificationType === "participant") return s.onNewParticipant;
    return false;
  });
}

// ========== Notifications ==========

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(data);
  return result[0].insertId;
}

export async function getNotificationsByUserId(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}


// ========== Badges ==========

export async function getAllBadges() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(badges);
}

export async function getBadgeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(badges).where(eq(badges.id, id));
  return result[0] || null;
}

export async function createBadge(data: InsertBadge) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(badges).values(data);
  return result[0].insertId;
}

export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userBadges).where(eq(userBadges.userId, userId)).orderBy(desc(userBadges.earnedAt));
}

export async function getUserBadgesWithDetails(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const userBadgeList = await db.select().from(userBadges).where(eq(userBadges.userId, userId));
  const badgeList = await db.select().from(badges);
  
  return userBadgeList.map(ub => ({
    ...ub,
    badge: badgeList.find(b => b.id === ub.badgeId),
  }));
}

export async function awardBadge(userId: number, badgeId: number, challengeId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 既に持っているかチェック
  const existing = await db.select().from(userBadges)
    .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));
  
  if (existing.length > 0) return null; // 既に持っている
  
  const result = await db.insert(userBadges).values({
    userId,
    badgeId,
    challengeId,
  });
  return result[0].insertId;
}

export async function checkAndAwardBadges(userId: number, challengeId: number, contribution: number) {
  const db = await getDb();
  if (!db) return [];
  
  const badgeList = await db.select().from(badges);
  const awardedBadges: typeof badgeList = [];
  
  // 参加回数をチェック
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

// ========== Picked Comments ==========

export async function getPickedCommentsByChallengeId(challengeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pickedComments).where(eq(pickedComments.challengeId, challengeId)).orderBy(desc(pickedComments.pickedAt));
}

export async function getPickedCommentsWithParticipation(challengeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const picked = await db.select().from(pickedComments).where(eq(pickedComments.challengeId, challengeId));
  const participationList = await db.select().from(participations).where(eq(participations.challengeId, challengeId));
  
  return picked.map(p => ({
    ...p,
    participation: participationList.find(part => part.id === p.participationId),
  }));
}

export async function pickComment(participationId: number, challengeId: number, pickedBy: number, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 既にピックアップされているかチェック
  const existing = await db.select().from(pickedComments)
    .where(eq(pickedComments.participationId, participationId));
  
  if (existing.length > 0) return null; // 既にピックアップ済み
  
  const result = await db.insert(pickedComments).values({
    participationId,
    challengeId,
    pickedBy,
    reason,
  });
  return result[0].insertId;
}

export async function unpickComment(participationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(pickedComments).where(eq(pickedComments.participationId, participationId));
}

export async function markCommentAsUsedInVideo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(pickedComments).set({ isUsedInVideo: true }).where(eq(pickedComments.id, id));
}

export async function isCommentPicked(participationId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(pickedComments).where(eq(pickedComments.participationId, participationId));
  return result.length > 0;
}

// ========== Prefecture Statistics ==========

export async function getPrefectureRanking(challengeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(participations).where(eq(participations.challengeId, challengeId));
  
  const prefectureMap: Record<string, { count: number; contribution: number }> = {};
  result.forEach(p => {
    const pref = p.prefecture || "未設定";
    if (!prefectureMap[pref]) {
      prefectureMap[pref] = { count: 0, contribution: 0 };
    }
    prefectureMap[pref].count += 1;
    prefectureMap[pref].contribution += p.contribution || 1;
  });
  
  return Object.entries(prefectureMap)
    .map(([prefecture, data]) => ({
      prefecture,
      count: data.count,
      contribution: data.contribution,
    }))
    .sort((a, b) => b.contribution - a.contribution);
}

export async function getParticipationsByPrefectureFilter(challengeId: number, prefecture: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (prefecture === "all") {
    return db.select().from(participations).where(eq(participations.challengeId, challengeId)).orderBy(desc(participations.createdAt));
  }
  
  return db.select().from(participations)
    .where(and(eq(participations.challengeId, challengeId), eq(participations.prefecture, prefecture)))
    .orderBy(desc(participations.createdAt));
}

// ========== Cheers (エール) ==========

export async function sendCheer(cheer: InsertCheer) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(cheers).values(cheer);
  return result[0].insertId;
}

export async function getCheersForParticipation(participationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cheers).where(eq(cheers.toParticipationId, participationId)).orderBy(desc(cheers.createdAt));
}

export async function getCheersForChallenge(challengeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cheers).where(eq(cheers.challengeId, challengeId)).orderBy(desc(cheers.createdAt));
}

export async function getCheerCountForParticipation(participationId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(cheers).where(eq(cheers.toParticipationId, participationId));
  return result[0]?.count || 0;
}

export async function getCheersReceivedByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cheers).where(eq(cheers.toUserId, userId)).orderBy(desc(cheers.createdAt));
}

export async function getCheersSentByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cheers).where(eq(cheers.fromUserId, userId)).orderBy(desc(cheers.createdAt));
}

// ========== Achievement Pages (達成記念ページ) ==========

export async function createAchievementPage(page: InsertAchievementPage) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(achievementPages).values(page);
  return result[0].insertId;
}

export async function getAchievementPage(challengeId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(achievementPages).where(eq(achievementPages.challengeId, challengeId));
  return result[0] || null;
}

export async function updateAchievementPage(challengeId: number, updates: Partial<InsertAchievementPage>) {
  const db = await getDb();
  if (!db) return;
  await db.update(achievementPages).set(updates).where(eq(achievementPages.challengeId, challengeId));
}

export async function getPublicAchievementPages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(achievementPages).where(eq(achievementPages.isPublic, true)).orderBy(desc(achievementPages.achievedAt));
}


// ========== Reminders (リマインダー) ==========

export async function createReminder(reminder: InsertReminder) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(reminders).values(reminder);
  return result[0].insertId;
}

export async function getRemindersForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reminders).where(eq(reminders.userId, userId)).orderBy(desc(reminders.createdAt));
}

export async function getRemindersForChallenge(challengeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reminders).where(eq(reminders.challengeId, challengeId)).orderBy(desc(reminders.createdAt));
}

export async function getUserReminderForChallenge(userId: number, challengeId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(reminders).where(and(eq(reminders.userId, userId), eq(reminders.challengeId, challengeId)));
  return result[0] || null;
}

export async function updateReminder(id: number, updates: Partial<InsertReminder>) {
  const db = await getDb();
  if (!db) return;
  await db.update(reminders).set(updates).where(eq(reminders.id, id));
}

export async function deleteReminder(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(reminders).where(eq(reminders.id, id));
}

export async function getPendingReminders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reminders).where(eq(reminders.isSent, false));
}

export async function markReminderAsSent(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(reminders).set({ isSent: true, sentAt: new Date() }).where(eq(reminders.id, id));
}

// ========== Direct Messages (DM) ==========

export async function sendDirectMessage(dm: InsertDirectMessage) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(directMessages).values(dm);
  return result[0].insertId;
}

export async function getDirectMessagesForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(directMessages)
    .where(sql`${directMessages.fromUserId} = ${userId} OR ${directMessages.toUserId} = ${userId}`)
    .orderBy(desc(directMessages.createdAt));
}

export async function getConversation(userId1: number, userId2: number, challengeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(directMessages)
    .where(and(
      eq(directMessages.challengeId, challengeId),
      sql`((${directMessages.fromUserId} = ${userId1} AND ${directMessages.toUserId} = ${userId2}) OR (${directMessages.fromUserId} = ${userId2} AND ${directMessages.toUserId} = ${userId1}))`
    ))
    .orderBy(directMessages.createdAt);
}

export async function getUnreadMessageCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(directMessages)
    .where(and(eq(directMessages.toUserId, userId), eq(directMessages.isRead, false)));
  return result[0]?.count || 0;
}

export async function markMessageAsRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(directMessages).set({ isRead: true, readAt: new Date() }).where(eq(directMessages.id, id));
}

export async function markAllMessagesAsRead(userId: number, fromUserId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(directMessages).set({ isRead: true, readAt: new Date() })
    .where(and(eq(directMessages.toUserId, userId), eq(directMessages.fromUserId, fromUserId)));
}

export async function getConversationList(userId: number) {
  const db = await getDb();
  if (!db) return [];
  // 最新のメッセージを持つ会話相手のリストを取得
  const messages = await db.select().from(directMessages)
    .where(sql`${directMessages.fromUserId} = ${userId} OR ${directMessages.toUserId} = ${userId}`)
    .orderBy(desc(directMessages.createdAt));
  
  // ユニークな会話相手を抽出
  const conversationMap = new Map<string, typeof messages[0]>();
  for (const msg of messages) {
    const partnerId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
    const key = `${partnerId}-${msg.challengeId}`;
    if (!conversationMap.has(key)) {
      conversationMap.set(key, msg);
    }
  }
  
  return Array.from(conversationMap.values());
}

// ========== Challenge Templates (テンプレート) ==========

export async function createChallengeTemplate(template: InsertChallengeTemplate) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(challengeTemplates).values(template);
  return result[0].insertId;
}

export async function getChallengeTemplatesForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(challengeTemplates).where(eq(challengeTemplates.userId, userId)).orderBy(desc(challengeTemplates.createdAt));
}

export async function getPublicChallengeTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(challengeTemplates).where(eq(challengeTemplates.isPublic, true)).orderBy(desc(challengeTemplates.useCount));
}

export async function getChallengeTemplateById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(challengeTemplates).where(eq(challengeTemplates.id, id));
  return result[0] || null;
}

export async function updateChallengeTemplate(id: number, updates: Partial<InsertChallengeTemplate>) {
  const db = await getDb();
  if (!db) return;
  await db.update(challengeTemplates).set(updates).where(eq(challengeTemplates.id, id));
}

export async function deleteChallengeTemplate(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(challengeTemplates).where(eq(challengeTemplates.id, id));
}

export async function incrementTemplateUseCount(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(challengeTemplates).set({ useCount: sql`${challengeTemplates.useCount} + 1` }).where(eq(challengeTemplates.id, id));
}


// ========== Search (検索) ==========

export async function searchChallenges(query: string) {
  const db = await getDb();
  if (!db) return [];
  
  const searchTerm = `%${query}%`;
  return db.select().from(challenges)
    .where(sql`${challenges.title} LIKE ${searchTerm} OR ${challenges.hostName} LIKE ${searchTerm} OR ${challenges.venue} LIKE ${searchTerm} OR ${challenges.description} LIKE ${searchTerm}`)
    .orderBy(desc(challenges.createdAt));
}

export async function saveSearchHistory(history: InsertSearchHistory) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(searchHistory).values(history);
  return result[0].insertId;
}

export async function getSearchHistoryForUser(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(searchHistory)
    .where(eq(searchHistory.userId, userId))
    .orderBy(desc(searchHistory.createdAt))
    .limit(limit);
}

export async function clearSearchHistoryForUser(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(searchHistory).where(eq(searchHistory.userId, userId));
}

// ========== Follows (フォロー) ==========

export async function followUser(follow: InsertFollow) {
  const db = await getDb();
  if (!db) return null;
  
  // 既にフォロー済みかチェック
  const existing = await db.select().from(follows)
    .where(and(eq(follows.followerId, follow.followerId), eq(follows.followeeId, follow.followeeId)));
  
  if (existing.length > 0) return null; // 既にフォロー済み
  
  const result = await db.insert(follows).values(follow);
  return result[0].insertId;
}

export async function unfollowUser(followerId: number, followeeId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followeeId, followeeId)));
}

export async function getFollowersForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(follows).where(eq(follows.followeeId, userId)).orderBy(desc(follows.createdAt));
}

export async function getFollowingForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(follows).where(eq(follows.followerId, userId)).orderBy(desc(follows.createdAt));
}

export async function isFollowing(followerId: number, followeeId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(follows)
    .where(and(eq(follows.followerId, followerId), eq(follows.followeeId, followeeId)));
  return result.length > 0;
}

export async function getFollowerCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(follows).where(eq(follows.followeeId, userId));
  return result[0]?.count || 0;
}

export async function getFollowingCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(follows).where(eq(follows.followerId, userId));
  return result[0]?.count || 0;
}

export async function updateFollowNotification(followerId: number, followeeId: number, notify: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(follows).set({ notifyNewChallenge: notify })
    .where(and(eq(follows.followerId, followerId), eq(follows.followeeId, followeeId)));
}

// ========== Rankings (ランキング) ==========

export async function getGlobalContributionRanking(period: "weekly" | "monthly" | "all" = "all", limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  let dateFilter = sql`1=1`;
  const now = new Date();
  
  if (period === "weekly") {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    dateFilter = sql`${participations.createdAt} >= ${weekAgo}`;
  } else if (period === "monthly") {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    dateFilter = sql`${participations.createdAt} >= ${monthAgo}`;
  }
  
  const result = await db.select({
    userId: participations.userId,
    userName: participations.username,
    userImage: participations.profileImage,
    totalContribution: sql<number>`SUM(${participations.contribution})`,
    participationCount: sql<number>`COUNT(*)`,
  })
    .from(participations)
    .where(dateFilter)
    .groupBy(participations.userId, participations.username, participations.profileImage)
    .orderBy(sql`SUM(${participations.contribution}) DESC`)
    .limit(limit);
  
  return result;
}

export async function getChallengeAchievementRanking(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  // 達成率が高いチャレンジのランキング
  const result = await db.select({
    id: challenges.id,
    title: challenges.title,
    hostName: challenges.hostName,
    goalValue: challenges.goalValue,
    currentValue: challenges.currentValue,
    achievementRate: sql<number>`(${challenges.currentValue} / ${challenges.goalValue}) * 100`,
    eventDate: challenges.eventDate,
  })
    .from(challenges)
    .where(sql`${challenges.goalValue} > 0`)
    .orderBy(sql`(${challenges.currentValue} / ${challenges.goalValue}) DESC`)
    .limit(limit);
  
  return result;
}

export async function getHostRanking(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  // ホスト別のチャレンジ成功率ランキング
  const result = await db.select({
    hostUserId: challenges.hostUserId,
    hostName: challenges.hostName,
    hostProfileImage: challenges.hostProfileImage,
    challengeCount: sql<number>`COUNT(*)`,
    totalParticipants: sql<number>`SUM(${challenges.currentValue})`,
    avgAchievementRate: sql<number>`AVG((${challenges.currentValue} / ${challenges.goalValue}) * 100)`,
  })
    .from(challenges)
    .where(sql`${challenges.goalValue} > 0`)
    .groupBy(challenges.hostUserId, challenges.hostName, challenges.hostProfileImage)
    .orderBy(sql`AVG((${challenges.currentValue} / ${challenges.goalValue}) * 100) DESC`)
    .limit(limit);
  
  return result;
}

export async function getUserRankingPosition(userId: number, period: "weekly" | "monthly" | "all" = "all") {
  const db = await getDb();
  if (!db) return null;
  
  const ranking = await getGlobalContributionRanking(period, 1000);
  const position = ranking.findIndex(r => r.userId === userId);
  
  if (position === -1) return null;
  
  return {
    position: position + 1,
    totalContribution: ranking[position].totalContribution,
    participationCount: ranking[position].participationCount,
  };
}


// ========== Categories (カテゴリ) ==========

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(categories).where(eq(categories.id, id));
  return result[0] || null;
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(categories).where(eq(categories.slug, slug));
  return result[0] || null;
}

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(categories).values(category);
  return result[0].insertId;
}

export async function getChallengesByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(challenges).where(eq(challenges.categoryId, categoryId)).orderBy(desc(challenges.eventDate));
}

// ========== Invitations (招待) ==========

export async function createInvitation(invitation: InsertInvitation) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(invitations).values(invitation);
  return result[0].insertId;
}

export async function getInvitationByCode(code: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(invitations).where(eq(invitations.code, code));
  return result[0] || null;
}

export async function getInvitationsForChallenge(challengeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invitations).where(eq(invitations.challengeId, challengeId)).orderBy(desc(invitations.createdAt));
}

export async function getInvitationsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invitations).where(eq(invitations.inviterId, userId)).orderBy(desc(invitations.createdAt));
}

export async function incrementInvitationUseCount(code: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(invitations).set({ useCount: sql`${invitations.useCount} + 1` }).where(eq(invitations.code, code));
}

export async function deactivateInvitation(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(invitations).set({ isActive: false }).where(eq(invitations.id, id));
}

export async function recordInvitationUse(use: InsertInvitationUse) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(invitationUses).values(use);
  return result[0].insertId;
}

export async function getInvitationUses(invitationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invitationUses).where(eq(invitationUses.invitationId, invitationId)).orderBy(desc(invitationUses.createdAt));
}

export async function getInvitationStats(invitationId: number) {
  const db = await getDb();
  if (!db) return { useCount: 0, participationCount: 0 };
  
  const uses = await db.select({ count: sql<number>`count(*)` }).from(invitationUses).where(eq(invitationUses.invitationId, invitationId));
  const participations_count = await db.select({ count: sql<number>`count(*)` }).from(invitationUses)
    .where(and(eq(invitationUses.invitationId, invitationId), sql`${invitationUses.participationId} IS NOT NULL`));
  
  return {
    useCount: uses[0]?.count || 0,
    participationCount: participations_count[0]?.count || 0,
  };
}

// ========== User Profile (公開プロフィール) ==========

export async function getUserPublicProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  // ユーザー情報
  const userResult = await db.select().from(users).where(eq(users.id, userId));
  if (userResult.length === 0) return null;
  const user = userResult[0];
  
  // 参加履歴
  const participationList = await db.select().from(participations).where(eq(participations.userId, userId)).orderBy(desc(participations.createdAt));
  
  // 獲得バッジ
  const badgeList = await db.select().from(userBadges).where(eq(userBadges.userId, userId)).orderBy(desc(userBadges.earnedAt));
  const badgeIds = badgeList.map(b => b.badgeId);
  const badgeDetails = badgeIds.length > 0 ? await db.select().from(badges).where(sql`${badges.id} IN (${badgeIds.join(",")})`) : [];
  
  // 統計
  const totalContribution = participationList.reduce((sum, p) => sum + (p.contribution || 1), 0);
  const challengeIds = [...new Set(participationList.map(p => p.challengeId))];
  
  // 主催チャレンジ数
  const hostedChallenges = await db.select({ count: sql<number>`count(*)` }).from(challenges).where(eq(challenges.hostUserId, userId));
  
  return {
    user: {
      id: user.id,
      name: user.name,
      createdAt: user.createdAt,
    },
    stats: {
      totalContribution,
      participationCount: participationList.length,
      challengeCount: challengeIds.length,
      hostedCount: hostedChallenges[0]?.count || 0,
      badgeCount: badgeList.length,
    },
    recentParticipations: participationList.slice(0, 10),
    badges: badgeDetails,
  };
}
