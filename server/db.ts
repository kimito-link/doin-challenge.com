import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, challenges, participations, InsertChallenge, InsertParticipation, notificationSettings, notifications, InsertNotificationSetting, InsertNotification, badges, userBadges, pickedComments, InsertBadge, InsertUserBadge, InsertPickedComment } from "../drizzle/schema";

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
