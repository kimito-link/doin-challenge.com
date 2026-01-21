/**
 * server/db/participation-db.ts
 * 
 * 参加登録関連のデータベース操作
 * 
 * v6.40: ソフトデリート対応
 * - 全てのSELECTクエリで deletedAt IS NULL 条件を追加
 * - softDeleteParticipation 関数を追加
 */

import { getDb, eq, desc, sql, isNull, and } from "./connection";
import { participations, challenges, InsertParticipation } from "../../drizzle/schema";
import { invalidateEventsCache } from "./challenge-db";

// =============================================================================
// 参加者取得（ソフトデリート対応）
// =============================================================================

/**
 * イベントの参加者一覧を取得（削除済みを除く）
 */
export async function getParticipationsByEventId(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(participations)
    .where(and(
      eq(participations.challengeId, eventId),
      isNull(participations.deletedAt)
    ))
    .orderBy(desc(participations.createdAt));
}

/**
 * ユーザーの参加一覧を取得（削除済みを除く）
 */
export async function getParticipationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(participations)
    .where(and(
      eq(participations.userId, userId),
      isNull(participations.deletedAt)
    ))
    .orderBy(desc(participations.createdAt));
}

/**
 * 参加IDで取得（削除済みも含む - 管理者用）
 */
export async function getParticipationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(participations).where(eq(participations.id, id));
  return result[0] || null;
}

/**
 * 参加IDで取得（削除済みを除く）
 */
export async function getActiveParticipationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(participations)
    .where(and(
      eq(participations.id, id),
      isNull(participations.deletedAt)
    ));
  return result[0] || null;
}

// =============================================================================
// 参加登録・更新
// =============================================================================

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

// =============================================================================
// 削除（ソフトデリート / 物理削除）
// =============================================================================

/**
 * ソフトデリート（削除フラグを立てる）
 * @param id 参加ID
 * @param deletedByUserId 削除を実行したユーザーID
 */
export async function softDeleteParticipation(id: number, deletedByUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 削除前に参加情報を取得
  const participation = await db.select().from(participations).where(eq(participations.id, id));
  const p = participation[0];
  
  if (!p) {
    throw new Error("Participation not found");
  }
  
  // ソフトデリート実行
  await db.update(participations)
    .set({
      deletedAt: new Date(),
      deletedBy: deletedByUserId,
    })
    .where(eq(participations.id, id));
  
  // challengesのcurrentValueを減少
  if (p.challengeId) {
    const contribution = (p.contribution || 1) + (p.companionCount || 0);
    await db.update(challenges)
      .set({ currentValue: sql`GREATEST(${challenges.currentValue} - ${contribution}, 0)` })
      .where(eq(challenges.id, p.challengeId));
    invalidateEventsCache();
  }
  
  return { success: true, challengeId: p.challengeId };
}

/**
 * 物理削除（完全に削除）- 管理者用または古いデータのクリーンアップ用
 */
export async function deleteParticipation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 削除前に参加情報を取得
  const participation = await db.select().from(participations).where(eq(participations.id, id));
  const p = participation[0];
  
  await db.delete(participations).where(eq(participations.id, id));
  
  // challengesのcurrentValueを減少（まだ削除されていない場合のみ）
  if (p && p.challengeId && !p.deletedAt) {
    const contribution = (p.contribution || 1) + (p.companionCount || 0);
    await db.update(challenges)
      .set({ currentValue: sql`GREATEST(${challenges.currentValue} - ${contribution}, 0)` })
      .where(eq(challenges.id, p.challengeId));
    invalidateEventsCache();
  }
}

// =============================================================================
// 統計・集計（ソフトデリート対応）
// =============================================================================

export async function getParticipationCountByEventId(eventId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(participations)
    .where(and(
      eq(participations.challengeId, eventId),
      isNull(participations.deletedAt)
    ));
  return result.length;
}

export async function getTotalCompanionCountByEventId(eventId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(participations)
    .where(and(
      eq(participations.challengeId, eventId),
      isNull(participations.deletedAt)
    ));
  return result.reduce((sum, p) => sum + (p.contribution || 1), 0);
}

// 地域別の参加者数を取得
export async function getParticipationsByPrefecture(challengeId: number) {
  const db = await getDb();
  if (!db) return {};
  
  const result = await db.select().from(participations)
    .where(and(
      eq(participations.challengeId, challengeId),
      isNull(participations.deletedAt)
    ));
  
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
    .where(and(
      eq(participations.challengeId, challengeId),
      isNull(participations.deletedAt)
    ))
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
    .where(sql`${participations.challengeId} = ${challengeId} AND ${participations.prefecture} = ${prefecture} AND ${participations.deletedAt} IS NULL`)
    .orderBy(desc(participations.createdAt));
}

// 都道府県ランキングを取得
export async function getPrefectureRanking(challengeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(participations)
    .where(and(
      eq(participations.challengeId, challengeId),
      isNull(participations.deletedAt)
    ));
  
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
