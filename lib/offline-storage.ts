/**
 * オフライン対応のためのストレージヘルパー
 * AsyncStorageを使ったデータキャッシュ
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "./logger";

/**
 * ストレージキーのプレフィックス
 */
const STORAGE_PREFIX = "@birthday-celebration:";

/**
 * キャッシュエントリ
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

/**
 * ストレージヘルパー
 */
export class OfflineStorage {
  /**
   * データを保存
   */
  static async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
      };

      await AsyncStorage.setItem(
        `${STORAGE_PREFIX}${key}`,
        JSON.stringify(entry)
      );
    } catch (error) {
      logger.error("Failed to save to storage", { data: { key, error } });
    }
  }

  /**
   * データを取得
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);

      // 有効期限チェック
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        await this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      logger.error("Failed to get from storage", { data: { key, error } });
      return null;
    }
  }

  /**
   * データを削除
   */
  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch (error) {
      logger.error("Failed to remove from storage", { data: { key, error } });
    }
  }

  /**
   * すべてのデータをクリア
   */
  static async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter((key) => key.startsWith(STORAGE_PREFIX));
      await AsyncStorage.multiRemove(appKeys);
      logger.info("Storage cleared");
    } catch (error) {
      logger.error("Failed to clear storage", { data: { error } });
    }
  }

  /**
   * キャッシュのサイズを取得（バイト）
   */
  static async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter((key) => key.startsWith(STORAGE_PREFIX));
      const items = await AsyncStorage.multiGet(appKeys);

      let totalSize = 0;
      for (const [key, value] of items) {
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }

      return totalSize;
    } catch (error) {
      logger.error("Failed to get cache size", { data: { error } });
      return 0;
    }
  }

  /**
   * 期限切れのキャッシュを削除
   */
  static async clearExpired(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter((key) => key.startsWith(STORAGE_PREFIX));
      const items = await AsyncStorage.multiGet(appKeys);

      const expiredKeys: string[] = [];
      const now = Date.now();

      for (const [key, value] of items) {
        if (value) {
          try {
            const entry: CacheEntry<any> = JSON.parse(value);
            if (entry.expiresAt && now > entry.expiresAt) {
              expiredKeys.push(key);
            }
          } catch {
            // パースエラーの場合は削除
            expiredKeys.push(key);
          }
        }
      }

      if (expiredKeys.length > 0) {
        await AsyncStorage.multiRemove(expiredKeys);
        logger.debug(`Cleared ${expiredKeys.length} expired cache entries`);
      }
    } catch (error) {
      logger.error("Failed to clear expired cache", { data: { error } });
    }
  }
}

/**
 * チャレンジデータのキャッシュキー
 */
export const CACHE_KEYS = {
  CHALLENGES: "challenges",
  CHALLENGE_DETAIL: (id: number) => `challenge:${id}`,
  RANKINGS: "rankings",
  CATEGORIES: "categories",
  USER_PROFILE: "user:profile",
  USER_CHALLENGES: (userId: string) => `user:${userId}:challenges`,
  FAVORITES: "favorites",
} as const;

/**
 * キャッシュの有効期限（ミリ秒）
 */
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5分
  MEDIUM: 30 * 60 * 1000, // 30分
  LONG: 24 * 60 * 60 * 1000, // 24時間
  WEEK: 7 * 24 * 60 * 60 * 1000, // 7日
} as const;

/**
 * チャレンジデータをキャッシュ
 */
export async function cacheChallenges(challenges: any[]): Promise<void> {
  await OfflineStorage.set(CACHE_KEYS.CHALLENGES, challenges, CACHE_TTL.MEDIUM);
}

/**
 * キャッシュからチャレンジデータを取得
 */
export async function getCachedChallenges(): Promise<any[] | null> {
  return await OfflineStorage.get<any[]>(CACHE_KEYS.CHALLENGES);
}

/**
 * チャレンジ詳細をキャッシュ
 */
export async function cacheChallengeDetail(id: number, challenge: any): Promise<void> {
  await OfflineStorage.set(CACHE_KEYS.CHALLENGE_DETAIL(id), challenge, CACHE_TTL.LONG);
}

/**
 * キャッシュからチャレンジ詳細を取得
 */
export async function getCachedChallengeDetail(id: number): Promise<any | null> {
  return await OfflineStorage.get<any>(CACHE_KEYS.CHALLENGE_DETAIL(id));
}

/**
 * お気に入りをキャッシュ
 */
export async function cacheFavorites(favorites: number[]): Promise<void> {
  await OfflineStorage.set(CACHE_KEYS.FAVORITES, favorites, CACHE_TTL.WEEK);
}

/**
 * キャッシュからお気に入りを取得
 */
export async function getCachedFavorites(): Promise<number[] | null> {
  return await OfflineStorage.get<number[]>(CACHE_KEYS.FAVORITES);
}
