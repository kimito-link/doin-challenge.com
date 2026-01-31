import { getDb, eq, desc, sql } from "./connection";
import { generateSlug } from "./connection";
import { challenges, InsertChallenge } from "../../drizzle/schema";

// 後方互換性のためのエイリアス
const events = challenges;
type InsertEvent = InsertChallenge;

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


/**
 * チャレンジを検索
 */
export async function searchChallenges(query: string) {
  const db = await getDb();
  if (!db) return [];
  
  // 検索クエリを正規化
  const normalizedQuery = query.toLowerCase().trim();
  
  // 全チャレンジを取得してフィルタリング
  const allChallenges = await db.select().from(challenges).where(eq(challenges.isPublic, true)).orderBy(desc(challenges.eventDate));
  
  // タイトル、ホスト名、説明文で検索
  return allChallenges.filter(c => {
    const title = (c.title || "").toLowerCase();
    const hostName = (c.hostName || "").toLowerCase();
    const description = (c.description || "").toLowerCase();
    const venue = (c.venue || "").toLowerCase();
    
    return title.includes(normalizedQuery) ||
           hostName.includes(normalizedQuery) ||
           description.includes(normalizedQuery) ||
           venue.includes(normalizedQuery);
  });
}

/**
 * v6.174: 性別統計付きで全イベントを取得
 * 
 * Gate 1 + こまめなバージョン管理のワークフローに従って実装
 * 
 * このバージョンでは、データベース層のみを実装：
 * - 性別統計を集計するSQLクエリ
 * - キャッシュ機能は既存のgetAllEvents()と同じ仕組みを使用
 * 
 * 次のバージョン（v6.175）で、API層（events.ts）に統合予定
 */
export async function getAllEventsWithGenderStats() {
  const now = Date.now();
  
  // キャッシュが有効なら即座に返す
  if (eventsCache.data && (now - eventsCache.timestamp) < EVENTS_CACHE_TTL) {
    return eventsCache.data;
  }
  
  const db = await getDb();
  if (!db) return eventsCache.data ?? [];
  
  // 性別統計を集計するSQLクエリ
  const result = await db.execute(sql`
    SELECT 
      c.*,
      COUNT(CASE WHEN p.gender = 'male' THEN 1 END) as maleCount,
      COUNT(CASE WHEN p.gender = 'female' THEN 1 END) as femaleCount,
      COUNT(CASE WHEN p.gender = 'unspecified' THEN 1 END) as unspecifiedCount,
      COUNT(p.id) as totalParticipants
    FROM challenges c
    LEFT JOIN participations p ON c.id = p.challengeId AND p.deletedAt IS NULL
    WHERE c.isPublic = true
    GROUP BY c.id
    ORDER BY c.eventDate DESC
  `);
  
  // キャッシュを更新
  const rows = (result as any)[0] as any[];
  eventsCache = { data: rows, timestamp: now };
  
  return rows;
}
