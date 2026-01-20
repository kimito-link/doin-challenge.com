import { eq, desc, and, sql, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, challenges, participations, InsertChallenge, InsertParticipation, notificationSettings, notifications, InsertNotificationSetting, InsertNotification, badges, userBadges, pickedComments, InsertBadge, InsertUserBadge, InsertPickedComment, cheers, achievementPages, InsertCheer, InsertAchievementPage, reminders, directMessages, challengeTemplates, InsertReminder, InsertDirectMessage, InsertChallengeTemplate, follows, searchHistory, InsertFollow, InsertSearchHistory, categories, invitations, invitationUses, InsertCategory, InsertInvitation, InsertInvitationUse, participationCompanions, InsertParticipationCompanion, favoriteArtists, InsertFavoriteArtist } from "../drizzle/schema";

// 後方互換性のためのエイリアス
const events = challenges;
type InsertEvent = InsertChallenge;
import { ENV } from "./_core/env";

// URL用のスラッグを生成する関数
export function generateSlug(title: string): string {
  // 日本語のタイトルをローマ字に変換し、URLフレンドリーなスラッグを作成
  // 例: "生誕祭ライブ 動員100人チャレンジ" -> "birthday-live-100"
  
  // 日本語のキーワードを英語に変換
  const translations: Record<string, string> = {
    '生誕祭': 'birthday',
    'ライブ': 'live',
    'ワンマン': 'oneman',
    '動員': 'attendance',
    'チャレンジ': 'challenge',
    'フォロワー': 'followers',
    '同時視聴': 'viewers',
    '配信': 'stream',
    'グループ': 'group',
    'ソロ': 'solo',
    'フェス': 'fes',
    '対バン': 'taiban',
    'ファンミーティング': 'fanmeeting',
    'リリース': 'release',
    'イベント': 'event',
    '人': '',
    '万': '0000',
  };
  
  let slug = title.toLowerCase();
  
  // 日本語キーワードを英語に変換
  for (const [jp, en] of Object.entries(translations)) {
    slug = slug.replace(new RegExp(jp, 'g'), en);
  }
  
  // 英字と数字のみを抽出し、ハイフンで結合
  const words = slug.match(/[a-z]+|\d+/g) || [];
  slug = words.join('-');
  
  // 連続ハイフンを単一に
  slug = slug.replace(/-+/g, '-');
  
  // 先頭と末尾のハイフンを削除
  slug = slug.replace(/^-|-$/g, '');
  
  // 空の場合はタイムスタンプを使用
  if (!slug) {
    slug = `challenge-${Date.now()}`;
  }
  
  return slug;
}

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // TiDB CloudはSSL接続が必須
      // DATABASE_URLにsslパラメータがない場合は自動で追加
      let connectionUrl = process.env.DATABASE_URL;
      if (connectionUrl && !connectionUrl.includes('ssl=')) {
        const separator = connectionUrl.includes('?') ? '&' : '?';
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

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.lastSignedIn));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) return false;
  await db.update(users).set({ role }).where(eq(users.id, userId));
  return true;
}

// ========== Events ==========

// サーバーサイドメモリキャッシュ（パフォーマンス最適化）
let eventsCache: { data: any[] | null; timestamp: number } = { data: null, timestamp: 0 };
const EVENTS_CACHE_TTL = 30 * 1000; // 30秒

export async function getAllEvents() {
  const now = Date.now();
  
  // キャッシュが有効なら即座に返す
  if (eventsCache.data && (now - eventsCache.timestamp) < EVENTS_CACHE_TTL) {
    return eventsCache.data;
  }
  
  const db = await getDb();
  if (!db) return eventsCache.data ?? [];
  
  const result = await db.select().from(events).where(eq(events.isPublic, true)).orderBy(desc(events.eventDate));
  
  // キャッシュを更新
  eventsCache = { data: result, timestamp: now };
  
  return result;
}

// キャッシュを無効化（イベント作成/更新/削除時に呼び出す）
export function invalidateEventsCache() {
  eventsCache = { data: null, timestamp: 0 };
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

export async function getEventsByHostTwitterId(hostTwitterId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).where(eq(events.hostTwitterId, hostTwitterId)).orderBy(desc(events.eventDate));
}

export async function createEvent(data: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // TiDBのdefaultキーワード問題を回避するため、raw SQLを使用
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const eventDate = data.eventDate ? new Date(data.eventDate).toISOString().slice(0, 19).replace('T', ' ') : now;
  
  // slugを生成（タイトルからスラッグを作成）
  const slug = data.slug || generateSlug(data.title);
  
  // ticketSaleStartの処理
  const ticketSaleStart = data.ticketSaleStart ? new Date(data.ticketSaleStart).toISOString().slice(0, 19).replace('T', ' ') : null;
  
  // AI関連カラム（aiSummary, intentTags, regionSummary, participantSummary, aiSummaryUpdatedAt）は
  // 本番DBに存在しない可能性があるため、INSERTから除外
  // slugカラムも本番DBに存在しないため除外（2024年1月修正）
  // これらのカラムは後から追加する場合は、マイグレーションを実行してから使用する
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
      ${data.goalType ?? 'attendance'},
      ${data.goalValue ?? 100},
      ${data.goalUnit ?? '人'},
      ${data.currentValue ?? 0},
      ${data.eventType ?? 'solo'},
      ${data.categoryId ?? null},
      ${eventDate},
      ${data.venue ?? null},
      ${data.prefecture ?? null},
      ${data.ticketPresale ?? null},
      ${data.ticketDoor ?? null},
      ${ticketSaleStart},
      ${data.ticketUrl ?? null},
      ${data.externalUrl ?? null},
      ${data.status ?? 'active'},
      ${data.isPublic ?? true},
      ${now},
      ${now}
    )
  `);
  
  invalidateEventsCache(); // キャッシュを無効化
  return (result[0] as any).insertId;
}

export async function updateEvent(id: number, data: Partial<InsertEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(events).set(data).where(eq(events.id, id));
  invalidateEventsCache(); // キャッシュを無効化
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(events).where(eq(events.id, id));
  invalidateEventsCache(); // キャッシュを無効化
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

export async function getParticipationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(participations).where(eq(participations.id, id));
  return result[0] || null;
}

export async function createParticipation(data: InsertParticipation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(participations).values(data);
  const participationId = result[0].insertId;
  
  // challengesのcurrentValueを更新（参加者数 + 同伴者数）
  if (data.challengeId) {
    const contribution = (data.contribution || 1) + (data.companionCount || 0);
    await db.update(challenges)
      .set({ currentValue: sql`${challenges.currentValue} + ${contribution}` })
      .where(eq(challenges.id, data.challengeId));
    invalidateEventsCache();
  }
  
  return participationId;
}

export async function updateParticipation(id: number, data: Partial<InsertParticipation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(participations).set(data).where(eq(participations.id, id));
}

export async function deleteParticipation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 削除前に参加情報を取得
  const participation = await db.select().from(participations).where(eq(participations.id, id));
  const p = participation[0];
  
  await db.delete(participations).where(eq(participations.id, id));
  
  // challengesのcurrentValueを減少
  if (p && p.challengeId) {
    const contribution = (p.contribution || 1) + (p.companionCount || 0);
    await db.update(challenges)
      .set({ currentValue: sql`GREATEST(${challenges.currentValue} - ${contribution}, 0)` })
      .where(eq(challenges.id, p.challengeId));
    invalidateEventsCache();
  }
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
    userId: p.userId,
    displayName: p.displayName,
    username: p.username,
    profileImage: p.profileImage,
    contribution: p.contribution || 1,
    followersCount: p.followersCount || 0,
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

// フォロワーバッジを付与
export async function awardFollowerBadge(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  // フォロワーバッジを取得（なければ作成）
  let followerBadge = await db.select().from(badges).where(eq(badges.conditionType, "follower_badge"));
  
  if (followerBadge.length === 0) {
    // フォロワーバッジを作成
    const result = await db.insert(badges).values({
      name: "💜 公式フォロワー",
      description: "ホストをフォローして応援しています！",
      type: "special",
      conditionType: "follower_badge",
    });
    followerBadge = await db.select().from(badges).where(eq(badges.id, result[0].insertId));
  }
  
  if (followerBadge.length === 0) return null;
  
  // バッジを付与
  return awardBadge(userId, followerBadge[0].id);
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
  
  // フォロワーバッジを付与
  await awardFollowerBadge(follow.followerId);
  
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
  // フォロワーの情報を取得（フォロワーのプロフィール画像も含む）
  const result = await db.select().from(follows).where(eq(follows.followeeId, userId)).orderBy(desc(follows.createdAt));
  
  // 各フォロワーのプロフィール画像を取得
  const followersWithImages = await Promise.all(result.map(async (f) => {
    // フォロワーの最新の参加情報からプロフィール画像を取得
    const latestParticipation = await db.select({ profileImage: participations.profileImage })
      .from(participations)
      .where(eq(participations.userId, f.followerId))
      .orderBy(desc(participations.createdAt))
      .limit(1);
    
    return {
      ...f,
      followerImage: latestParticipation[0]?.profileImage || null,
    };
  }));
  
  return followersWithImages;
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

// 特定ユーザーのフォロワーID一覧を取得（ランキング優先表示用）
export async function getFollowerIdsForUser(userId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({ followerId: follows.followerId }).from(follows).where(eq(follows.followeeId, userId));
  return result.map(r => r.followerId);
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

// カテゴリキャッシュ（カテゴリはあまり変更されないので長めのTTL）
let categoriesCache: { data: any[] | null; timestamp: number } = { data: null, timestamp: 0 };
const CATEGORIES_CACHE_TTL = 5 * 60 * 1000; // 5分

export async function getAllCategories() {
  const now = Date.now();
  
  // キャッシュが有効なら即座に返す
  if (categoriesCache.data && (now - categoriesCache.timestamp) < CATEGORIES_CACHE_TTL) {
    return categoriesCache.data;
  }
  
  const db = await getDb();
  if (!db) return categoriesCache.data ?? [];
  
  const result = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder);
  
  // キャッシュを更新
  categoriesCache = { data: result, timestamp: now };
  
  return result;
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

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(categories).set(data).where(eq(categories.id, id));
  return getCategoryById(id);
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(categories).where(eq(categories.id, id));
  return true;
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
  
  // 参加履歴（チャレンジ情報も含む）
  const participationList = await db
    .select({
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
      challengeCategoryId: challenges.categoryId,
    })
    .from(participations)
    .innerJoin(challenges, eq(participations.challengeId, challenges.id))
    .where(eq(participations.userId, userId))
    .orderBy(desc(participations.createdAt));
  
  // 獲得バッジ
  const badgeList = await db.select().from(userBadges).where(eq(userBadges.userId, userId)).orderBy(desc(userBadges.earnedAt));
  const badgeIds = badgeList.map(b => b.badgeId);
  const badgeDetails = badgeIds.length > 0 ? await db.select().from(badges).where(sql`${badges.id} IN (${badgeIds.join(",")})`) : [];
  
  // 統計
  const totalContribution = participationList.reduce((sum, p) => sum + (p.contribution || 1), 0);
  const challengeIds = [...new Set(participationList.map(p => p.challengeId))];
  
  // カテゴリ別の参加数を集計
  const categoryStats: Record<number, number> = {};
  participationList.forEach(p => {
    const categoryId = p.challengeCategoryId || 0;
    categoryStats[categoryId] = (categoryStats[categoryId] || 0) + 1;
  });
  
  // 主催チャレンジ数
  const hostedChallenges = await db.select({ count: sql<number>`count(*)` }).from(challenges).where(eq(challenges.hostUserId, userId));
  
  // 最新の参加情報からプロフィール情報を取得
  const latestParticipation = participationList[0];
  
  return {
    user: {
      id: user.id,
      name: user.name || latestParticipation?.displayName || "ユーザー",
      username: latestParticipation?.username || null,
      profileImage: latestParticipation?.profileImage || null,
      createdAt: user.createdAt,
    },
    stats: {
      totalContribution,
      participationCount: participationList.length,
      challengeCount: challengeIds.length,
      hostedCount: hostedChallenges[0]?.count || 0,
      badgeCount: badgeList.length,
    },
    categoryStats,
    participations: participationList,
    badges: badgeDetails,
  };
}


// ========== おすすめホスト（同じカテゴリのチャレンジを開催しているホスト） ==========

export async function getRecommendedHosts(userId?: number, categoryId?: number, limit: number = 5) {
  const db = await getDb();
  if (!db) return [];
  
  // チャレンジを開催しているホストを取得
  const allChallenges = await db.select({
    hostUserId: challenges.hostUserId,
    hostName: challenges.hostName,
    hostUsername: challenges.hostUsername,
    hostProfileImage: challenges.hostProfileImage,
    categoryId: challenges.categoryId,
  }).from(challenges)
    .where(challenges.hostUserId ? ne(challenges.hostUserId, userId || 0) : undefined)
    .orderBy(desc(challenges.eventDate));
  
  // ホストごとにチャレンジ数を集計
  const hostMap = new Map<number, {
    hostUserId: number;
    hostName: string | null;
    hostUsername: string | null;
    hostProfileImage: string | null;
    challengeCount: number;
    categoryIds: Set<number>;
  }>();
  
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
        categoryIds: c.categoryId ? new Set([c.categoryId]) : new Set(),
      });
    }
  }
  
  // カテゴリが指定されている場合、そのカテゴリのホストを優先
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
  
  return hosts.slice(0, limit).map(h => ({
    userId: h.hostUserId,
    name: h.hostName,
    username: h.hostUsername,
    profileImage: h.hostProfileImage,
    challengeCount: h.challengeCount,
  }));
}

// ========== Participation Companions (一緒に参加する友人) ==========

export async function createCompanion(companion: InsertParticipationCompanion) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(participationCompanions).values(companion);
  return result[0].insertId;
}

export async function createCompanions(companions: InsertParticipationCompanion[]) {
  const db = await getDb();
  if (!db) return [];
  if (companions.length === 0) return [];
  const result = await db.insert(participationCompanions).values(companions);
  return result;
}

export async function getCompanionsForParticipation(participationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(participationCompanions).where(eq(participationCompanions.participationId, participationId)).orderBy(participationCompanions.createdAt);
}

export async function getCompanionsForChallenge(challengeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(participationCompanions).where(eq(participationCompanions.challengeId, challengeId)).orderBy(desc(participationCompanions.createdAt));
}

export async function deleteCompanion(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(participationCompanions).where(eq(participationCompanions.id, id));
}

export async function deleteCompanionsForParticipation(participationId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(participationCompanions).where(eq(participationCompanions.participationId, participationId));
}

// 友人の招待実績を取得
export async function getCompanionInviteStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalInvited: 0, companions: [] };
  
  const companions = await db.select().from(participationCompanions).where(eq(participationCompanions.invitedByUserId, userId)).orderBy(desc(participationCompanions.createdAt));
  
  return {
    totalInvited: companions.length,
    companions,
  };
}

// ========== AI向け最適化（1ホップ取得・非正規化サマリー） ==========

/**
 * チャレンジのAIサマリーを更新する
 * 参加者追加・メッセージ追加時に非同期で呼び出される
 */
export async function refreshChallengeSummary(challengeId: number) {
  const db = await getDb();
  if (!db) return;

  try {
    // 1. 参加者数と地域分布を取得
    const participationData = await db.select({
      prefecture: participations.prefecture,
      count: sql<number>`COUNT(*)`,
    })
      .from(participations)
      .where(eq(participations.challengeId, challengeId))
      .groupBy(participations.prefecture);

    const regionSummary: Record<string, number> = {};
    let totalCount = 0;
    participationData.forEach(row => {
      if (row.prefecture) {
        regionSummary[row.prefecture] = row.count;
      }
      totalCount += row.count;
    });

    // 2. 上位貢献者を取得
    const topContributors = await db.select({
      name: participations.displayName,
      contribution: participations.contribution,
      message: participations.message,
    })
      .from(participations)
      .where(eq(participations.challengeId, challengeId))
      .orderBy(desc(participations.contribution))
      .limit(5);

    // 3. 最新メッセージを取得
    const recentMessages = await db.select({
      name: participations.displayName,
      message: participations.message,
      createdAt: participations.createdAt,
    })
      .from(participations)
      .where(and(
        eq(participations.challengeId, challengeId),
        sql`${participations.message} IS NOT NULL AND ${participations.message} != ''`
      ))
      .orderBy(desc(participations.createdAt))
      .limit(5);

    // 4. 最も盛り上がっている地域を特定
    let hotRegion: string | undefined;
    let maxCount = 0;
    Object.entries(regionSummary).forEach(([region, count]) => {
      if (count > maxCount) {
        maxCount = count;
        hotRegion = region;
      }
    });

    // 5. 参加者サマリーを構築
    const participantSummary = {
      totalCount,
      topContributors: topContributors.map(c => ({
        name: c.name,
        contribution: c.contribution,
        message: c.message || undefined,
      })),
      recentMessages: recentMessages.map(m => ({
        name: m.name,
        message: m.message || "",
        createdAt: m.createdAt.toISOString(),
      })),
      hotRegion,
    };

    // 6. チャレンジ情報を取得してAIサマリーを生成
    const challenge = await db.select().from(challenges).where(eq(challenges.id, challengeId)).limit(1);
    if (!challenge[0]) return;

    const c = challenge[0];
    const progressPercent = c.goalValue > 0 ? Math.round((c.currentValue / c.goalValue) * 100) : 0;
    const daysUntilEvent = Math.ceil((new Date(c.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    // AIが理解しやすい自然言語サマリーを生成
    let aiSummary = `【${c.title}】${c.hostName}主催の${c.eventType === "group" ? "グループ" : "ソロ"}イベント。`;
    aiSummary += `目標${c.goalValue}${c.goalUnit}に対して現在${c.currentValue}${c.goalUnit}（達成率${progressPercent}%）。`;
    
    if (daysUntilEvent > 0) {
      aiSummary += `開催まで残り${daysUntilEvent}日。`;
    } else if (daysUntilEvent === 0) {
      aiSummary += `本日開催！`;
    } else {
      aiSummary += `イベント終了済み。`;
    }

    if (totalCount > 0) {
      aiSummary += `${totalCount}名が参加表明。`;
      if (hotRegion) {
        aiSummary += `${hotRegion}からの参加が最多（${regionSummary[hotRegion]}名）。`;
      }
    }

    if (recentMessages.length > 0) {
      aiSummary += `最新の応援：「${recentMessages[0].message}」（${recentMessages[0].name}）`;
    }

    // 7. 意図タグを生成
    const intentTags: string[] = [];
    intentTags.push(c.eventType === "group" ? "グループ" : "ソロ");
    intentTags.push(c.goalType);
    if (progressPercent >= 100) intentTags.push("達成済み");
    else if (progressPercent >= 80) intentTags.push("もうすぐ達成");
    else if (progressPercent >= 50) intentTags.push("順調");
    else intentTags.push("応援募集中");
    if (daysUntilEvent <= 7 && daysUntilEvent > 0) intentTags.push("直前");
    if (daysUntilEvent === 0) intentTags.push("本日開催");
    if (hotRegion) intentTags.push(hotRegion);

    // 8. データベースを更新
    await db.update(challenges).set({
      aiSummary,
      intentTags,
      regionSummary,
      participantSummary,
      aiSummaryUpdatedAt: new Date(),
    }).where(eq(challenges.id, challengeId));

  } catch (error) {
    console.error("[AI Summary] Failed to refresh challenge summary:", error);
  }
}

/**
 * AI向け1ホップ取得API
 * JOINなしでチャレンジの全情報を取得
 */
export async function getChallengeForAI(challengeId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(challenges).where(eq(challenges.id, challengeId)).limit(1);
  if (!result[0]) return null;

  const c = result[0];
  
  // サマリーが古い場合は再計算をトリガー（非同期）
  const summaryAge = c.aiSummaryUpdatedAt 
    ? Date.now() - new Date(c.aiSummaryUpdatedAt).getTime()
    : Infinity;
  
  if (summaryAge > 5 * 60 * 1000) { // 5分以上古い場合
    // 非同期で更新（レスポンスはブロックしない）
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
    progressPercent: c.goalValue > 0 ? Math.round((c.currentValue / c.goalValue) * 100) : 0,
    
    // AI向け非正規化データ（1ホップで取得可能）
    aiSummary: c.aiSummary,
    intentTags: c.intentTags,
    regionSummary: c.regionSummary,
    participantSummary: c.participantSummary,
    aiSummaryUpdatedAt: c.aiSummaryUpdatedAt,
  };
}

/**
 * AI向け検索（意図タグベース）
 */
export async function searchChallengesForAI(tags: string[], limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  // 全チャレンジを取得してタグでフィルタリング
  const allChallenges = await db.select().from(challenges).where(eq(challenges.isPublic, true)).limit(100);
  
  const scored = allChallenges.map(c => {
    const challengeTags = c.intentTags || [];
    const matchCount = tags.filter(t => challengeTags.includes(t)).length;
    return { challenge: c, score: matchCount };
  });

  // スコア順にソート
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(s => ({
    id: s.challenge.id,
    title: s.challenge.title,
    hostName: s.challenge.hostName,
    aiSummary: s.challenge.aiSummary,
    intentTags: s.challenge.intentTags,
    matchScore: s.score,
    progressPercent: s.challenge.goalValue > 0 
      ? Math.round((s.challenge.currentValue / s.challenge.goalValue) * 100) 
      : 0,
  }));
}

/**
 * 全チャレンジのAIサマリーを一括更新（バッチ処理用）
 */
export async function refreshAllChallengeSummaries() {
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



// ========== Ticket Transfers (チケット譲渡) ==========

import { ticketTransfers, ticketWaitlist, InsertTicketTransfer, InsertTicketWaitlist } from "../drizzle/schema";

// 譲渡投稿を作成
export async function createTicketTransfer(transfer: InsertTicketTransfer) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(ticketTransfers).values(transfer);
  return result[0].insertId;
}

// 譲渡投稿を取得（チャレンジ別）
export async function getTicketTransfersForChallenge(challengeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ticketTransfers)
    .where(and(
      eq(ticketTransfers.challengeId, challengeId),
      eq(ticketTransfers.status, "available")
    ))
    .orderBy(desc(ticketTransfers.createdAt));
}

// 譲渡投稿を取得（ユーザー別）
export async function getTicketTransfersForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ticketTransfers)
    .where(eq(ticketTransfers.userId, userId))
    .orderBy(desc(ticketTransfers.createdAt));
}

// 譲渡投稿のステータスを更新
export async function updateTicketTransferStatus(id: number, status: "available" | "reserved" | "completed" | "cancelled") {
  const db = await getDb();
  if (!db) return;
  await db.update(ticketTransfers).set({ status }).where(eq(ticketTransfers.id, id));
}

// 譲渡投稿を削除（キャンセル）
export async function cancelTicketTransfer(id: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.update(ticketTransfers)
    .set({ status: "cancelled" })
    .where(and(eq(ticketTransfers.id, id), eq(ticketTransfers.userId, userId)));
  return true;
}

// ========== Ticket Waitlist (チケット待機リスト) ==========

// 待機リストに登録
export async function addToTicketWaitlist(waitlist: InsertTicketWaitlist) {
  const db = await getDb();
  if (!db) return null;
  
  // 既に登録済みかチェック
  const existing = await db.select().from(ticketWaitlist)
    .where(and(
      eq(ticketWaitlist.challengeId, waitlist.challengeId),
      eq(ticketWaitlist.userId, waitlist.userId),
      eq(ticketWaitlist.isActive, true)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0].id; // 既に登録済み
  }
  
  const result = await db.insert(ticketWaitlist).values(waitlist);
  return result[0].insertId;
}

// 待機リストから削除
export async function removeFromTicketWaitlist(challengeId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.update(ticketWaitlist)
    .set({ isActive: false })
    .where(and(
      eq(ticketWaitlist.challengeId, challengeId),
      eq(ticketWaitlist.userId, userId)
    ));
  return true;
}

// 待機リストを取得（チャレンジ別）
export async function getTicketWaitlistForChallenge(challengeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ticketWaitlist)
    .where(and(
      eq(ticketWaitlist.challengeId, challengeId),
      eq(ticketWaitlist.isActive, true)
    ))
    .orderBy(ticketWaitlist.createdAt);
}

// 待機リストを取得（ユーザー別）
export async function getTicketWaitlistForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ticketWaitlist)
    .where(and(
      eq(ticketWaitlist.userId, userId),
      eq(ticketWaitlist.isActive, true)
    ))
    .orderBy(desc(ticketWaitlist.createdAt));
}

// ユーザーが待機リストに登録しているかチェック
export async function isUserInWaitlist(challengeId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(ticketWaitlist)
    .where(and(
      eq(ticketWaitlist.challengeId, challengeId),
      eq(ticketWaitlist.userId, userId),
      eq(ticketWaitlist.isActive, true)
    ))
    .limit(1);
  return result.length > 0;
}

// 待機者に通知を送る（新しい譲渡投稿があった時）
export async function getWaitlistUsersForNotification(challengeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ticketWaitlist)
    .where(and(
      eq(ticketWaitlist.challengeId, challengeId),
      eq(ticketWaitlist.isActive, true),
      eq(ticketWaitlist.notifyOnNew, true)
    ));
}

// ========== 参加キャンセル ==========

// 参加をキャンセル
export async function cancelParticipation(participationId: number, userId: number) {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };
  
  // 参加情報を取得
  const participation = await db.select().from(participations)
    .where(and(
      eq(participations.id, participationId),
      eq(participations.userId, userId)
    ))
    .limit(1);
  
  if (participation.length === 0) {
    return { success: false, error: "Participation not found" };
  }
  
  const p = participation[0];
  
  // 参加を削除
  await db.delete(participations).where(eq(participations.id, participationId));
  
  // 同伴者も削除
  await db.delete(participationCompanions).where(eq(participationCompanions.participationId, participationId));
  
  // チャレンジの現在値を更新
  await db.update(challenges)
    .set({ currentValue: sql`${challenges.currentValue} - ${p.contribution}` })
    .where(eq(challenges.id, p.challengeId));
  
  return { success: true, challengeId: p.challengeId, contribution: p.contribution };
}


// ========== 推し活状況 (Oshikatsu Stats) ==========

/**
 * ユーザーの推し活状況を取得
 * @param userId ユーザーID（オプション）
 * @param twitterId TwitterID（オプション）
 */
export async function getOshikatsuStats(userId?: number, twitterId?: string) {
  const db = await getDb();
  if (!db) return null;
  
  if (!userId && !twitterId) return null;
  
  // 参加履歴を取得
  let participationList;
  if (userId) {
    participationList = await db.select({
      id: participations.id,
      challengeId: participations.challengeId,
      contribution: participations.contribution,
      createdAt: participations.createdAt,
    })
      .from(participations)
      .where(eq(participations.userId, userId))
      .orderBy(desc(participations.createdAt))
      .limit(20);
  } else if (twitterId) {
    participationList = await db.select({
      id: participations.id,
      challengeId: participations.challengeId,
      contribution: participations.contribution,
      createdAt: participations.createdAt,
    })
      .from(participations)
      .where(eq(participations.twitterId, twitterId))
      .orderBy(desc(participations.createdAt))
      .limit(20);
  } else {
    return null;
  }
  
  if (participationList.length === 0) {
    return {
      totalParticipations: 0,
      totalContribution: 0,
      recentChallenges: [],
    };
  }
  
  // 統計を計算
  const totalParticipations = participationList.length;
  const totalContribution = participationList.reduce((sum, p) => sum + (p.contribution || 1), 0);
  
  // チャレンジ情報を取得
  const challengeIds = [...new Set(participationList.map(p => p.challengeId))];
  const challengeList = await db.select({
    id: challenges.id,
    title: challenges.title,
    hostName: challenges.hostName,
  })
    .from(challenges)
    .where(sql`${challenges.id} IN (${sql.join(challengeIds.map(id => sql`${id}`), sql`, `)})`);
  
  const challengeMap = new Map(challengeList.map(c => [c.id, c]));
  
  // 最近の参加チャレンジを構築
  const recentChallenges = participationList.slice(0, 5).map(p => {
    const challenge = challengeMap.get(p.challengeId);
    return {
      id: p.challengeId,
      title: challenge?.title || "不明なチャレンジ",
      targetName: challenge?.hostName || "",
      participatedAt: p.createdAt.toISOString(),
    };
  });
  
  return {
    totalParticipations,
    totalContribution,
    recentChallenges,
  };
}


// ========== データ整合性確認・修復 ==========

/**
 * チャレンジのcurrentValueを再計算して修正
 * 参加者テーブルから実際の数を集計してcurrentValueを更新
 */
export async function recalculateChallengeCurrentValues() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 全チャレンジを取得
  const allChallenges = await db.select({
    id: challenges.id,
    title: challenges.title,
    currentValue: challenges.currentValue,
    goalValue: challenges.goalValue,
  }).from(challenges);
  
  const results: Array<{
    id: number;
    title: string;
    oldValue: number;
    newValue: number;
    diff: number;
  }> = [];
  
  for (const challenge of allChallenges) {
    // participationsテーブルから実際の参加者数を計算
    const participationList = await db.select({
      contribution: participations.contribution,
      companionCount: participations.companionCount,
    }).from(participations).where(eq(participations.challengeId, challenge.id));
    
    // 実際の合計を計算（contribution + companionCount）
    const actualValue = participationList.reduce((sum, p) => {
      return sum + (p.contribution || 1) + (p.companionCount || 0);
    }, 0);
    
    const oldValue = challenge.currentValue || 0;
    const diff = actualValue - oldValue;
    
    // 差分がある場合のみ更新
    if (diff !== 0) {
      await db.update(challenges)
        .set({ currentValue: actualValue })
        .where(eq(challenges.id, challenge.id));
      
      results.push({
        id: challenge.id,
        title: challenge.title,
        oldValue,
        newValue: actualValue,
        diff,
      });
    }
  }
  
  invalidateEventsCache();
  return results;
}

/**
 * データ整合性レポートを取得（修正なし、確認のみ）
 */
export async function getDataIntegrityReport() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 全チャレンジを取得
  const allChallenges = await db.select({
    id: challenges.id,
    title: challenges.title,
    hostName: challenges.hostName,
    hostUsername: challenges.hostUsername,
    currentValue: challenges.currentValue,
    goalValue: challenges.goalValue,
    status: challenges.status,
    eventDate: challenges.eventDate,
  }).from(challenges).orderBy(desc(challenges.id));
  
  const report: Array<{
    id: number;
    title: string;
    hostName: string;
    hostUsername: string | null;
    status: string;
    eventDate: Date;
    goalValue: number;
    storedCurrentValue: number;
    actualParticipantCount: number;
    actualTotalContribution: number;
    hasDiscrepancy: boolean;
    discrepancyAmount: number;
    participationBreakdown: {
      totalParticipations: number;
      totalContribution: number;
      totalCompanions: number;
    };
  }> = [];
  
  for (const challenge of allChallenges) {
    // participationsテーブルから実際の参加者数を計算
    const participationList = await db.select({
      id: participations.id,
      contribution: participations.contribution,
      companionCount: participations.companionCount,
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
        totalCompanions,
      },
    });
  }
  
  // サマリー統計
  const summary = {
    totalChallenges: report.length,
    challengesWithDiscrepancy: report.filter(r => r.hasDiscrepancy).length,
    totalStoredValue: report.reduce((sum, r) => sum + r.storedCurrentValue, 0),
    totalActualValue: report.reduce((sum, r) => sum + r.actualTotalContribution, 0),
    totalDiscrepancy: report.reduce((sum, r) => sum + r.discrepancyAmount, 0),
  };
  
  return { summary, challenges: report };
}


// ========== DB構造確認 ==========

// 本番DBのテーブル一覧とカラム構造を取得
export async function getDbSchema() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    // テーブル一覧を取得
    const tablesResult = await db.execute(sql`SHOW TABLES`);
    const tables = (tablesResult[0] as unknown as any[]).map((row: any) => Object.values(row)[0] as string);
    
    // 各テーブルのカラム構造を取得
    const schema: Record<string, any[]> = {};
    for (const tableName of tables) {
      const columnsResult = await db.execute(sql.raw(`DESCRIBE \`${tableName}\``));
      schema[tableName] = columnsResult[0] as unknown as any[];
    }
    
    return { tables, schema };
  } catch (error) {
    console.error("[DB Schema] Error:", error);
    throw error;
  }
}

// コードのスキーマと本番DBの比較
export async function compareSchemas() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // コードで定義されているchallengesテーブルのカラム
  const codeColumns = [
    "id", "hostUserId", "hostTwitterId", "hostName", "hostUsername", "hostProfileImage",
    "hostFollowersCount", "hostDescription", "title", "slug", "description", "goalType",
    "goalValue", "goalUnit", "currentValue", "eventType", "categoryId", "eventDate",
    "venue", "prefecture", "ticketPresale", "ticketDoor", "ticketSaleStart", "ticketUrl",
    "externalUrl", "status", "isPublic", "createdAt", "updatedAt",
    "aiSummary", "intentTags", "regionSummary", "participantSummary", "aiSummaryUpdatedAt"
  ];
  
  try {
    // 本番DBのchallengesテーブルのカラムを取得
    const columnsResult = await db.execute(sql`DESCRIBE challenges`);
    const dbColumns = (columnsResult[0] as unknown as any[]).map((row: any) => row.Field);
    
    // 比較
    const missingInDb = codeColumns.filter(col => !dbColumns.includes(col));
    const extraInDb = dbColumns.filter((col: string) => !codeColumns.includes(col));
    const matching = codeColumns.filter(col => dbColumns.includes(col));
    
    return {
      codeColumns,
      dbColumns,
      missingInDb,  // コードにあるがDBにないカラム
      extraInDb,    // DBにあるがコードにないカラム
      matching,     // 両方にあるカラム
      isMatching: missingInDb.length === 0 && extraInDb.length === 0,
    };
  } catch (error) {
    console.error("[Compare Schemas] Error:", error);
    throw error;
  }
}
