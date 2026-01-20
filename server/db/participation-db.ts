import { getDb, eq, desc, sql } from "./connection";
import { participations, challenges, InsertParticipation } from "../../drizzle/schema";
import { invalidateEventsCache } from "./challenge-db";

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

// 都道府県フィルターで参加者を取得
export async function getParticipationsByPrefectureFilter(challengeId: number, prefecture: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(participations)
    .where(sql`${participations.challengeId} = ${challengeId} AND ${participations.prefecture} = ${prefecture}`)
    .orderBy(desc(participations.createdAt));
}

// 都道府県ランキングを取得
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
