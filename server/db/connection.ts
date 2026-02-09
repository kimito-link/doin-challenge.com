import { eq, desc, and, sql, isNull, or, gte, lte, lt, inArray, asc, ne, like, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../../drizzle/schema";

import { MySql2Database } from "drizzle-orm/mysql2";

// DB接続プールの型定義
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DrizzleDB = MySql2Database<typeof schema>;
let _db: DrizzleDB | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // 接続プールの設定を追加（タイムアウト、リトライ、接続数の制限）
      const poolConnection = mysql.createPool(process.env.DATABASE_URL, {
        // 接続プールの設定
        connectionLimit: 10, // 最大接続数
        queueLimit: 0, // キュー制限なし
        
        // タイムアウト設定
        connectTimeout: 10000, // 10秒
        acquireTimeout: 10000, // 10秒
        timeout: 10000, // 10秒
        
        // 接続の再試行
        reconnect: true,
        maxReconnects: 3,
        reconnectDelay: 1000, // 1秒
        
        // 接続の検証
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        
        // SSL設定（本番環境ではSSL接続を推奨）
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
      });
      
      // 接続エラーのハンドリング
      poolConnection.on("connection", (connection) => {
        console.log("[Database] New connection established");
      });
      
      poolConnection.on("error", (err) => {
        console.error("[Database] Pool error:", err);
        // 接続エラーが発生した場合、接続をリセット
        if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNREFUSED") {
          _db = null;
        }
      });
      
      _db = drizzle(poolConnection, { schema, mode: "default" });
      
      // 接続テストを実行
      try {
        await poolConnection.query("SELECT 1");
        console.log("[Database] Connection pool initialized successfully");
      } catch (testError) {
        console.error("[Database] Connection test failed:", testError);
        // 接続テストに失敗した場合でも、プールは作成済みなので続行
      }
    } catch (error) {
      console.error("[Database] Failed to create connection pool:", error);
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
