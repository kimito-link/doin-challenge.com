import { eq, desc, and, sql, isNull, or, gte, lte, lt, inArray, asc, ne, like, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
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

// Re-export drizzle operators for convenience
export { eq, desc, and, sql, isNull, or, gte, lte, lt, inArray, asc, ne, like, count };
